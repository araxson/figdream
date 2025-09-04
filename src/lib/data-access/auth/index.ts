// CRITICAL: Auth module exports with conflict resolution
// This module carefully manages exports to avoid naming conflicts

// Export all auth functions (sign in, sign up, password reset, etc.)
export {
  signInWithEmail,
  signUpWithEmail,
  signOut as signOutUser,  // Rename to avoid conflict with session.ts
  sendPasswordResetOtp,
  verifyPasswordResetOtp,
  updatePasswordWithOtp,
  verifyOtp,
  sendPasswordResetEmail,
  updatePassword
} from './auth-functions'

// Export guards
export * from './guards'
export * from './api-guards'

// From permissions.ts - export functions that don't conflict
export {
  type Permission,
  rolePermissions,
  roleHasPermission,
  roleHasAnyPermission,
  roleHasAllPermissions,
  getRolePermissions,
  permissionGroups,
  getPermissionLabel,
  userOwnsResource,
  canUserPerformAction,
  canAccessAppointment
  // NOT exporting: canAccessSalon, canAccessLocation (conflicts with utils)
} from './permissions'

// From roles.ts - export role check functions
export {
  hasMinimumRoleLevel,
  getRoleLevel,
  updateUserRole,
  canManageSalons,
  canManageLocations,
  canManageStaff,
  canViewAllData
  // NOT exporting: hasRole, hasAnyRole, isAdmin, etc. (conflicts with utils)
} from './roles'

// From utils.ts - export all utility functions and types
export {
  type UserRole,
  getUserRole,
  getRoleRedirectPath,
  isValidRole,
  // Permission helpers (take precedence over permissions.ts)
  canAccessLocation,
  canAccessSalon,
  // Role checkers (take precedence over roles.ts)
  hasRole,
  hasAnyRole,
  isAdmin,
  isCustomer,
  isLocationManager,
  isSalonOwner,
  isStaff,
  isSuperAdmin
} from './utils'

// From verify.ts - export verification functions except getUserRole
export {
  getUser,
  getUserWithRole,
  verifyAuthenticated,
  // NOT exporting: getUserRole (conflicts with utils)
  getUserId,
  refreshSession as refreshAuthSession // Renamed to avoid conflict with session.ts
} from './verify'

// From session.ts - export all session functions and types
export {
  type SessionUser,
  verifySession,
  getCurrentUser,
  getCurrentSession,
  refreshSession,
  signOut,
  isAuthenticated,
  getSessionRole,
  currentUserHasRole,
  currentUserHasAnyRole,
  currentUserIsAdmin,
  getSessionSalonId,
  getSessionLocationId,
  getSessionStaffId,
  requireAdmin,
  storeSessionMetadata,
  getSessionMetadata,
  clearSessionMetadata
} from './session'

// From dal-security.ts - export DAL security functions and types
export {
  type SecureUserDTO,
  type AuthContext,
  getAuthContext,
  createSecureUserDTO,
  requireAuth,
  requireRole,
  requireAnyRole,
  requireResourceAccess,
  secureDataAccess,
  logDataAccess
} from './dal-security'