// Barrel exports for appointments actions
// Maintains clean public API for appointment operations

// CRUD Operations
export {
  createAppointmentAction,
  updateAppointmentAction,
  cancelAppointmentAction,
  type ActionResponse
} from './crud'

// Status Management
export {
  confirmAppointmentAction,
  checkInAppointmentAction,
  completeAppointmentAction,
  noShowAppointmentAction,
  rescheduleAppointmentAction
} from './status'

// Service Management
export {
  addAppointmentServiceAction,
  removeAppointmentServiceAction,
  addAppointmentNoteAction,
  bulkCancelAppointmentsAction
} from './services'

// Form Handlers
export {
  handleAppointmentFormAction
} from './form-handlers'

// Availability & Queries
export {
  checkAvailabilityAction,
  getStaffAppointmentsAction
} from './availability'
