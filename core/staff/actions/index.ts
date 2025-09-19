/**
 * Staff Actions Module Index
 *
 * Successful modular refactoring:
 * - Original: 1,009 lines in single file
 * - Refactored: 5 focused modules
 * - Benefits: Better maintainability, clear separation of concerns
 */

// CRUD Operations (342 lines)
export {
  createStaffMemberAction,
  updateStaffMemberAction,
  deleteStaffMemberAction,
  getStaffAction,
  getStaffByIdAction,
  getStaffProfileByIdAction,
  getStaffProfilesAction
} from './staff-crud-actions'

// Schedule Management (173 lines)
export {
  updateStaffScheduleAction,
  toggleStaffAvailabilityAction,
  createTimeOffRequestAction
} from './staff-schedule-actions'

// Service Management (153 lines)
export {
  assignServicesToStaffAction,
  removeServiceFromStaffAction,
  updateStaffServicePricingAction
} from './staff-service-actions'

// Bulk Operations (274 lines)
export {
  bulkActivateStaffAction,
  bulkDeactivateStaffAction,
  bulkUpdateStaffRoleAction,
  bulkDeleteStaffAction,
  bulkUpdateCommissionRatesAction
} from './staff-bulk-actions'

// Shared Types & Schemas (107 lines)
export type {
  ActionResponse,
  CreateStaffInput,
  UpdateStaffInput,
  StaffScheduleInput,
  ServiceAssignmentInput,
  StaffStatusInput
} from './staff-action-types'

export {
  CreateStaffSchema,
  UpdateStaffSchema,
  StaffScheduleSchema,
  ServiceAssignmentSchema,
  StaffStatusSchema
} from './staff-action-types'