import { USER_ROLES, UserRole } from '@/lib/auth/constants';

/**
 * Check if user has admin privileges
 */
export function isAdmin(role: UserRole | string | null | undefined): boolean {
  return role === USER_ROLES.SUPER_ADMIN;
}

/**
 * Check if user has salon management privileges
 */
export function isSalonManager(role: UserRole | string | null | undefined): boolean {
  return role === USER_ROLES.SALON_OWNER || 
         role === USER_ROLES.SALON_MANAGER || 
         role === USER_ROLES.SUPER_ADMIN;
}

/**
 * Check if user has staff privileges
 */
export function isStaff(role: UserRole | string | null | undefined): boolean {
  return role === USER_ROLES.STAFF || isSalonManager(role);
}

/**
 * Check if user can manage services
 */
export function canManageServices(role: UserRole | string | null | undefined): boolean {
  return isSalonManager(role);
}

/**
 * Check if user can manage staff
 */
export function canManageStaff(role: UserRole | string | null | undefined): boolean {
  return isSalonManager(role);
}

/**
 * Check if user can view customers
 */
export function canViewCustomers(role: UserRole | string | null | undefined): boolean {
  return isStaff(role);
}

/**
 * Check if user can manage customers
 */
export function canManageCustomers(role: UserRole | string | null | undefined): boolean {
  return isSalonManager(role);
}

/**
 * Check if user can manage appointments
 */
export function canManageAppointments(role: UserRole | string | null | undefined): boolean {
  return isStaff(role);
}

/**
 * Check if user can view analytics
 */
export function canViewAnalytics(role: UserRole | string | null | undefined): boolean {
  return isSalonManager(role);
}

/**
 * Check if user can manage platform settings
 */
export function canManagePlatform(role: UserRole | string | null | undefined): boolean {
  return isAdmin(role);
}