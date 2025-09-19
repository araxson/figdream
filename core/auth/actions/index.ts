// Note: This is an index file for re-exports. Individual action files have their own 'use server' directives.
// Re-export authentication functions for backward compatibility
export {
  login,
  logout,
  sendOTP,
  verifyOTP,
  refreshSession,
  validateSession,
  type AuthResponse,
} from './authentication';

// Re-export authorization functions
export {
  getCurrentUser,
  hasRole,
  hasAnyRole,
  isAdmin,
  isStaffOrHigher,
  isManagerOrHigher,
  isOwnerOrAdmin,
  hasSalonAccess,
  ownsSalon,
  canManageAppointments,
  canManageStaff,
  canViewFinancials,
  canAccessCustomerData,
  requireAuth,
  requireRole,
  requireAnyRole,
  requireSalonAccess,
  type UserRole,
  type AuthUserData,
} from './authorization';

// Re-export user management functions
export {
  register,
  forgotPassword,
  resetPassword,
  updateProfile,
  changePassword,
  updateEmail,
  deleteAccount,
} from './user-management';

// Re-export security audit functions
export {
  logSecurityEvent,
  logAuthenticationAttempt,
  logLogout,
  logPasswordChange,
  logRoleChange,
  logDataAccess,
  logFailedAuthorization,
  logSuspiciousActivity,
  getUserSecurityEvents,
  getRecentSecurityEvents,
  checkSuspiciousPatterns,
  generateSecurityReport,
  type SecurityEventType,
  type SecurityEvent,
} from './security-audit';