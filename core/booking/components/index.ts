/**
 * Booking Components - Public API
 *
 * Exports all booking-related UI components
 */

// Core booking components
export { BookingWizard } from './booking-wizard'
export { AvailabilityCalendar } from './availability-calendar'
export { BookingManager } from './booking-manager'
export { BookingLiveFeed } from './booking-live-feed'
export { BookingConfirmationComponent as BookingConfirmation } from './booking-confirmation'
export { BookingSummary } from './booking-summary'

// Additional components
export { BookingStepper } from "./booking-stepper";
export { ServiceSelector } from "./service-selector";
export { TimeSlotPicker } from "./time-slot-picker";

// Availability Calendar Sub-components
export { CalendarHeader } from './calendar-header'
export { TimeSlotGrid } from './time-slot-grid'
export { StaffAvailabilityDisplay } from './staff-availability-display'
export { CalendarConflicts } from './calendar-conflicts'

// Wizard steps (for advanced usage)
export { ServiceSelectionStep } from './wizard-steps/service-selection-step'
export { StaffSelectionStep } from './wizard-steps/staff-selection-step'
export { DateTimeSelectionStep } from './wizard-steps/datetime-selection-step'
export { CustomerInfoStep } from './wizard-steps/customer-info-step'
export { AddonsStep } from './wizard-steps/addons-step'
export { PaymentStep } from './wizard-steps/payment-step'
export { ConfirmationStep } from './wizard-steps/confirmation-step'

// Utilities (for advanced usage)
export * from './wizard-utils/wizard-types'
export * from './wizard-utils/wizard-state'
export * from './wizard-utils/wizard-helpers'