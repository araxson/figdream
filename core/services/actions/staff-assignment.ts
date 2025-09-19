'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import {
  assignServiceToStaff,
  updateStaffService,
  removeServiceFromStaff
} from '../dal/services-mutations'
import { requireSalonContext, logSecurityEvent } from '@/core/auth/actions/auth-helpers'
import type { ActionResponse } from './crud'

/**
 * Assign service to staff member
 */
export async function assignServiceToStaffAction(
  staffId: string,
  serviceId: string,
  overrides?: { price?: number; duration?: number }
): Promise<ActionResponse> {
  try {
    const context = await requireSalonContext()

    await assignServiceToStaff(staffId, serviceId, overrides)

    await logSecurityEvent('service.assign_staff', {
      staff_id: staffId,
      service_id: serviceId,
      salon_id: context.salonId,
      overrides,
      user_id: context.user.id
    })

    revalidatePath('/dashboard/staff')
    revalidatePath(`/dashboard/staff/${staffId}`)
    revalidateTag(`staff-services-${staffId}`)

    return {
      success: true,
      message: 'Service assigned to staff member'
    }

  } catch (error) {
    console.error('[Server Action Error - assignServiceToStaff]:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to assign service',
      code: 'OPERATION_FAILED'
    }
  }
}

/**
 * Update staff service assignment
 */
export async function updateStaffServiceAction(
  staffId: string,
  serviceId: string,
  data: { price_override?: number; duration_override?: number; is_available?: boolean }
): Promise<ActionResponse> {
  try {
    const context = await requireSalonContext()

    await updateStaffService(staffId, serviceId, data)

    await logSecurityEvent('service.update_staff_assignment', {
      staff_id: staffId,
      service_id: serviceId,
      salon_id: context.salonId,
      changes: data,
      user_id: context.user.id
    })

    revalidatePath('/dashboard/staff')
    revalidatePath(`/dashboard/staff/${staffId}`)
    revalidateTag(`staff-services-${staffId}`)

    return {
      success: true,
      message: 'Staff service assignment updated'
    }

  } catch (error) {
    console.error('[Server Action Error - updateStaffService]:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update assignment',
      code: 'OPERATION_FAILED'
    }
  }
}

/**
 * Remove service from staff member
 */
export async function removeServiceFromStaffAction(
  staffId: string,
  serviceId: string
): Promise<ActionResponse> {
  try {
    const context = await requireSalonContext()

    await removeServiceFromStaff(staffId, serviceId)

    await logSecurityEvent('service.remove_staff', {
      staff_id: staffId,
      service_id: serviceId,
      salon_id: context.salonId,
      user_id: context.user.id
    })

    revalidatePath('/dashboard/staff')
    revalidatePath(`/dashboard/staff/${staffId}`)
    revalidateTag(`staff-services-${staffId}`)

    return {
      success: true,
      message: 'Service removed from staff member'
    }

  } catch (error) {
    console.error('[Server Action Error - removeServiceFromStaff]:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to remove service',
      code: 'OPERATION_FAILED'
    }
  }
}
