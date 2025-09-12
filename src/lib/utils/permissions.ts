import { 
  UserRole, 
  Permission, 
  ROLE_PERMISSIONS 
} from '@/lib/constants/roles'

/**
 * Check if a user role is allowed in a list of roles
 */
export function isRoleAllowed(
  userRole: string | undefined | null,
  allowedRoles: UserRole[]
): boolean {
  if (!userRole) return false
  return allowedRoles.includes(userRole as UserRole)
}

/**
 * Check if a user role has a specific permission
 */
export function hasPermission(
  userRole: string | undefined | null,
  permission: string
): boolean {
  if (!userRole) return false
  
  const rolePermissions = ROLE_PERMISSIONS[userRole as UserRole]
  if (!rolePermissions) return false
  
  return rolePermissions.includes(permission as Permission)
}

/**
 * Get all permissions for a user role
 */
export function getRolePermissions(
  userRole: string | undefined | null
): Permission[] {
  if (!userRole) return []
  return ROLE_PERMISSIONS[userRole as UserRole] || []
}

/**
 * Check if a user can access a specific route
 */
export function canAccessRoute(
  userRole: string | undefined | null,
  route: string
): boolean {
  if (!userRole) return false
  
  // Define route-permission mapping
  const routePermissions: Record<string, Permission> = {
    '/admin': 'access_admin_dashboard',
    '/dashboard': 'access_owner_dashboard',
    '/staff': 'access_staff_dashboard',
    '/customer/appointments': 'view_appointments',
    '/customer/book': 'book_appointment'
  }
  
  // Check if route requires permission
  const requiredPermission = Object.entries(routePermissions).find(([path]) => 
    route.startsWith(path)
  )?.[1]
  
  if (!requiredPermission) return true // Public route
  
  return hasPermission(userRole, requiredPermission)
}