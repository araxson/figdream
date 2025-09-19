// DEPRECATED: Use modular actions instead
// This file maintains backward compatibility during transition

// Re-export all actions from the new modular structure
export {
  createServiceAction,
  updateServiceAction,
  deleteServiceAction,
  duplicateServiceAction,
  toggleServiceFeaturedAction,
  toggleServiceBookableAction,
  bulkUpdateServicesAction,
  bulkDeleteServicesAction,
  assignServiceToStaffAction,
  updateStaffServiceAction,
  removeServiceFromStaffAction,
  updateServiceCategoryAction,
  handleServiceFormAction,
  type ActionResponse
} from './index'