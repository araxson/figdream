/**
 * Customers Module - Public API
 */

// Export components
export * from "./components";

// Export hooks
export * from "./hooks/use-customers";

// Export types (database types)
export type {
  // Database types only (avoid name conflicts with components)
  CustomerProfile as CustomerProfileType,
  CustomerProfileInsert,
  CustomerProfileUpdate,
  CustomerPreference,
  CustomerPreferenceInsert,
  CustomerPreferenceUpdate,
  CustomerFavorite,
  CustomerFavoriteInsert,
  CustomerNote as CustomerNoteType,
  CustomerNoteInsert,
  CustomerNoteUpdate,
  LoyaltyPoints,
  CustomerWithDetails,
  CustomerFilters as CustomerFiltersType,
  CustomerMetrics as CustomerMetricsType
} from "./types";

// Export DAL functions (for server-side use only)
export * from "./dal/customers-queries";
export * from "./dal/customers-mutations";

// Export actions
// export * from './actions/customers' // TODO: Create when needed
