import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { USER_ROLES, UserRole, isRoleAllowed, hasPermission as checkPermission } from '@/lib/auth/constants';

export type UserDTO = {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
};

export type SessionDTO = {
  user: UserDTO;
  session_id: string;
};

/**
 * Get user role from profiles table - this is the source of truth
 */
async function getUserRole(userId: string): Promise<UserRole> {
  const supabase = await createClient();
  
  // Get role from profiles table (source of truth)
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();
  
  // If profile exists and has role, use it. Otherwise default to customer
  if (profile?.role && Object.values(USER_ROLES).includes(profile.role as UserRole)) {
    return profile.role as UserRole;
  }
  
  // Check user_roles table as fallback
  const { data: userRole } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single();
  
  if (userRole?.role && Object.values(USER_ROLES).includes(userRole.role as UserRole)) {
    // Update profiles table to maintain consistency
    await supabase
      .from('profiles')
      .update({ role: userRole.role })
      .eq('id', userId);
    
    return userRole.role as UserRole;
  }
  
  // Default to customer role
  return USER_ROLES.CUSTOMER;
}

/**
 * Verify user session - memoized during render pass
 * This is the primary authentication mechanism as per CVE-2025-29927
 * Middleware is no longer safe for authentication
 */
export const verifySession = cache(async (): Promise<SessionDTO | null> => {
  const supabase = await createClient();
  
  // Always use getUser() for authentication, never getSession()
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return null;
  }
  
  // Get session data for additional verification
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return null;
  }
  
  // Get the actual role from the database
  const role = await getUserRole(user.id);
  
  // Return DTO with only necessary fields
  return {
    user: {
      id: user.id,
      email: user.email!,
      role: role,
      created_at: user.created_at!,
    },
    session_id: session.access_token,
  };
});

/**
 * Require authentication - redirects if not authenticated
 */
export const requireAuth = cache(async (): Promise<SessionDTO> => {
  const session = await verifySession();
  
  if (!session) {
    redirect('/login');
  }
  
  return session;
});

/**
 * Require specific role - redirects if not authorized
 */
export const requireRole = cache(async (allowedRoles: UserRole[]): Promise<SessionDTO> => {
  const session = await requireAuth();
  
  if (!isRoleAllowed(session.user.role, allowedRoles)) {
    redirect('/unauthorized');
  }
  
  return session;
});

/**
 * Get current user if authenticated (doesn't redirect)
 */
export const getCurrentUser = cache(async (): Promise<UserDTO | null> => {
  const session = await verifySession();
  return session?.user || null;
});

/**
 * Check if user has specific permission based on role hierarchy
 */
export const hasPermission = cache(async (requiredRole: UserRole): Promise<boolean> => {
  const session = await verifySession();
  
  if (!session) {
    return false;
  }
  
  return checkPermission(session.user.role, requiredRole);
});

/**
 * Check if user has specific feature permission
 */
export const hasFeaturePermission = cache(async (permission: string): Promise<boolean> => {
  const session = await verifySession();
  
  if (!session) {
    return false;
  }
  
  // Permission mappings based on role
  const permissions: Record<UserRole, string[]> = {
    [USER_ROLES.SUPER_ADMIN]: ['*'], // All permissions
    [USER_ROLES.SALON_OWNER]: [
      'manage_salon', 'view_reports', 'manage_staff', 'manage_services',
      'view_analytics', 'manage_appointments', 'manage_customers'
    ],
    [USER_ROLES.SALON_MANAGER]: [
      'manage_salon', 'view_reports', 'manage_staff', 'manage_services',
      'manage_appointments', 'manage_customers'
    ],
    [USER_ROLES.STAFF]: [
      'view_appointments', 'manage_own_schedule', 'view_customers',
      'update_appointment_status'
    ],
    [USER_ROLES.CUSTOMER]: [
      'book_appointment', 'view_own_appointments', 'cancel_appointment',
      'leave_review'
    ]
  };
  
  const userPermissions = permissions[session.user.role] || [];
  
  // Check for wildcard or specific permission
  return userPermissions.includes('*') || userPermissions.includes(permission);
});

/**
 * Sign out the current user
 */
export const signOut = async (): Promise<void> => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
};