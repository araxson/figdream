/**
 * Admin Data Access Layer
 * Secure data operations with super admin authentication
 */

import { createClient } from '@/lib/supabase/server';
import {
  adaptUserData,
  adaptSalonData,
  adaptAuditLog,
  isSelectQueryError
} from '@/core/shared/dal/database-adapters';
import type {
  AdminDashboardStats,
  PlatformUser,
  PlatformSalon,
  SystemHealthMetrics,
  AdminAuditLog,
  AdminFilters
} from '../types';

/**
 * Verify super admin access
 */
async function verifySuperAdmin() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Authentication required');
  }

  // Check if user is super admin via user_roles table
  const { data: userRole, error: userError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (userError || userRole?.role !== 'super_admin') {
    throw new Error('Super admin access required');
  }

  return user;
}

/**
 * Log admin action for audit trail
 */
async function logAdminAction(
  adminUserId: string,
  action: string,
  resourceType: string,
  resourceId: string | null = null,
  oldValues: unknown = null,
  newValues: unknown = null
) {
  const supabase = await createClient();

  // Get request info (this would typically come from request headers)
  const ipAddress = '0.0.0.0'; // TODO: Get from request
  const userAgent = 'Admin Dashboard'; // TODO: Get from request

  // Audit logs table might not exist - handle gracefully
  try {
    await supabase
      .from('audit_logs' as any)
      .insert({
      action,
      entity_type: resourceType,
      entity_id: resourceId,
      old_data: oldValues,
      new_data: newValues,
        user_agent: userAgent
      });
  } catch (error) {
    console.warn('Audit log insert failed:', error);
  }
}

/**
 * Get platform dashboard statistics
 */
export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const adminUser = await verifySuperAdmin();
  const supabase = await createClient();

  try {
    // Get user count from profiles (mirrors auth.users)
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Get salon count
    const { count: totalSalons } = await supabase
      .from('salons')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Get appointment count (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { count: totalAppointments } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo.toISOString());

    // Get revenue (last 30 days) - appointments don't have total_amount
    // Use a placeholder for now
    const totalRevenue = 0; // TODO: Join with billing table when available

    // Get active subscriptions - counting active salons for now
    const { count: activeSubscriptions } = await supabase
      .from('salons')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Calculate growth rates (comparing to previous 30 days)
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const { count: previousUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .lt('created_at', thirtyDaysAgo.toISOString())
      .gte('created_at', sixtyDaysAgo.toISOString());

    const { count: previousSalons } = await supabase
      .from('salons')
      .select('*', { count: 'exact', head: true })
      .lt('created_at', thirtyDaysAgo.toISOString())
      .gte('created_at', sixtyDaysAgo.toISOString());

    // Mock system metrics (would integrate with monitoring service)
    const systemMetrics = {
      uptime: 99.9,
      responseTime: 250,
      errorRate: 0.01
    };

    const monthlyGrowth = {
      users: previousUsers ? ((totalUsers || 0) - previousUsers) / previousUsers * 100 : 0,
      salons: previousSalons ? ((totalSalons || 0) - previousSalons) / previousSalons * 100 : 0,
      revenue: 15.5 // This would be calculated from revenue data
    };

    // Determine platform health
    let platformHealth: "healthy" | "warning" | "critical" = "healthy";
    if (systemMetrics.errorRate > 0.05 || systemMetrics.responseTime > 1000) {
      platformHealth = "warning";
    }
    if (systemMetrics.errorRate > 0.1 || systemMetrics.responseTime > 2000) {
      platformHealth = "critical";
    }

    await logAdminAction(
      adminUser.id,
      'view_dashboard_stats',
      'admin_dashboard'
    );

    return {
      totalUsers: totalUsers || 0,
      totalSalons: totalSalons || 0,
      totalAppointments: totalAppointments || 0,
      totalRevenue,
      activeSubscriptions: activeSubscriptions || 0,
      platformHealth,
      monthlyGrowth,
      systemMetrics
    };

  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    throw new Error('Failed to fetch dashboard statistics');
  }
}

/**
 * Get platform users with filtering and pagination
 */
export async function getPlatformUsers(filters: AdminFilters = {}): Promise<{
  users: PlatformUser[];
  totalCount: number;
  totalPages: number;
}> {
  const adminUser = await verifySuperAdmin();
  const supabase = await createClient();

  const page = filters.page || 1;
  const limit = filters.limit || 25;
  const offset = (page - 1) * limit;

  try {
    let query = supabase
      .from('profiles')
      .select(`
        id,
        user_id,
        email,
        created_at,
        updated_at,
        full_name,
        avatar_url,
        phone,
        is_verified,
        user_roles:user_roles(id, role, salon_id, granted_at, granted_by, expires_at, is_active)
      `, { count: 'exact' });

    // Apply filters
    if (filters.search) {
      query = query.or(`email.ilike.%${filters.search}%,full_name.ilike.%${filters.search}%`);
    }

    if (filters.status) {
      switch (filters.status) {
        case 'active':
          query = query.eq('is_verified', true);
          break;
        case 'inactive':
          query = query.eq('is_verified', false);
          break;
        case 'pending_verification':
          query = query.eq('is_verified', false);
          break;
      }
    }

    if (filters.date_range) {
      query = query
        .gte('created_at', filters.date_range.start)
        .lte('created_at', filters.date_range.end);
    }

    // Apply sorting
    const sortBy = filters.sort_by || 'created_at';
    const sortOrder = filters.sort_order || 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    // Transform data to match PlatformUser interface
    const users: PlatformUser[] = (data || []).map(user => {
      const adaptedUser = adaptUserData(user);
      return {
      id: adaptedUser.user_id || adaptedUser.id,
      email: adaptedUser.email,
      created_at: adaptedUser.created_at,
      updated_at: adaptedUser.updated_at,
      last_sign_in_at: adaptedUser.last_active_at || null,
      email_confirmed_at: adaptedUser.is_verified ? adaptedUser.created_at : null,
      banned_until: adaptedUser.banned_until || null,
      deleted_at: null,
      is_super_admin: Array.isArray(adaptedUser.user_roles) && adaptedUser.user_roles.some((r: any) => r.role_name === 'super_admin' || r.role === 'super_admin') || false,
      profile: {
        full_name: adaptedUser.full_name || '',
        avatar_url: adaptedUser.avatar_url,
        phone: adaptedUser.phone
      },
      roles: Array.isArray(adaptedUser.user_roles) ? adaptedUser.user_roles : [],
      salon_associations: [], // TODO: Implement salon associations lookup
      last_activity: adaptedUser.updated_at || null,
      status: adaptedUser.is_verified ? 'active' : 'pending_verification'
    };
    });

    await logAdminAction(
      adminUser.id,
      'list_platform_users',
      'users',
      null,
      null,
      { filters, count }
    );

    return {
      users,
      totalCount: count || 0,
      totalPages: Math.ceil((count || 0) / limit)
    };

  } catch (error) {
    console.error('Error fetching platform users:', error);
    throw new Error('Failed to fetch platform users');
  }
}

/**
 * Get platform salons with filtering and pagination
 */
export async function getPlatformSalons(filters: AdminFilters = {}): Promise<{
  salons: PlatformSalon[];
  totalCount: number;
  totalPages: number;
}> {
  const adminUser = await verifySuperAdmin();
  const supabase = await createClient();

  const page = filters.page || 1;
  const limit = filters.limit || 25;
  const offset = (page - 1) * limit;

  try {
    let query = supabase
      .from('salons')
      .select(`
        id,
        name,
        slug,
        business_name,
        business_type,
        owner_id,
        email,
        phone,
        address,
        subscription_tier,
        subscription_expires_at,
        is_active,
        is_verified,
        is_featured,
        created_at,
        updated_at,
        verified_at,
        total_bookings,
        total_revenue,
        rating_average,
        rating_count,
        employee_count,
        owner:profiles!owner_id(email, full_name)
      `, { count: 'exact' });

    // Apply filters
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,business_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
    }

    if (filters.status) {
      switch (filters.status) {
        case 'active':
          query = query.eq('is_active', true);
          break;
        case 'inactive':
          query = query.eq('is_active', false);
          break;
        case 'verified':
          query = query.eq('is_verified', true);
          break;
        case 'unverified':
          query = query.eq('is_verified', false);
          break;
      }
    }

    if (filters.salon_tier) {
      query = query.eq('subscription_tier', filters.salon_tier);
    }

    if (filters.date_range) {
      query = query
        .gte('created_at', filters.date_range.start)
        .lte('created_at', filters.date_range.end);
    }

    // Apply sorting
    const sortBy = filters.sort_by || 'created_at';
    const sortOrder = filters.sort_order || 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    // Transform data to match PlatformSalon interface
    const salons: PlatformSalon[] = (data || []).map(salon => {
      const adaptedSalon = adaptSalonData(salon);
      return {
      ...adaptedSalon,
      stats: {
        total_bookings: adaptedSalon.total_bookings || 0,
        total_revenue: adaptedSalon.total_revenue || 0,
        rating_average: adaptedSalon.rating_average || 0,
        rating_count: adaptedSalon.rating_count || 0,
        employee_count: adaptedSalon.employee_count || 0
      },
      subscription_status: adaptedSalon.subscription_expires_at && new Date(adaptedSalon.subscription_expires_at) > new Date()
        ? 'active'
        : adaptedSalon.subscription_tier === 'free'
        ? 'active'
        : 'expired'
    };
    });

    await logAdminAction(
      adminUser.id,
      'list_platform_salons',
      'salons',
      null,
      null,
      { filters, count }
    );

    return {
      salons,
      totalCount: count || 0,
      totalPages: Math.ceil((count || 0) / limit)
    };

  } catch (error) {
    console.error('Error fetching platform salons:', error);
    throw new Error('Failed to fetch platform salons');
  }
}

/**
 * Get system health metrics
 */
export async function getSystemHealthMetrics(): Promise<SystemHealthMetrics> {
  await verifySuperAdmin();

  // Mock system health data (would integrate with monitoring service)
  return {
    timestamp: new Date().toISOString(),
    cpu_usage: 45.2,
    memory_usage: 68.7,
    disk_usage: 32.1,
    active_connections: 1250,
    response_time_avg: 285,
    error_rate: 0.02,
    uptime_percentage: 99.94,
    database_status: 'healthy',
    storage_status: 'healthy',
    api_status: 'healthy'
  };
}

/**
 * Get admin audit logs
 */
export async function getAdminAuditLogs(filters: AdminFilters = {}): Promise<{
  logs: AdminAuditLog[];
  totalCount: number;
  totalPages: number;
}> {
  const adminUser = await verifySuperAdmin();
  const supabase = await createClient();

  const page = filters.page || 1;
  const limit = filters.limit || 50;
  const offset = (page - 1) * limit;

  try {
    // Use auth.audit_log_entries table instead
    let query = supabase
      .from('auth.audit_log_entries')
      .select(`
        id,
        payload,
        created_at,
        ip_address
      `, { count: 'exact' });

    // Apply filters
    if (filters.search) {
      query = query.or(`action.ilike.%${filters.search}%,resource_type.ilike.%${filters.search}%`);
    }

    if (filters.date_range) {
      query = query
        .gte('created_at', filters.date_range.start)
        .lte('created_at', filters.date_range.end);
    }

    // Apply sorting
    const sortBy = filters.sort_by || 'created_at';
    const sortOrder = filters.sort_order || 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    const logs: AdminAuditLog[] = (data || []).map(log => {
      // Extract action and entity info from payload
      const payload = log.payload || {};
      const action = payload.action || payload.event_message || 'unknown';
      const entityType = payload.table_name || payload.resource_type || 'unknown';
      const entityId = payload.record_id || payload.resource_id || null;

      return {
        id: log.id,
        admin_user_id: payload.actor_id || payload.user_id || null,
        action: action,
        resource_type: entityType,
        resource_id: entityId,
        old_values: payload.old_record || null,
        new_values: payload.new_record || null,
        ip_address: log.ip_address || null,
        user_agent: payload.actor_via_sso === false ? 'dashboard' : 'sso',
        created_at: log.created_at,
        admin_user: {
          email: payload.actor_email || payload.traits?.email || '',
          profile: undefined
        }
      };
    });

    return {
      logs,
      totalCount: count || 0,
      totalPages: Math.ceil((count || 0) / limit)
    };

  } catch (error) {
    console.error('Error fetching admin audit logs:', error);
    throw new Error('Failed to fetch audit logs');
  }
}

/**
 * Update user status (activate, deactivate, ban)
 */
export async function updateUserStatus(
  userId: string,
  status: 'active' | 'banned' | 'inactive',
  reason?: string
): Promise<void> {
  const adminUser = await verifySuperAdmin();
  const supabase = await createClient();

  try {
    // Get current user data for audit log
    const { data: currentUser, error: fetchError } = await supabase
      .from('profiles')
      .select('email, is_verified')
      .eq('user_id', userId)
      .single();

    if (fetchError || !currentUser) {
      throw new Error('User not found');
    }

    const updateData: any = {};

    switch (status) {
      case 'banned':
      case 'inactive':
        updateData.is_verified = false;
        break;
      case 'active':
        updateData.is_verified = true;
        break;
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('user_id', userId);

    if (updateError) {
      throw updateError;
    }

    await logAdminAction(
      adminUser.id,
      `update_user_status_${status}`,
      'user',
      userId,
      { is_verified: currentUser.is_verified },
      { ...updateData, reason }
    );

  } catch (error) {
    console.error('Error updating user status:', error);
    throw new Error('Failed to update user status');
  }
}

/**
 * Update salon status (activate, deactivate, verify)
 */
export async function updateSalonStatus(
  salonId: string,
  updates: { is_active?: boolean; is_verified?: boolean; is_featured?: boolean },
  reason?: string
): Promise<void> {
  const adminUser = await verifySuperAdmin();
  const supabase = await createClient();

  try {
    // Get current salon data for audit log
    const { data: currentSalon, error: fetchError } = await supabase
      .from('salons')
      .select('name, is_active, is_verified, is_featured')
      .eq('id', salonId)
      .single();

    if (fetchError || !currentSalon) {
      throw new Error('Salon not found');
    }

    const updateData: any = { ...updates };
    if (updates.is_verified) {
      updateData.verified_at = new Date().toISOString();
    }

    const { error: updateError } = await supabase
      .from('salons')
      .update(updateData)
      .eq('id', salonId);

    if (updateError) {
      throw updateError;
    }

    await logAdminAction(
      adminUser.id,
      'update_salon_status',
      'salon',
      salonId,
      {
        is_active: currentSalon.is_active,
        is_verified: currentSalon.is_verified,
        is_featured: currentSalon.is_featured
      },
      { ...updateData, reason }
    );

  } catch (error) {
    console.error('Error updating salon status:', error);
    throw new Error('Failed to update salon status');
  }
}