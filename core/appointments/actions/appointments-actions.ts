// DEPRECATED: Use modular actions instead
// This file maintains backward compatibility during transition

// Re-export all actions from the new modular structure
export {
  createAppointmentAction,
  updateAppointmentAction,
  cancelAppointmentAction,
  confirmAppointmentAction,
  checkInAppointmentAction,
  completeAppointmentAction,
  noShowAppointmentAction,
  rescheduleAppointmentAction,
  addAppointmentServiceAction,
  removeAppointmentServiceAction,
  addAppointmentNoteAction,
  bulkCancelAppointmentsAction,
  handleAppointmentFormAction,
  checkAvailabilityAction,
  getStaffAppointmentsAction,
  type ActionResponse
} from './index'