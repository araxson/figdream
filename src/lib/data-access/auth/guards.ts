'use server'

import { redirect } from 'next/navigation'
import { getCurrentUser } from './session'
import { 
  getUserRole, 
  getRoleLoginPath, 
  getRoleRedirectPath,
  canAccessPath,
  type UserRole 
} from './utils'

/**
 * Route guard for protected pages
 * Redirects to login if not authenticated
 */
export async function protectRoute(redirectTo?: string): Promise<void> {
  const user = await getCurrentUser()
  
  if (!user) {
    const loginUrl = redirectTo 
      ? `/auth/login?redirectTo=${encodeURIComponent(redirectTo)}`
      : '/auth/login'
    redirect(loginUrl)
  }
}

/**
 * Route guard for role-specific pages
 * Redirects to login or 403 if wrong role
 */
export async function protectRouteWithRole(
  requiredRole: UserRole,
  redirectTo?: string
): Promise<void> {
  const user = await getCurrentUser()
  
  if (!user) {
    const loginPath = getRoleLoginPath(requiredRole)
    const loginUrl = redirectTo 
      ? `${loginPath}?redirectTo=${encodeURIComponent(redirectTo)}`
      : loginPath
    redirect(loginUrl)
  }
  
  const userRole = getUserRole(user)
  
  // Super admin can access everything
  if (userRole === 'super_admin') {
    return
  }
  
  if (userRole !== requiredRole) {
    redirect('/403')
  }
}

/**
 * Route guard for multiple roles
 * Redirects to login or 403 if wrong role
 */
export async function protectRouteWithRoles(
  requiredRoles: UserRole[],
  redirectTo?: string
): Promise<void> {
  const user = await getCurrentUser()
  
  if (!user) {
    const loginUrl = redirectTo 
      ? `/auth/login?redirectTo=${encodeURIComponent(redirectTo)}`
      : '/auth/login'
    redirect(loginUrl)
  }
  
  const userRole = getUserRole(user)
  
  // Super admin can access everything
  if (userRole === 'super_admin') {
    return
  }
  
  if (!userRole || !requiredRoles.includes(userRole)) {
    redirect('/403')
  }
}

/**
 * Route guard for admin-only pages
 */
export async function protectAdminRoute(redirectTo?: string): Promise<void> {
  await protectRouteWithRoles(
    ['super_admin', 'salon_owner', 'location_manager'],
    redirectTo
  )
}

/**
 * Route guard for super admin only
 */
export async function protectSuperAdminRoute(redirectTo?: string): Promise<void> {
  await protectRouteWithRole('super_admin', redirectTo)
}

/**
 * Route guard for salon admin pages
 */
export async function protectSalonOwnerRoute(redirectTo?: string): Promise<void> {
  await protectRouteWithRole('salon_owner', redirectTo)
}

/**
 * Route guard for location admin pages
 */
export async function protectLocationManagerRoute(redirectTo?: string): Promise<void> {
  await protectRouteWithRole('location_manager', redirectTo)
}

/**
 * Route guard for staff pages
 */
export async function protectStaffRoute(redirectTo?: string): Promise<void> {
  await protectRouteWithRole('staff', redirectTo)
}

/**
 * Route guard for customer pages
 */
export async function protectCustomerRoute(redirectTo?: string): Promise<void> {
  await protectRouteWithRole('customer', redirectTo)
}

/**
 * Redirect authenticated users away from auth pages
 */
export async function redirectIfAuthenticated(): Promise<void> {
  const user = await getCurrentUser()
  
  if (user) {
    const role = getUserRole(user)
    const redirectPath = getRoleRedirectPath(role)
    redirect(redirectPath)
  }
}

/**
 * Check access to a specific path
 * Redirects if no access
 */
export async function checkPathAccess(pathname: string): Promise<void> {
  const user = await getCurrentUser()
  
  if (!canAccessPath(user, pathname)) {
    if (!user) {
      redirect(`/auth/login?redirectTo=${encodeURIComponent(pathname)}`)
    } else {
      redirect('/403')
    }
  }
}

/**
 * Get auth state for client components
 * Returns user info without redirecting
 */
export async function getAuthState(): Promise<{
  isAuthenticated: boolean
  user: {
    id: string
    email: string
    role: UserRole | null
  } | null
}> {
  const user = await getCurrentUser()
  
  if (!user) {
    return {
      isAuthenticated: false,
      user: null
    }
  }
  
  return {
    isAuthenticated: true,
    user: {
      id: user.id,
      email: user.email || '',
      role: getUserRole(user)
    }
  }
}

/**
 * Check if current user can perform an action
 * Used for conditional rendering
 */
export async function canPerformAction(
  action: string,
  resource?: string
): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user) return false
  
  const role = getUserRole(user)
  
  // Super admin can do everything
  if (role === 'super_admin') return true
  
  // Define action permissions
  const permissions: Record<string, UserRole[]> = {
    // Salon management
    'create_salon': ['super_admin'],
    'edit_salon': ['super_admin', 'salon_owner'],
    'delete_salon': ['super_admin'],
    'view_salon': ['super_admin', 'salon_owner', 'location_manager', 'staff'],
    
    // Location management
    'create_location': ['super_admin', 'salon_owner'],
    'edit_location': ['super_admin', 'salon_owner', 'location_manager'],
    'delete_location': ['super_admin', 'salon_owner'],
    'view_location': ['super_admin', 'salon_owner', 'location_manager', 'staff'],
    
    // Staff management
    'create_staff': ['super_admin', 'salon_owner', 'location_manager'],
    'edit_staff': ['super_admin', 'salon_owner', 'location_manager'],
    'delete_staff': ['super_admin', 'salon_owner'],
    'view_staff': ['super_admin', 'salon_owner', 'location_manager', 'staff'],
    
    // Service management
    'create_service': ['super_admin', 'salon_owner', 'location_manager'],
    'edit_service': ['super_admin', 'salon_owner', 'location_manager'],
    'delete_service': ['super_admin', 'salon_owner'],
    'view_service': ['super_admin', 'salon_owner', 'location_manager', 'staff', 'customer'],
    
    // Booking management
    'create_booking': ['super_admin', 'salon_owner', 'location_manager', 'staff', 'customer'],
    'edit_booking': ['super_admin', 'salon_owner', 'location_manager', 'staff'],
    'cancel_booking': ['super_admin', 'salon_owner', 'location_manager', 'staff', 'customer'],
    'view_booking': ['super_admin', 'salon_owner', 'location_manager', 'staff', 'customer'],
    
    // Review management
    'create_review': ['customer'],
    'edit_review': ['super_admin', 'customer'],
    'delete_review': ['super_admin'],
    'view_review': ['super_admin', 'salon_owner', 'location_manager', 'staff', 'customer'],
    
    // Analytics
    'view_analytics': ['super_admin', 'salon_owner', 'location_manager'],
    'export_analytics': ['super_admin', 'salon_owner'],
    
    // Settings
    'manage_settings': ['super_admin', 'salon_owner', 'location_manager'],
    'manage_billing': ['super_admin', 'salon_owner'],
  }
  
  const allowedRoles = permissions[action]
  if (!allowedRoles) return false
  
  return role !== null && allowedRoles.includes(role)
}

/**
 * Ensure user owns or has access to a resource
 * Used for resource-level authorization
 */
export async function ensureResourceAccess(
  resourceType: 'salon' | 'location' | 'staff' | 'booking',
  resourceId: string
): Promise<void> {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/auth/login')
  }
  
  const role = getUserRole(user)
  
  // Super admin has access to everything
  if (role === 'super_admin') {
    return
  }
  
  // Check resource-specific access
  // This would typically involve database queries
  // For now, we'll implement basic checks
  
  switch (resourceType) {
    case 'salon':
      if (role === 'salon_owner') {
        const userSalonId = user.app_metadata?.salon_id
        if (userSalonId !== resourceId) {
          redirect('/403')
        }
      }
      break
      
    case 'location':
      if (role === 'location_manager') {
        const userLocationId = user.app_metadata?.location_id
        if (userLocationId !== resourceId) {
          redirect('/403')
        }
      }
      break
      
    case 'staff':
      if (role === 'staff') {
        const userStaffId = user.app_metadata?.staff_id
        if (userStaffId !== resourceId) {
          redirect('/403')
        }
      }
      break
      
    case 'booking':
      // Would need to check if user owns the booking
      // This requires a database query
      break
  }
}