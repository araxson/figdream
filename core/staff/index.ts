/**
 * Staff Module - Public API
 * Staff-facing functionality for work and schedule management
 */

// Staff portal actions
export {
  getStaffDashboard,
  getStaffSchedule,
  updateStaffSchedule,
  requestTimeOff,
  getStaffAppointments,
  checkInAppointment,
  completeAppointment,
  getStaffCustomers,
  updateCustomerNotes,
  getStaffEarnings,
  getStaffPerformance,
  updateStaffProfile,
  updateStaffAvailability
} from './actions';

// Staff hooks
export {
  useStaffDashboard,
  useStaffSchedule,
  useStaffAppointments,
  useStaffCustomers,
  useStaffEarnings,
  useStaffProfile
} from './hooks';

// Staff portal components
export {
  StaffDashboard,
  StaffScheduleManager,
  StaffAppointmentList,
  StaffCustomerView,
  StaffEarningsReport,
  StaffProfileEditor,
  TimeOffRequest,
  StaffCalendar
} from './components';

// Staff types
export type {
  StaffMember,
  StaffSchedule,
  StaffAppointment,
  StaffCustomer,
  StaffEarnings,
  StaffPerformance,
  TimeOffRequest as TimeOffRequestType,
  StaffAvailability
} from './types';