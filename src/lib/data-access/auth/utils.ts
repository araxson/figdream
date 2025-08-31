import { User } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'

// User role types based on raw_app_meta_data
export type UserRole = 'super_admin' | 'salon_admin' | 'location_admin' | 'staff' | 'customer'

// Extended user type with role
export interface AuthUser extends User {
  role?: UserRole
  salonId?: string
  locationId?: string
  staffId?: string
}

/**
 * Extract user role from Supabase user object
 * IMPORTANT: Use app_metadata, not user_metadata
 */
export function getUserRole(user: User | null): UserRole | null {
  if (!user) return null
  
  // Check app_metadata for role (secure, server-side metadata)
  const role = user.app_metadata?.role
  
  if (isValidRole(role)) {
    return role as UserRole
  }
  
  // Default to customer if no role is set
  return 'customer'
}

/**
 * Check if a string is a valid user role
 */
export function isValidRole(role: unknown): role is UserRole {
  const validRoles: UserRole[] = ['super_admin', 'salon_admin', 'location_admin', 'staff', 'customer']
  return typeof role === 'string' && validRoles.includes(role as UserRole)
}

/**
 * Check if user has specific role
 */
export function hasRole(user: User | null, role: UserRole): boolean {
  const userRole = getUserRole(user)
  return userRole === role
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(user: User | null, roles: UserRole[]): boolean {
  const userRole = getUserRole(user)
  return userRole !== null && roles.includes(userRole)
}

/**
 * Check if user has admin privileges (any admin role)
 */
export function isAdmin(user: User | null): boolean {
  return hasAnyRole(user, ['super_admin', 'salon_admin', 'location_admin'])
}

/**
 * Check if user is a super admin
 */
export function isSuperAdmin(user: User | null): boolean {
  return hasRole(user, 'super_admin')
}

/**
 * Check if user is a salon admin
 */
export function isSalonAdmin(user: User | null): boolean {
  return hasRole(user, 'salon_admin')
}

/**
 * Check if user is a location admin
 */
export function isLocationAdmin(user: User | null): boolean {
  return hasRole(user, 'location_admin')
}

/**
 * Check if user is staff
 */
export function isStaff(user: User | null): boolean {
  return hasRole(user, 'staff')
}

/**
 * Check if user is a customer
 */
export function isCustomer(user: User | null): boolean {
  return hasRole(user, 'customer')
}

/**
 * Get salon ID from user metadata
 */
export function getUserSalonId(user: User | null): string | null {
  if (!user) return null
  return user.app_metadata?.salon_id || null
}

/**
 * Get location ID from user metadata
 */
export function getUserLocationId(user: User | null): string | null {
  if (!user) return null
  return user.app_metadata?.location_id || null
}

/**
 * Get staff ID from user metadata
 */
export function getUserStaffId(user: User | null): string | null {
  if (!user) return null
  return user.app_metadata?.staff_id || null
}

/**
 * Check if user can access a specific salon
 */
export function canAccessSalon(user: User | null, salonId: string): boolean {
  if (!user) return false
  
  // Super admin can access all salons
  if (isSuperAdmin(user)) return true
  
  // Check if user's salon matches
  const userSalonId = getUserSalonId(user)
  return userSalonId === salonId
}

/**
 * Check if user can access a specific location
 */
export function canAccessLocation(user: User | null, locationId: string): boolean {
  if (!user) return false
  
  // Super admin can access all locations
  if (isSuperAdmin(user)) return true
  
  // Salon admin can access all locations in their salon
  if (isSalonAdmin(user)) {
    // Would need to check if location belongs to user's salon
    // This would require a database query
    return true
  }
  
  // Check if user's location matches
  const userLocationId = getUserLocationId(user)
  return userLocationId === locationId
}

/**
 * Get redirect path based on user role
 */
export function getRoleRedirectPath(role: UserRole | null): string {
  switch (role) {
    case 'super_admin':
      return '/admin'
    case 'salon_admin':
      return '/salon'
    case 'location_admin':
      return '/location'
    case 'staff':
      return '/staff'
    case 'customer':
      return '/dashboard'
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
      return '/auth/login/super-admin'
    case 'salon_admin':
      return '/auth/login/salon-owner'
    case 'location_admin':
      return '/auth/login/salon-owner'
    case 'staff':
      return '/auth/login/staff'
    case 'customer':
      return '/auth/login/customer'
    default:
      return '/auth/login'
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
    '/auth',
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
  if (pathname.startsWith('/admin')) return 'super_admin'
  if (pathname.startsWith('/salon')) return 'salon_admin'
  if (pathname.startsWith('/location')) return 'location_admin'
  if (pathname.startsWith('/staff')) return 'staff'
  if (pathname.startsWith('/dashboard')) return 'customer'
  return null
}

/**
 * Validate user has required role for path
 */
export function canAccessPath(user: User | null, pathname: string): boolean {
  // Public paths are always accessible
  if (!isProtectedPath(pathname)) return true
  
  // User must be authenticated for protected paths
  if (!user) return false
  
  // Check role-specific paths
  const requiredRole = getRoleForPath(pathname)
  if (requiredRole) {
    const userRole = getUserRole(user)
    
    // Super admin can access everything
    if (userRole === 'super_admin') return true
    
    // Check if user has the required role
    return userRole === requiredRole
  }
  
  // Authenticated users can access general protected paths
  return true
}

/**
 * Format user display name
 */
export function getUserDisplayName(user: User | null): string {
  if (!user) return 'Guest'
  
  const metadata = user.user_metadata || {}
  
  if (metadata.full_name) return metadata.full_name
  if (metadata.first_name && metadata.last_name) {
    return `${metadata.first_name} ${metadata.last_name}`
  }
  if (metadata.name) return metadata.name
  if (user.email) return user.email.split('@')[0]
  
  return 'User'
}

/**
 * Get user initials for avatar
 */
export function getUserInitials(user: User | null): string {
  const name = getUserDisplayName(user)
  
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
 * Check if user profile is complete
 */
export function isProfileComplete(user: User | null): boolean {
  if (!user) return false
  
  const metadata = user.user_metadata || {}
  const role = getUserRole(user)
  
  // Basic requirements for all users
  const hasBasicInfo = !!(
    metadata.first_name &&
    metadata.last_name &&
    metadata.phone
  )
  
  // Role-specific requirements
  switch (role) {
    case 'salon_admin':
      return hasBasicInfo && !!getUserSalonId(user)
    case 'location_admin':
      return hasBasicInfo && !!getUserLocationId(user)
    case 'staff':
      return hasBasicInfo && !!getUserStaffId(user)
    default:
      return hasBasicInfo
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