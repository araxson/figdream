/**
 * Central export file for all FigDream validation schemas
 * Import validation schemas and types from this single entry point
 */

// Authentication schemas
export * from './auth-schema'

// Booking schemas
export * from './booking-schema'

// User profile schemas
export * from './user-schema'

// Salon management schemas
export * from './salon-schema'

// Service schemas
export * from './service-schema'

// Payment schemas
export * from './payment-schema'

// Re-export commonly used validation utilities
export { z } from 'zod'

// Type-only exports for better organization
export type {
  // Auth types
  LoginInput,
  RegisterInput,
  SalonOwnerRegisterInput,
  StaffRegisterInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  ChangePasswordInput
} from './auth-schema'

export type {
  // Booking types
  CreateBookingInput,
  UpdateBookingInput,
  CancelBookingInput,
  ConfirmBookingInput,
  CompleteBookingInput,
  BookingFilterInput
} from './booking-schema'

export type {
  // User types
  UserProfileInput,
  UpdateUserProfileInput,
  UserPreferencesInput,
  NotificationPreferencesInput,
  StaffProfileInput,
  UserFilterInput
} from './user-schema'

export type {
  // Salon types
  CreateSalonInput,
  UpdateSalonInput,
  CreateLocationInput,
  UpdateLocationInput,
  SalonSettingsInput,
  SalonFilterInput
} from './salon-schema'

export type {
  // Service types
  ServiceInput,
  UpdateServiceInput,
  ServiceCategoryInput,
  SalonServiceInput,
  StaffServiceInput,
  ServiceFilterInput
} from './service-schema'

export type {
  // Payment types
  CreatePaymentInput,
  ConfirmPaymentInput,
  RefundPaymentInput,
  SavedPaymentMethodInput,
  PaymentFilterInput,
  CreditCardPaymentInput
} from './payment-schema'