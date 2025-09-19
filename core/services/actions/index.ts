// Barrel exports for services actions
// Maintains clean public API for service operations

// Creation Operations
export {
  createServiceAction
} from './create'

// CRUD Operations
export {
  updateServiceAction,
  deleteServiceAction,
  duplicateServiceAction,
  type ActionResponse
} from './crud'

// Staff Assignment
export {
  assignServiceToStaffAction,
  updateStaffServiceAction,
  removeServiceFromStaffAction
} from './staff-assignment'

// Management Operations
export {
  toggleServiceFeaturedAction,
  toggleServiceBookableAction,
  bulkUpdateServicesAction,
  bulkDeleteServicesAction,
  updateServiceCategoryAction
} from './management'

// Form Handlers
export {
  handleServiceFormAction
} from './form-handlers'
