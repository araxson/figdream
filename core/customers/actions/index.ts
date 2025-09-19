/**
 * Customer Actions - Server Actions for customer management
 *
 * This module provides all server actions for customer operations,
 * organized by domain for better maintainability.
 */

// CRUD Operations
export {
  createCustomerAction,
  updateCustomerAction,
  deleteCustomerAction
} from './customer-crud-actions'

// Profile Management
export {
  toggleCustomerStatusAction,
  toggleVIPStatusAction
} from './customer-profile-actions'

// Preferences & Favorites
export {
  updateCustomerPreferencesAction,
  addToFavoritesAction,
  addCustomerNoteAction
} from './customer-preferences-actions'

// Analytics & Data Retrieval
export {
  getCustomersAction,
  getCustomerByIdAction,
  getCustomerMetricsAction,
  getCustomerAppointmentsAction,
  getCustomerFavoritesAction
} from './customer-analytics-actions'

// Re-export schemas and types
export type { ActionResponse } from './customer-schemas'
export {
  CreateCustomerSchema,
  UpdateCustomerSchema,
  CustomerPreferencesSchema,
  CustomerNoteSchema
} from './customer-schemas'