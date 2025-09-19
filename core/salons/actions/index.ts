// Barrel exports for salons actions
// Maintains clean public API for salon operations

// Creation Operations
export {
  createSalonAction
} from './create'

// CRUD Operations
export {
  updateSalonAction,
  deleteSalonAction,
  type ActionResponse
} from './crud'

// Query Operations
export {
  getSalonsAction,
  getSalonByIdAction
} from './queries'

// Settings Management
export {
  updateSalonSettingsAction,
  toggleSalonStatusAction
} from './settings'

// Business Hours
export {
  updateBusinessHoursAction
} from './business-hours'
