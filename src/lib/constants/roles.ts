// User role constants
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  SALON_OWNER: 'salon_owner',
  SALON_MANAGER: 'salon_manager',
  STAFF: 'staff',
  CUSTOMER: 'customer'
} as const

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES]

// Role groups for permission checking
export const ADMIN_ROLES: UserRole[] = [
  USER_ROLES.SUPER_ADMIN,
  USER_ROLES.SALON_OWNER,
  USER_ROLES.SALON_MANAGER
]

export const OWNER_ROLES: UserRole[] = [
  USER_ROLES.SUPER_ADMIN,
  USER_ROLES.SALON_OWNER,
  USER_ROLES.SALON_MANAGER
]

export const STAFF_ROLES: UserRole[] = [
  USER_ROLES.STAFF,
  USER_ROLES.SALON_MANAGER
]

// Permission definitions
export const PERMISSIONS = {
  // User management
  MANAGE_USERS: 'manage_users',
  CHANGE_USER_ROLE: 'change_user_role',
  
  // Salon management
  MANAGE_SALON: 'manage_salon',
  MANAGE_SALONS: 'manage_salons',
  MANAGE_STAFF: 'manage_staff',
  VIEW_ANALYTICS: 'view_analytics',
  
  // Appointment management
  MANAGE_APPOINTMENTS: 'manage_appointments',
  BOOK_APPOINTMENT: 'book_appointment',
  VIEW_APPOINTMENTS: 'view_appointments',
  VIEW_SCHEDULE: 'view_schedule',
  
  // Dashboard access
  ACCESS_ADMIN_DASHBOARD: 'access_admin_dashboard',
  ACCESS_STAFF_DASHBOARD: 'access_staff_dashboard',
  ACCESS_OWNER_DASHBOARD: 'access_owner_dashboard'
} as const

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS]

// Role-permission mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [USER_ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS), // All permissions
  
  [USER_ROLES.SALON_OWNER]: [
    PERMISSIONS.MANAGE_SALON,
    PERMISSIONS.MANAGE_STAFF,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.MANAGE_APPOINTMENTS,
    PERMISSIONS.VIEW_APPOINTMENTS,
    PERMISSIONS.VIEW_SCHEDULE,
    PERMISSIONS.ACCESS_OWNER_DASHBOARD
  ],
  
  [USER_ROLES.SALON_MANAGER]: [
    PERMISSIONS.MANAGE_SALON,
    PERMISSIONS.MANAGE_STAFF,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.MANAGE_APPOINTMENTS,
    PERMISSIONS.VIEW_APPOINTMENTS,
    PERMISSIONS.VIEW_SCHEDULE,
    PERMISSIONS.ACCESS_OWNER_DASHBOARD,
    PERMISSIONS.ACCESS_STAFF_DASHBOARD
  ],
  
  [USER_ROLES.STAFF]: [
    PERMISSIONS.MANAGE_APPOINTMENTS,
    PERMISSIONS.VIEW_APPOINTMENTS,
    PERMISSIONS.VIEW_SCHEDULE,
    PERMISSIONS.ACCESS_STAFF_DASHBOARD
  ],
  
  [USER_ROLES.CUSTOMER]: [
    PERMISSIONS.BOOK_APPOINTMENT,
    PERMISSIONS.VIEW_APPOINTMENTS
  ]
}