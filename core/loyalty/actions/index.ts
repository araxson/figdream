/**
 * Loyalty Actions Module - Barrel Export
 * Organized by operation domain for clean imports
 */

// Program Management Actions
export {
  createProgram,
  updateProgram,
  deleteProgram,
  getLoyaltyProgramStats
} from './program-actions'

// Points Operations
export {
  addLoyaltyPoints,
  awardPointsForAppointmentAction,
  adjustPointsAction,
  addLoyaltyTransactionAction,
  calculatePurchasePoints
} from './points-actions'

// Redemption Operations
export {
  redeemLoyaltyPoints,
  getAvailableRewards,
  applyRewardToAppointment,
  cancelRedemption
} from './redemption-actions'

// Tier Management
export {
  createTier,
  updateTier,
  deleteTier,
  getProgramTiers
} from './tier-actions'

// Customer Loyalty Management
export {
  enrollCustomerInProgram,
  unenrollCustomerFromProgram,
  updateCustomerLoyaltyAction,
  getCustomerLoyaltyInfo,
  getCustomerTransactionHistory
} from './customer-loyalty-actions'

// Shared Types and Helpers
export type { ActionResponse } from './loyalty-helpers'

// Re-export schemas for validation
export * from './loyalty-schemas'

// Export loyalty actions
export * from './loyalty-actions'