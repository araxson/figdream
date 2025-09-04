import { UserRole } from './utils'
/**
 * Permission definitions for the application
 */
export type Permission = 
  // Salon permissions
  | 'salons.create'
  | 'salons.read'
  | 'salons.update'
  | 'salons.delete'
  | 'salons.manage_all'
  // Location permissions
  | 'locations.create'
  | 'locations.read'
  | 'locations.update'
  | 'locations.delete'
  | 'locations.manage_all'
  // Staff permissions
  | 'staff.create'
  | 'staff.read'
  | 'staff.update'
  | 'staff.delete'
  | 'staff.manage_all'
  | 'staff.manage_own'
  // Service permissions
  | 'services.create'
  | 'services.read'
  | 'services.update'
  | 'services.delete'
  | 'services.manage_all'
  // Appointment permissions
  | 'appointments.create'
  | 'appointments.read'
  | 'appointments.update'
  | 'appointments.delete'
  | 'appointments.manage_all'
  | 'appointments.manage_own'
  // Customer permissions
  | 'customers.create'
  | 'customers.read'
  | 'customers.update'
  | 'customers.delete'
  | 'customers.manage_all'
  | 'customers.manage_own'
  // Review permissions
  | 'reviews.create'
  | 'reviews.read'
  | 'reviews.update'
  | 'reviews.delete'
  | 'reviews.moderate'
  // Analytics permissions
  | 'analytics.view_all'
  | 'analytics.view_salon'
  | 'analytics.view_location'
  | 'analytics.export'
  // Marketing permissions
  | 'marketing.campaigns.create'
  | 'marketing.campaigns.read'
  | 'marketing.campaigns.update'
  | 'marketing.campaigns.delete'
  | 'marketing.sms.send'
  | 'marketing.email.send'
  // Settings permissions
  | 'settings.manage_system'
  | 'settings.manage_salon'
  | 'settings.manage_location'
  | 'settings.manage_own'
  // Billing permissions
  | 'billing.manage_all'
  | 'billing.manage_salon'
  | 'billing.view_own'
  // Reports permissions
  | 'reports.generate_all'
  | 'reports.generate_salon'
  | 'reports.generate_location'
  | 'reports.view_own'
/**
 * Role-based permission mappings
 */
export const rolePermissions: Record<UserRole, Permission[]> = {
  super_admin: [
    // Full system access
    'salons.create',
    'salons.read',
    'salons.update',
    'salons.delete',
    'salons.manage_all',
    'locations.create',
    'locations.read',
    'locations.update',
    'locations.delete',
    'locations.manage_all',
    'staff.create',
    'staff.read',
    'staff.update',
    'staff.delete',
    'staff.manage_all',
    'services.create',
    'services.read',
    'services.update',
    'services.delete',
    'services.manage_all',
    'appointments.create',
    'appointments.read',
    'appointments.update',
    'appointments.delete',
    'appointments.manage_all',
    'customers.create',
    'customers.read',
    'customers.update',
    'customers.delete',
    'customers.manage_all',
    'reviews.create',
    'reviews.read',
    'reviews.update',
    'reviews.delete',
    'reviews.moderate',
    'analytics.view_all',
    'analytics.export',
    'marketing.campaigns.create',
    'marketing.campaigns.read',
    'marketing.campaigns.update',
    'marketing.campaigns.delete',
    'marketing.sms.send',
    'marketing.email.send',
    'settings.manage_system',
    'billing.manage_all',
    'reports.generate_all',
  ],
  salon_owner: [
    // Manage own salon and its locations
    'salons.read',
    'salons.update',
    'locations.create',
    'locations.read',
    'locations.update',
    'locations.delete',
    'staff.create',
    'staff.read',
    'staff.update',
    'staff.delete',
    'services.create',
    'services.read',
    'services.update',
    'services.delete',
    'appointments.create',
    'appointments.read',
    'appointments.update',
    'appointments.delete',
    'appointments.manage_all',
    'customers.read',
    'customers.update',
    'reviews.read',
    'reviews.moderate',
    'analytics.view_salon',
    'analytics.export',
    'marketing.campaigns.create',
    'marketing.campaigns.read',
    'marketing.campaigns.update',
    'marketing.campaigns.delete',
    'marketing.sms.send',
    'marketing.email.send',
    'settings.manage_salon',
    'billing.manage_salon',
    'reports.generate_salon',
  ],
  location_manager: [
    // Manage single location
    'locations.read',
    'locations.update',
    'staff.create',
    'staff.read',
    'staff.update',
    'services.read',
    'services.update',
    'appointments.create',
    'appointments.read',
    'appointments.update',
    'appointments.manage_all',
    'customers.read',
    'reviews.read',
    'analytics.view_location',
    'marketing.campaigns.read',
    'marketing.sms.send',
    'marketing.email.send',
    'settings.manage_location',
    'reports.generate_location',
  ],
  staff: [
    // Manage own schedule and bookings
    'staff.read',
    'staff.manage_own',
    'services.read',
    'appointments.create',
    'appointments.read',
    'appointments.update',
    'appointments.manage_own',
    'customers.read',
    'reviews.read',
    'settings.manage_own',
    'reports.view_own',
  ],
  customer: [
    // Manage own profile and bookings
    'appointments.create',
    'appointments.read',
    'appointments.manage_own',
    'customers.read',
    'customers.manage_own',
    'reviews.create',
    'reviews.read',
    'reviews.update',
    'services.read',
    'settings.manage_own',
    'billing.view_own',
    'reports.view_own',
  ],
}
/**
 * Check if a role has a specific permission
 */
export function roleHasPermission(
  role: UserRole | null,
  permission: Permission
): boolean {
  if (!role) return false
  const permissions = rolePermissions[role]
  return permissions.includes(permission)
}
/**
 * Check if a role has any of the specified permissions
 */
export function roleHasAnyPermission(
  role: UserRole | null,
  permissions: Permission[]
): boolean {
  if (!role) return false
  const rolePerms = rolePermissions[role]
  return permissions.some(permission => rolePerms.includes(permission))
}
/**
 * Check if a role has all of the specified permissions
 */
export function roleHasAllPermissions(
  role: UserRole | null,
  permissions: Permission[]
): boolean {
  if (!role) return false
  const rolePerms = rolePermissions[role]
  return permissions.every(permission => rolePerms.includes(permission))
}
/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: UserRole | null): Permission[] {
  if (!role) return []
  return rolePermissions[role] || []
}
/**
 * Permission groups for UI organization
 */
export const permissionGroups = {
  'Salon Management': [
    'salons.create',
    'salons.read',
    'salons.update',
    'salons.delete',
    'salons.manage_all',
  ],
  'Location Management': [
    'locations.create',
    'locations.read',
    'locations.update',
    'locations.delete',
    'locations.manage_all',
  ],
  'Staff Management': [
    'staff.create',
    'staff.read',
    'staff.update',
    'staff.delete',
    'staff.manage_all',
    'staff.manage_own',
  ],
  'Service Management': [
    'services.create',
    'services.read',
    'services.update',
    'services.delete',
    'services.manage_all',
  ],
  'Appointment Management': [
    'appointments.create',
    'appointments.read',
    'appointments.update',
    'appointments.delete',
    'appointments.manage_all',
    'appointments.manage_own',
  ],
  'Customer Management': [
    'customers.create',
    'customers.read',
    'customers.update',
    'customers.delete',
    'customers.manage_all',
    'customers.manage_own',
  ],
  'Reviews': [
    'reviews.create',
    'reviews.read',
    'reviews.update',
    'reviews.delete',
    'reviews.moderate',
  ],
  'Analytics & Reports': [
    'analytics.view_all',
    'analytics.view_salon',
    'analytics.view_location',
    'analytics.export',
    'reports.generate_all',
    'reports.generate_salon',
    'reports.generate_location',
    'reports.view_own',
  ],
  'Marketing': [
    'marketing.campaigns.create',
    'marketing.campaigns.read',
    'marketing.campaigns.update',
    'marketing.campaigns.delete',
    'marketing.sms.send',
    'marketing.email.send',
  ],
  'Settings & Billing': [
    'settings.manage_system',
    'settings.manage_salon',
    'settings.manage_location',
    'settings.manage_own',
    'billing.manage_all',
    'billing.manage_salon',
    'billing.view_own',
  ],
}
/**
 * Get human-readable permission name
 */
export function getPermissionLabel(permission: Permission): string {
  const labels: Record<Permission, string> = {
    // Salons
    'salons.create': 'Create Salons',
    'salons.read': 'View Salons',
    'salons.update': 'Edit Salons',
    'salons.delete': 'Delete Salons',
    'salons.manage_all': 'Manage All Salons',
    // Locations
    'locations.create': 'Create Locations',
    'locations.read': 'View Locations',
    'locations.update': 'Edit Locations',
    'locations.delete': 'Delete Locations',
    'locations.manage_all': 'Manage All Locations',
    // Staff
    'staff.create': 'Create Staff',
    'staff.read': 'View Staff',
    'staff.update': 'Edit Staff',
    'staff.delete': 'Delete Staff',
    'staff.manage_all': 'Manage All Staff',
    'staff.manage_own': 'Manage Own Profile',
    // Services
    'services.create': 'Create Services',
    'services.read': 'View Services',
    'services.update': 'Edit Services',
    'services.delete': 'Delete Services',
    'services.manage_all': 'Manage All Services',
    // Appointments
    'appointments.create': 'Create Appointments',
    'appointments.read': 'View Appointments',
    'appointments.update': 'Edit Appointments',
    'appointments.delete': 'Delete Appointments',
    'appointments.manage_all': 'Manage All Appointments',
    'appointments.manage_own': 'Manage Own Appointments',
    // Customers
    'customers.create': 'Create Customers',
    'customers.read': 'View Customers',
    'customers.update': 'Edit Customers',
    'customers.delete': 'Delete Customers',
    'customers.manage_all': 'Manage All Customers',
    'customers.manage_own': 'Manage Own Profile',
    // Reviews
    'reviews.create': 'Create Reviews',
    'reviews.read': 'View Reviews',
    'reviews.update': 'Edit Reviews',
    'reviews.delete': 'Delete Reviews',
    'reviews.moderate': 'Moderate Reviews',
    // Analytics
    'analytics.view_all': 'View All Analytics',
    'analytics.view_salon': 'View Salon Analytics',
    'analytics.view_location': 'View Location Analytics',
    'analytics.export': 'Export Analytics',
    // Marketing
    'marketing.campaigns.create': 'Create Campaigns',
    'marketing.campaigns.read': 'View Campaigns',
    'marketing.campaigns.update': 'Edit Campaigns',
    'marketing.campaigns.delete': 'Delete Campaigns',
    'marketing.sms.send': 'Send SMS',
    'marketing.email.send': 'Send Emails',
    // Settings
    'settings.manage_system': 'Manage System Settings',
    'settings.manage_salon': 'Manage Salon Settings',
    'settings.manage_location': 'Manage Location Settings',
    'settings.manage_own': 'Manage Own Settings',
    // Billing
    'billing.manage_all': 'Manage All Billing',
    'billing.manage_salon': 'Manage Salon Billing',
    'billing.view_own': 'View Own Billing',
    // Reports
    'reports.generate_all': 'Generate All Reports',
    'reports.generate_salon': 'Generate Salon Reports',
    'reports.generate_location': 'Generate Location Reports',
    'reports.view_own': 'View Own Reports',
  }
  return labels[permission] || permission
}
/**
 * Check resource ownership
 * This is a placeholder - actual implementation would query database
 */
export async function userOwnsResource(
  _userId: string,
  _resourceType: string,
  _resourceId: string
): Promise<boolean> {
  // This would typically involve a database query
  // For now, return false as a safe default
  // In production, this would check the database
  // Placeholder implementation
  return false
}
/**
 * Check if user can perform action on resource
 * Combines role permissions with resource ownership
 */
export async function canUserPerformAction(
  userId: string,
  userRole: UserRole | null,
  permission: Permission,
  resourceId?: string,
  resourceType?: string
): Promise<boolean> {
  // First check role-based permission
  if (!roleHasPermission(userRole, permission)) {
    // Check if it's an "own" permission
    if (permission.endsWith('.manage_own') && resourceId && resourceType) {
      // Check resource ownership
      return userOwnsResource(userId, resourceType, resourceId)
    }
    return false
  }
  return true
}
/**
 * Check if a user has access to a salon
 */
export async function canAccessSalon(userId: string, salonId: string): Promise<boolean> {
  const { createClient } = await import('@/lib/database/supabase/server')
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('salon_id', salonId)
    .single()
  if (error || !data) {
    return false
  }
  // User has access if they have any role in the salon
  return ['salon_owner', 'location_manager', 'staff'].includes(data.role)
}
/**
 * Check if a user has access to a location
 */
export async function canAccessLocation(userId: string, locationId: string): Promise<boolean> {
  const { createClient } = await import('@/lib/database/supabase/server')
  const supabase = await createClient()
  // Get the salon_id from the location
  const { data: location } = await supabase
    .from('salon_locations')
    .select('salon_id')
    .eq('id', locationId)
    .single()
  if (!location) {
    return false
  }
  // Check if user has access to the salon
  return canAccessSalon(userId, location.salon_id)
}
/**
 * Check if a user has access to an appointment
 */
export async function canAccessAppointment(userId: string, appointmentId: string): Promise<boolean> {
  const { createClient } = await import('@/lib/database/supabase/server')
  const supabase = await createClient()
  // Get the appointment details
  const { data: appointment } = await supabase
    .from('appointments')
    .select('salon_id, customer_id, staff_id')
    .eq('id', appointmentId)
    .single()
  if (!appointment) {
    return false
  }
  // Check if user is the customer
  if (appointment.customer_id === userId) {
    return true
  }
  // Check if user is the staff member
  if (appointment.staff_id) {
    const { data: staffProfile } = await supabase
      .from('staff_profiles')
      .select('user_id')
      .eq('id', appointment.staff_id)
      .single()
    if (staffProfile?.user_id === userId) {
      return true
    }
  }
  // Check if user has access to the salon
  return canAccessSalon(userId, appointment.salon_id)
}