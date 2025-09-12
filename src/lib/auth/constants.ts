// Centralized authentication constants to ensure consistency across the application
// These match the database enum: public.user_role

export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  SALON_OWNER: 'salon_owner', 
  SALON_MANAGER: 'salon_manager',
  STAFF: 'staff',
  CUSTOMER: 'customer'
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// Role hierarchy for permission checking
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [USER_ROLES.SUPER_ADMIN]: 100,
  [USER_ROLES.SALON_OWNER]: 80,
  [USER_ROLES.SALON_MANAGER]: 60,
  [USER_ROLES.STAFF]: 40,
  [USER_ROLES.CUSTOMER]: 20
};

// Route access mappings
export const ROLE_ROUTES: Record<UserRole, string> = {
  [USER_ROLES.SUPER_ADMIN]: '/admin',
  [USER_ROLES.SALON_OWNER]: '/dashboard',
  [USER_ROLES.SALON_MANAGER]: '/dashboard',
  [USER_ROLES.STAFF]: '/staff',
  [USER_ROLES.CUSTOMER]: '/customer'
};

// Roles that can access admin panel
export const ADMIN_ROLES: UserRole[] = [
  USER_ROLES.SUPER_ADMIN
];

// Roles that can access dashboard
export const DASHBOARD_ROLES: UserRole[] = [
  USER_ROLES.SUPER_ADMIN,
  USER_ROLES.SALON_OWNER,
  USER_ROLES.SALON_MANAGER
];

// Roles that can access staff area
export const STAFF_ROLES: UserRole[] = [
  USER_ROLES.SUPER_ADMIN,
  USER_ROLES.SALON_OWNER,
  USER_ROLES.SALON_MANAGER,
  USER_ROLES.STAFF
];

// Helper function to check if a role has permission
export function hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

// Helper function to check if role is in allowed list
export function isRoleAllowed(userRole: string | null | undefined, allowedRoles: UserRole[]): boolean {
  if (!userRole) return false;
  return allowedRoles.includes(userRole as UserRole);
}