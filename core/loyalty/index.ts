/**
 * Loyalty Module - Public API
 */

// Export components
export * from "./components";

// Export types (already includes DAL types via re-export)
export * from "./types";

// Export DAL functions only (not types to avoid duplicates)
export {
  // Queries
  getLoyaltyProgram,
  getLoyaltyTiers,
  getCustomerLoyaltyStatus,
  getCustomerTransactions,
  getRedemptionOptions,
  // Mutations
  createLoyaltyProgram,
  updateLoyaltyProgram,
  deleteLoyaltyProgram,
  addLoyaltyPoints,
  redeemPoints,
  adjustPoints
} from "./dal";

// Export hooks
export * from "./hooks";

// Export actions
export * from "./actions";