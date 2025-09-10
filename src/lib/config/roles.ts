import { UserRoleType } from '@/types'

export const ROLES = {
  SUPER_ADMIN: 'super_admin' as UserRoleType,
  SALON_OWNER: 'salon_owner' as UserRoleType,
  SALON_MANAGER: 'salon_manager' as UserRoleType,
  LOCATION_MANAGER: 'location_manager' as UserRoleType,
  STAFF: 'staff' as UserRoleType,
  CUSTOMER: 'customer' as UserRoleType,
} as const

export type UserRole = UserRoleType

export const ROLE_LABELS: Record<UserRole, string> = {
  'super_admin': 'System Administrator',
  'salon_owner': 'Salon Owner',
  'salon_manager': 'Salon Manager',
  'location_manager': 'Location Manager',
  'staff': 'Staff Member',
  'customer': 'Customer',
}

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  'super_admin': [
    'manage_all_salons',
    'manage_all_users',
    'view_all_analytics',
    'manage_system_settings',
    'manage_billing',
  ],
  'salon_owner': [
    'manage_own_salons',
    'manage_salon_staff',
    'manage_services',
    'view_salon_analytics',
    'manage_salon_settings',
    'manage_campaigns',
  ],
  'salon_manager': [
    'manage_appointments',
    'manage_staff_schedules',
    'manage_customers',
    'view_reports',
    'manage_inventory',
  ],
  'location_manager': [
    'manage_location',
    'manage_location_staff',
    'view_location_analytics',
    'manage_location_appointments',
  ],
  'staff': [
    'view_own_appointments',
    'manage_own_schedule',
    'view_customer_info',
    'record_services',
    'view_tips',
  ],
  'customer': [
    'book_appointments',
    'view_own_appointments',
    'leave_reviews',
    'manage_profile',
  ],
}

export function hasPermission(role: UserRole, permission: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) || false
}

export function getRoleRedirectPath(role: UserRole): string {
  switch (role) {
    case ROLES.SUPER_ADMIN:
      return '/admin'
    case ROLES.SALON_OWNER:
    case ROLES.SALON_MANAGER:
    case ROLES.LOCATION_MANAGER:
      return '/dashboard'
    case ROLES.STAFF:
      return '/staff'
    case ROLES.CUSTOMER:
    default:
      return '/customer/book'
  }
}