import { createClient } from "@/lib/supabase/server";
import type {
  UserFilters,
  Profile,
  ProfileWithRelations,
  UserManagementStats,
  UserSecuritySettings,
  UserSession,
  LoginRecord,
  UserActivity,
  UserRole,
  RoleWithPermissions,
  UserRoleType
} from "./users-types";

/**
 * Get all users/profiles
 */
export async function getUsers(filters: UserFilters = {}) {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  let query = supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  // Apply filters
  if (filters.search) {
    query = query.or(
      `email.ilike.%${filters.search}%,display_name.ilike.%${filters.search}%,username.ilike.%${filters.search}%,first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%`,
    );
  }
  if (filters.isActive !== undefined) {
    query = query.eq("is_active", filters.isActive);
  }
  if (filters.status) {
    switch (filters.status) {
      case 'active':
        query = query.eq("is_active", true);
        break;
      case 'inactive':
        query = query.eq("is_active", false);
        break;
      case 'suspended':
        // Assuming suspended users have deleted_at set
        query = query.not("deleted_at", "is", null);
        break;
    }
  }
  if (filters.verified !== undefined) {
    query = query.eq("is_verified", filters.verified);
  }
  if (filters.created_after) {
    query = query.gte("created_at", filters.created_after);
  }
  if (filters.created_before) {
    query = query.lte("created_at", filters.created_before);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as Profile[];
}

/**
 * Get single user by ID
 */
export async function getUserById(userId: string) {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Get profile with user roles
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (profileError) throw profileError;

  // Get user roles
  const { data: roles, error: rolesError } = await supabase
    .from("user_roles")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true);

  if (rolesError) throw rolesError;

  return {
    ...profile,
    user_roles: roles
  } as ProfileWithRelations;
}

/**
 * Get current user profile
 */
export async function getCurrentUser() {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) throw error;
  return data as ProfileWithRelations;
}

/**
 * Get users with their roles
 */
export async function getUsersWithRoles(filters: UserFilters = {}) {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Get profiles
  const profiles = await getUsers(filters);

  // Get all user roles for these profiles
  const userIds = profiles.map(p => p.id);
  const { data: roles, error: rolesError } = await supabase
    .from("user_roles")
    .select("*")
    .in("user_id", userIds)
    .eq("is_active", true);

  if (rolesError) throw rolesError;

  // Map roles to users
  const usersWithRoles = profiles.map(profile => {
    const userRoles = roles?.filter(r => profile.id && r.user_id === profile.id) || [];
    return {
      ...profile,
      user_roles: userRoles,
      role: userRoles[0]?.role // Primary role
    };
  });

  // Apply role filter if specified
  if (filters.role && filters.role !== 'all') {
    return usersWithRoles.filter(u => u.role === filters.role);
  }

  return usersWithRoles;
}

/**
 * Get user management statistics
 */
export async function getUserManagementStats(): Promise<UserManagementStats> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Get total users
  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  // Get active users
  const { count: activeUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  // Get new users today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { count: newUsersToday } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .gte("created_at", today.toISOString());

  // Get new users this week
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const { count: newUsersWeek } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .gte("created_at", weekAgo.toISOString());

  // Get suspended users
  const { count: suspendedUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .not("deleted_at", "is", null);

  // Get pending verifications
  const { count: pendingVerifications } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("is_verified", false);

  // Get users by role
  const { data: roleData } = await supabase
    .from("user_roles")
    .select("role")
    .eq("is_active", true);

  const usersByRole = roleData?.reduce((acc, { role }) => {
    if (role) {
      acc[role] = (acc[role] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>) || {};

  return {
    total_users: totalUsers || 0,
    active_users: activeUsers || 0,
    new_users_today: newUsersToday || 0,
    new_users_week: newUsersWeek || 0,
    suspended_users: suspendedUsers || 0,
    pending_verifications: pendingVerifications || 0,
    users_by_role: usersByRole,
    active_sessions: 0 // Would need session tracking
  };
}

/**
 * Get user's security settings
 */
export async function getUserSecuritySettings(userId: string): Promise<UserSecuritySettings> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Get user profile
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("password_changed_at, metadata")
    .eq("id", userId)
    .single();

  if (error) throw error;

  // Build security settings from profile metadata
  const metadata = profile?.metadata as any || {};

  return {
    user_id: userId,
    two_factor_enabled: metadata.two_factor_enabled || false,
    two_factor_method: metadata.two_factor_method,
    password_last_changed: profile?.password_changed_at,
    require_password_change: metadata.require_password_change || false,
    active_sessions: [], // Would need session tracking
    api_keys: [], // Would need API key table
    login_history: [] // Would need audit log parsing
  };
}

/**
 * Get user's activity history
 */
export async function getUserActivity(userId: string, limit = 50): Promise<UserActivity[]> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // TODO: Get from audit logs when audit_logs table is available
  // const { data, error } = await supabase
  //   .from("audit_logs")
  //   .select("*")
  //   .eq("user_id", userId)
  //   .order("created_at", { ascending: false })
  //   .limit(limit);

  // if (error) throw error;

  // Mock implementation - return empty array until audit_logs table exists
  return [];
}

/**
 * Get available roles
 */
export async function getAvailableRoles(): Promise<RoleWithPermissions[]> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Define system roles with their permissions
  const systemRoles: RoleWithPermissions[] = [
    {
      id: 'super_admin',
      name: 'super_admin',
      display_name: 'Super Admin',
      description: 'Full system access',
      permissions: [
        { resource: 'all', actions: ['create', 'read', 'update', 'delete'] }
      ],
      hierarchy_level: 1,
      is_system: true,
      is_custom: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'platform_admin',
      name: 'platform_admin',
      display_name: 'Admin',
      description: 'Platform administration',
      permissions: [
        { resource: 'users', actions: ['create', 'read', 'update', 'delete'] },
        { resource: 'salons', actions: ['create', 'read', 'update', 'delete'] },
        { resource: 'settings', actions: ['read', 'update'] }
      ],
      hierarchy_level: 2,
      is_system: true,
      is_custom: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'salon_owner',
      name: 'salon_owner',
      display_name: 'Salon Owner',
      description: 'Salon owner with full salon access',
      permissions: [
        { resource: 'salon', actions: ['read', 'update'] },
        { resource: 'staff', actions: ['create', 'read', 'update', 'delete'] },
        { resource: 'services', actions: ['create', 'read', 'update', 'delete'] },
        { resource: 'appointments', actions: ['create', 'read', 'update', 'delete'] }
      ],
      hierarchy_level: 3,
      is_system: true,
      is_custom: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'salon_manager',
      name: 'salon_manager',
      display_name: 'Manager',
      description: 'Salon manager with operational access',
      permissions: [
        { resource: 'staff', actions: ['read', 'update'] },
        { resource: 'services', actions: ['read', 'update'] },
        { resource: 'appointments', actions: ['create', 'read', 'update'] }
      ],
      hierarchy_level: 4,
      is_system: true,
      is_custom: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'staff',
      name: 'staff',
      display_name: 'Staff',
      description: 'Service provider',
      permissions: [
        { resource: 'appointments', actions: ['read', 'update'] },
        { resource: 'profile', actions: ['read', 'update'] }
      ],
      hierarchy_level: 5,
      is_system: true,
      is_custom: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'customer',
      name: 'customer',
      display_name: 'Customer',
      description: 'Service customer',
      permissions: [
        { resource: 'appointments', actions: ['create', 'read'] },
        { resource: 'profile', actions: ['read', 'update'] }
      ],
      hierarchy_level: 6,
      is_system: true,
      is_custom: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  return systemRoles;
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<Profile | null> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", email)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to fetch user: ${error.message}`);
  }

  return data as Profile;
}

/**
 * Get user role
 */
export async function getUserRole(userId: string): Promise<UserRoleType | null> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to fetch user role: ${error.message}`);
  }

  return data?.role as UserRoleType;
}

/**
 * Get user metrics
 */
export async function getUserMetrics(userId: string) {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Get profile data
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (profileError) throw profileError;

  // Get activity count from audit logs
  // TODO: Replace with actual audit log implementation when available
  const activityCount = 0;
  const lastLoginLog = null;

  return {
    user_id: userId,
    total_activities: activityCount || 0,
    last_active: lastLoginLog?.created_at || profile?.updated_at,
    profile_completion: calculateProfileCompletion(profile),
    account_status: profile?.is_active ? 'active' : 'inactive',
    verification_status: profile?.is_verified ? 'verified' : 'pending'
  };
}

function calculateProfileCompletion(profile: any): number {
  const fields = [
    'email',
    'display_name',
    'first_name',
    'last_name',
    'phone',
    'avatar_url',
    'bio'
  ];

  const filledFields = fields.filter(field => profile?.[field]);
  return Math.round((filledFields.length / fields.length) * 100);
}
