// Client-safe components only (no server components that use DAL)
export { AppointmentsList } from "./list";
export { AppointmentsStats } from "./stats";
export { AppointmentFilters as AppointmentFiltersComponent } from "./filters";
export { AppointmentsEmptyState } from "./empty-state";
export { CalendarView } from "./calendar-view";

// Enhanced client components
export { AppointmentForm } from "./appointment-form";
export { CalendarEnhanced } from "./calendar-enhanced";
export { AppointmentDetailsModal } from "./appointment-details-modal";
export { AvailabilityChecker } from "./availability-checker";
export { AppointmentListEnhanced } from "./appointment-list-enhanced";

// Appointment Form Sub-components
export { CustomerSelection } from './customer-selection'
export { ServiceSelection } from './service-selection'
export { ScheduleSelection } from './schedule-selection'
export { PaymentDetails } from './payment-details'

// Client component wrapper (safe for barrel export)
export { AppointmentsPageClient as AppointmentsPageClientComponent } from "./appointments-page-client";

// Note: Server components should NEVER be exported from barrel files
// They should be imported directly in pages where needed
// This prevents client components from accidentally importing server components
