import { User } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'
import { createClient } from '@/lib/database/supabase/server'
// User role types from database enum
export type UserRole = Database['public']['Enums']['user_role_type']
// Extended user type with role
export interface AuthUser extends User {
  role?: UserRole
  salonId?: string
  locationId?: string
  staffId?: string
}
/**
 * Extract user role from user_roles table - MUST be called server-side
 * Query the user_roles table instead of using raw_app_meta_data for security
 */
export async function getUserRole(userId: string | null): Promise<UserRole | null> {
  if (!userId) return null
  try {
    const supabase = await createClient()
    // Query user_roles table for active role
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('is_active', true)
      .maybeSingle()
    if (error) {
      return null
    }
    return data?.role || 'customer'
  } catch (_error) {
    return null
  }
}
/**
 * Check if a string is a valid user role
 */
export function isValidRole(role: unknown): role is UserRole {
  const validRoles: UserRole[] = ['super_admin', 'salon_owner', 'location_manager', 'staff', 'customer']
  return typeof role === 'string' && validRoles.includes(role as UserRole)
}
/**
 * Check if user has specific role - MUST be called server-side
 */
export async function hasRole(userId: string | null, role: UserRole): Promise<boolean> {
  const userRole = await getUserRole(userId)
  return userRole === role
}
/**
 * Check if user has any of the specified roles - MUST be called server-side
 */
export async function hasAnyRole(userId: string | null, roles: UserRole[]): Promise<boolean> {
  const userRole = await getUserRole(userId)
  return userRole !== null && roles.includes(userRole)
}
/**
 * Check if user has admin privileges (any admin role) - MUST be called server-side
 */
export async function isAdmin(userId: string | null): Promise<boolean> {
  return hasAnyRole(userId, ['super_admin', 'salon_owner', 'location_manager'])
}
/**
 * Check if user is a super admin - MUST be called server-side
 */
export async function isSuperAdmin(userId: string | null): Promise<boolean> {
  return hasRole(userId, 'super_admin')
}
/**
 * Check if user is a salon admin - MUST be called server-side
 */
export async function isSalonOwner(userId: string | null): Promise<boolean> {
  return hasRole(userId, 'salon_owner')
}
/**
 * Check if user is a location admin - MUST be called server-side
 */
export async function isLocationManager(userId: string | null): Promise<boolean> {
  return hasRole(userId, 'location_manager')
}
/**
 * Check if user is staff - MUST be called server-side
 */
export async function isStaff(userId: string | null): Promise<boolean> {
  return hasRole(userId, 'staff')
}
/**
 * Check if user is a customer - MUST be called server-side
 */
export async function isCustomer(userId: string | null): Promise<boolean> {
  return hasRole(userId, 'customer')
}
/**
 * Get salon ID from user_roles table - MUST be called server-side
 */
export async function getUserSalonId(userId: string | null): Promise<string | null> {
  if (!userId) return null
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('user_roles')
      .select('salon_id')
      .eq('user_id', userId)
      .eq('is_active', true)
      .maybeSingle()
    if (error) {
      return null
    }
    return data?.salon_id || null
  } catch (_error) {
    return null
  }
}
/**
 * Get location ID from user_roles table - MUST be called server-side
 */
export async function getUserLocationId(userId: string | null): Promise<string | null> {
  if (!userId) return null
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('user_roles')
      .select('location_id')
      .eq('user_id', userId)
      .eq('is_active', true)
      .maybeSingle()
    if (error) {
      return null
    }
    return data?.location_id || null
  } catch (_error) {
    return null
  }
}
/**
 * Get staff ID from staff_profiles table - MUST be called server-side
 */
export async function getUserStaffId(userId: string | null): Promise<string | null> {
  if (!userId) return null
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('staff_profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle()
    if (error) {
      return null
    }
    return data?.id || null
  } catch (_error) {
    return null
  }
}
/**
 * Check if user can access a specific salon - MUST be called server-side
 */
export async function canAccessSalon(userId: string | null, salonId: string): Promise<boolean> {
  if (!userId) return false
  // Super admin can access all salons
  if (await isSuperAdmin(userId)) return true
  // Check if user's salon matches
  const userSalonId = await getUserSalonId(userId)
  return userSalonId === salonId
}
/**
 * Check if user can access a specific location - MUST be called server-side
 */
export async function canAccessLocation(userId: string | null, locationId: string): Promise<boolean> {
  if (!userId) return false
  // Super admin can access all locations
  if (await isSuperAdmin(userId)) return true
  // Salon admin can access all locations in their salon
  if (await isSalonOwner(userId)) {
    // Check if location belongs to user's salon
    const supabase = await createClient()
    const userSalonId = await getUserSalonId(userId)
    if (!userSalonId) return false
    const { data } = await supabase
      .from('salon_locations')
      .select('id')
      .eq('id', locationId)
      .eq('salon_id', userSalonId)
      .maybeSingle()
    return !!data
  }
  // Check if user's location matches
  const userLocationId = await getUserLocationId(userId)
  return userLocationId === locationId
}
/**
 * Get redirect path based on user role
 */
export function getRoleRedirectPath(role: UserRole | null): string {
  switch (role) {
    case 'super_admin':
      return '/super-admin'
    case 'salon_owner':
      return '/salon-owner'
    case 'location_manager':
      return '/location-manager'
    case 'staff':
      return '/staff-member'
    case 'customer':
      return '/customer'
    default:
      return '/'
  }
}
/**
 * Get login path based on user role
 */
export function getRoleLoginPath(role: UserRole): string {
  switch (role) {
    case 'super_admin':
      return '/login/super-admin'
    case 'salon_owner':
      return '/login/salon-owner'
    case 'location_manager':
      return '/login/location-manager'
    case 'staff':
      return '/login/staff'
    case 'customer':
      return '/login/customer'
    default:
      return '/login'
  }
}
/**
 * Check if a path requires authentication
 */
export function isProtectedPath(pathname: string): boolean {
  const publicPaths = [
    '/',
    '/about',
    '/pricing',
    '/features',
    '/contact',
    '/book',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
    '/oauth-callback',
    '/error-401',
    '/error-403',
  ]
  // Check if path starts with any public path
  return !publicPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  )
}
/**
 * Check if a path is role-restricted
 */
export function getRoleForPath(pathname: string): UserRole | null {
  if (pathname.startsWith('/super-admin')) return 'super_admin'
  if (pathname.startsWith('/salon-owner')) return 'salon_owner'
  if (pathname.startsWith('/location-manager')) return 'location_manager'
  if (pathname.startsWith('/staff-member')) return 'staff'
  if (pathname.startsWith('/customer')) return 'customer'
  return null
}
/**
 * Validate user has required role for path - MUST be called server-side
 */
export async function canAccessPath(userId: string | null, pathname: string): Promise<boolean> {
  // Public paths are always accessible
  if (!isProtectedPath(pathname)) return true
  // User must be authenticated for protected paths
  if (!userId) return false
  // Check role-specific paths
  const requiredRole = getRoleForPath(pathname)
  if (requiredRole) {
    const userRole = await getUserRole(userId)
    // Super admin can access everything
    if (userRole === 'super_admin') return true
    // Check if user has the required role
    return userRole === requiredRole
  }
  // Authenticated users can access general protected paths
  return true
}
/**
 * Format user display name from profiles table - MUST be called server-side
 */
export async function getUserDisplayName(userId: string | null): Promise<string> {
  if (!userId) return 'Guest'
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('user_id', userId)
      .maybeSingle()
    if (data?.full_name) return data.full_name
    if (data?.email) return data.email.split('@')[0]
    return 'User'
  } catch (_error) {
    return 'User'
  }
}
/**
 * Get user initials for avatar
 */
export async function getUserInitials(user: User | null): Promise<string> {
  const name = await getUserDisplayName(user?.id || null)
  if (name === 'Guest' || name === 'User') {
    return name[0].toUpperCase()
  }
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}
/**
 * Check if user profile is complete - MUST be called server-side
 */
export async function isProfileComplete(userId: string | null): Promise<boolean> {
  if (!userId) return false
  try {
    const supabase = await createClient()
    // Get profile data
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, phone')
      .eq('user_id', userId)
      .maybeSingle()
    if (!profile) return false
    // Basic requirements for all users
    const hasBasicInfo = !!(profile.full_name && profile.phone)
    if (!hasBasicInfo) return false
    // Role-specific requirements
    const role = await getUserRole(userId)
    switch (role) {
      case 'salon_owner':
        return !!(await getUserSalonId(userId))
      case 'location_manager':
        return !!(await getUserLocationId(userId))
      case 'staff':
        return !!(await getUserStaffId(userId))
      default:
        return true
    }
  } catch (_error) {
    return false
  }
}
/**
 * Get session expiry time (in milliseconds)
 */
export function getSessionExpiry(): number {
  // Default to 7 days
  return 7 * 24 * 60 * 60 * 1000
}
/**
 * Check if session is expired
 */
export function isSessionExpired(expiresAt?: number): boolean {
  if (!expiresAt) return true
  return Date.now() > expiresAt * 1000
}