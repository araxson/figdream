'use server'

/**
 * Staff Actions - Barrel export for backward compatibility
 * Re-exports all actions from the modular structure
 */

// Import actions to re-export
import {
  createStaffMemberAction as _createStaffMemberAction,
  updateStaffMemberAction as _updateStaffMemberAction,
  deleteStaffMemberAction as _deleteStaffMemberAction,
  getStaffAction as _getStaffAction,
  getStaffByIdAction as _getStaffByIdAction,
  getStaffProfileByIdAction as _getStaffProfileByIdAction,
  getStaffProfilesAction as _getStaffProfilesAction,
  updateStaffScheduleAction as _updateStaffScheduleAction,
  toggleStaffAvailabilityAction as _toggleStaffAvailabilityAction,
  createTimeOffRequestAction as _createTimeOffRequestAction,
  assignServicesToStaffAction as _assignServicesToStaffAction,
  removeServiceFromStaffAction as _removeServiceFromStaffAction,
  updateStaffServicePricingAction as _updateStaffServicePricingAction,
  bulkActivateStaffAction as _bulkActivateStaffAction,
  bulkDeactivateStaffAction as _bulkDeactivateStaffAction,
  bulkUpdateStaffRoleAction as _bulkUpdateStaffRoleAction,
  bulkDeleteStaffAction as _bulkDeleteStaffAction,
  bulkUpdateCommissionRatesAction as _bulkUpdateCommissionRatesAction
} from './index'

// Re-export as async functions
export const createStaffMemberAction = _createStaffMemberAction
export const updateStaffMemberAction = _updateStaffMemberAction
export const deleteStaffMemberAction = _deleteStaffMemberAction
export const getStaffAction = _getStaffAction
export const getStaffByIdAction = _getStaffByIdAction
export const getStaffProfileByIdAction = _getStaffProfileByIdAction
export const getStaffProfilesAction = _getStaffProfilesAction
export const updateStaffScheduleAction = _updateStaffScheduleAction
export const toggleStaffAvailabilityAction = _toggleStaffAvailabilityAction
export const createTimeOffRequestAction = _createTimeOffRequestAction
export const assignServicesToStaffAction = _assignServicesToStaffAction
export const removeServiceFromStaffAction = _removeServiceFromStaffAction
export const updateStaffServicePricingAction = _updateStaffServicePricingAction
export const bulkActivateStaffAction = _bulkActivateStaffAction
export const bulkDeactivateStaffAction = _bulkDeactivateStaffAction
export const bulkUpdateStaffRoleAction = _bulkUpdateStaffRoleAction
export const bulkDeleteStaffAction = _bulkDeleteStaffAction
export const bulkUpdateCommissionRatesAction = _bulkUpdateCommissionRatesAction

// Add missing updateStaffStatusAction
export async function updateStaffStatusAction(
  staffId: string,
  status: 'active' | 'inactive' | 'on_leave' | 'terminated'
) {
  const { updateStaffMemberAction } = await import('./staff-crud-actions')

  return updateStaffMemberAction(staffId, {
    status,
    updated_at: new Date().toISOString()
  })
}