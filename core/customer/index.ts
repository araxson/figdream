/**
 * Customer Module - Public API
 * Customer-facing functionality for the booking platform
 */

// Actions - Server actions for customer operations
export {
  // Profile actions
  profileActions
} from './actions/profile-actions';

export {
  // Booking actions
  createBookingAction,
  updateBookingStatusAction,
  rescheduleBookingAction,
  cancelBookingAction,
  quickBookingAction
} from './actions/booking-actions';

export {
  // Loyalty enrollment actions
  enrollCustomerInProgram,
  unenrollCustomerFromProgram,
  updateCustomerLoyaltyDetails
} from './actions/customer-loyalty-enrollment-actions';

export {
  // Loyalty points actions
  awardPointsForAppointmentAction,
  getCustomerLoyaltyInfo,
  addLoyaltyTransactionAction
} from './actions/customer-loyalty-points-actions';

// Hooks - React hooks for data fetching and state management
export {
  useBookings,
  useBookingFeed,
  useCalendarLogic,
  useBookingWebsocket
} from './hooks';

export {
  useFavorites,
  useFavoritesMutations
} from './hooks';

export {
  useGiftCards,
  usePackages
} from './hooks';

export {
  useReviews,
  useReviewsMutations
} from './hooks';

// Components - React components for customer interfaces
export {
  CustomerDashboard,
  BookingWizard,
  BookingConfirmation,
  AppointmentHistory,
  AvailabilityCalendar,
  ServiceSelection,
  StaffSelection,
  TimeSelection,
  BookingManager,
  FavoritesList
} from './components';

export {
  CustomerProfile,
  CustomerPreferences,
  PersonalInfoForm,
  PreferencesForm
} from './components';

export {
  LoyaltyDashboard,
  LoyaltyAnalytics,
  MembersList,
  TransactionsList,
  PointsDialog
} from './components';

// Data Access Layer - Database operations
export {
  getCustomerProfile,
  getCustomerAppointments,
  getCustomerFavorites,
  getCustomerReviews,
  getAvailableSalons,
  getSalonServices,
  getAvailableStaff,
  getCustomerLoyaltyPoints,
  getCustomerGiftCards
} from './dal';

export {
  updateCustomerProfile,
  createAppointment,
  cancelAppointment,
  rescheduleAppointment,
  addToFavorites,
  removeFromFavorites,
  createReview,
  updateLoyaltyPoints
} from './dal';

// Types - TypeScript interfaces and types
export type {
  CustomerPortalTypes,
  BookingTypes,
  LoyaltyTypes,
  FavoritesTypes,
  ReviewsTypes,
  GiftCardTypes,
  PackageTypes
} from './types';