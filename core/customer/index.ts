// Customer Portal Module Barrel Export

// Types
export type * from './types'

// DAL
// DAL functions are available via ./dal/* imports for server-side use only

// Actions
export * from './actions'

// Components
export * from './components/booking'
export * from './components/profile'

// Re-export commonly used components
export { SalonSearch, ServiceSelection, StaffSelection, TimeSelection, BookingConfirmation } from './components/booking'
export { ProfileHeader, PersonalInfoForm, PreferencesForm } from './components/profile'