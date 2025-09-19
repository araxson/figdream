// DEPRECATED: Use modular actions instead
// This file maintains backward compatibility during transition

// Re-export all actions from the new modular structure
export {
  createSalonAction,
  updateSalonAction,
  deleteSalonAction,
  getSalonsAction,
  getSalonByIdAction,
  updateSalonSettingsAction,
  toggleSalonStatusAction,
  updateBusinessHoursAction,
  type ActionResponse
} from './index'