export const MESSAGES = {
  // Success messages
  SUCCESS: {
    LOGIN: 'Welcome back! You have successfully logged in.',
    REGISTER: 'Account created successfully! Please check your email to verify your account.',
    LOGOUT: 'You have been logged out successfully.',
    APPOINTMENT_BOOKED: 'Your appointment has been booked successfully!',
    APPOINTMENT_CANCELLED: 'Your appointment has been cancelled.',
    APPOINTMENT_RESCHEDULED: 'Your appointment has been rescheduled.',
    PROFILE_UPDATED: 'Your profile has been updated successfully.',
    PASSWORD_RESET_SENT: 'Password reset instructions have been sent to your email.',
    PASSWORD_UPDATED: 'Your password has been updated successfully.',
    REVIEW_SUBMITTED: 'Thank you for your review!',
    SERVICE_ADDED: 'Service added successfully.',
    SERVICE_UPDATED: 'Service updated successfully.',
    SERVICE_DELETED: 'Service deleted successfully.',
    STAFF_ADDED: 'Staff member added successfully.',
    STAFF_UPDATED: 'Staff member updated successfully.',
    CUSTOMER_ADDED: 'Customer added successfully.',
    CUSTOMER_UPDATED: 'Customer information updated.',
    CAMPAIGN_SENT: 'Campaign sent successfully.',
  },
  
  // Error messages
  ERROR: {
    GENERIC: 'Something went wrong. Please try again.',
    NETWORK: 'Network error. Please check your connection.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    NOT_FOUND: 'The requested resource was not found.',
    LOGIN_FAILED: 'Invalid email or password.',
    REGISTER_FAILED: 'Failed to create account. Please try again.',
    EMAIL_IN_USE: 'This email is already registered.',
    APPOINTMENT_CONFLICT: 'This time slot is no longer available.',
    BOOKING_FAILED: 'Failed to book appointment. Please try again.',
    INVALID_DATE: 'Please select a valid date.',
    INVALID_TIME: 'Please select a valid time.',
    PAST_DATE: 'Cannot book appointments in the past.',
    TOO_FAR_ADVANCE: 'Cannot book appointments more than 30 days in advance.',
    INSUFFICIENT_NOTICE: 'Appointments must be booked at least 2 hours in advance.',
    CANCELLATION_WINDOW: 'Appointments must be cancelled at least 24 hours in advance.',
    INVALID_PHONE: 'Please enter a valid phone number.',
    INVALID_EMAIL: 'Please enter a valid email address.',
    PAYMENT_FAILED: 'Payment processing failed. Please try again.',
    REVIEW_EXISTS: 'You have already reviewed this appointment.',
    SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  },
  
  // Validation messages
  VALIDATION: {
    REQUIRED: 'This field is required.',
    EMAIL: 'Please enter a valid email address.',
    PHONE: 'Please enter a valid phone number.',
    PASSWORD_MIN: 'Password must be at least 8 characters.',
    PASSWORD_MATCH: 'Passwords do not match.',
    PASSWORD_STRENGTH: 'Password must contain uppercase, lowercase, and numbers.',
    NAME_MIN: 'Name must be at least 2 characters.',
    NAME_MAX: 'Name cannot exceed 50 characters.',
    MESSAGE_MAX: 'Message cannot exceed 500 characters.',
    FUTURE_DATE: 'Please select a future date.',
    BUSINESS_HOURS: 'Please select a time during business hours.',
  },
  
  // Confirmation messages
  CONFIRM: {
    CANCEL_APPOINTMENT: 'Are you sure you want to cancel this appointment?',
    DELETE_SERVICE: 'Are you sure you want to delete this service?',
    DELETE_CUSTOMER: 'Are you sure you want to delete this customer?',
    LOGOUT: 'Are you sure you want to log out?',
    UNSAVED_CHANGES: 'You have unsaved changes. Are you sure you want to leave?',
  },
  
  // Info messages
  INFO: {
    NO_APPOINTMENTS: 'You have no upcoming appointments.',
    NO_SERVICES: 'No services available.',
    NO_AVAILABILITY: 'No available time slots for this date.',
    NO_STAFF: 'No staff members available.',
    NO_REVIEWS: 'No reviews yet.',
    LOADING: 'Loading...',
    SAVING: 'Saving...',
    PROCESSING: 'Processing...',
    SENDING: 'Sending...',
  },
} as const

export type MessageKey = keyof typeof MESSAGES
export type SuccessMessage = keyof typeof MESSAGES.SUCCESS
export type ErrorMessage = keyof typeof MESSAGES.ERROR
export type ValidationMessage = keyof typeof MESSAGES.VALIDATION
export type ConfirmMessage = keyof typeof MESSAGES.CONFIRM
export type InfoMessage = keyof typeof MESSAGES.INFO