'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import { assignServiceToStaff } from '../dal/staff-mutations'
import { removeServiceFromStaff } from '../dal/staff-mutations'
import { requireSalonContext, logSecurityEvent } from '@/core/auth/actions'
import { ActionResponse, ServiceAssignmentSchema } from './staff-action-types'

/**
 * Assign services to staff member
 */
export async function assignServicesToStaffAction(
  staffId: string,
  data: FormData | z.infer<typeof ServiceAssignmentSchema>
): Promise<ActionResponse> {
  try {
    const context = await requireSalonContext()
    if ('error' in context) return context

    const rawData = data instanceof FormData
      ? {
          service_ids: JSON.parse(data.get('service_ids') as string),
          can_modify_price: data.get('can_modify_price') === 'true',
          custom_duration: data.get('custom_duration') ? parseInt(data.get('custom_duration') as string) : undefined
        }
      : data

    const validatedData = ServiceAssignmentSchema.parse(rawData)

    // Assign each service to the staff member
    for (const serviceId of validatedData.service_ids) {
      await assignServiceToStaff(staffId, serviceId)
    }

    await logSecurityEvent({
      action: 'staff.services_assigned',
      resource_type: 'staff',
      resource_id: staffId,
      details: {
        service_count: validatedData.service_ids.length,
        service_ids: validatedData.service_ids,
        assigned_by: context.user.id
      }
    })

    revalidatePath(`/dashboard/staff/${staffId}`)
    revalidateTag(`staff-${staffId}-services`)
    revalidateTag(`salon-${context.salonId}-services`)

    return {
      success: true,
      message: `${validatedData.service_ids.length} services assigned successfully`
    }
  } catch (error) {
    console.error('[Server Action Error - assignServicesToStaff]:', error)

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation failed',
        fieldErrors: error.flatten().fieldErrors,
        code: 'VALIDATION_ERROR'
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to assign services',
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
    if ('error' in context) return context

    // Remove the service assignment
    await removeServiceFromStaff(staffId, serviceId)

    // Log security event
    await logSecurityEvent({
      action: 'staff.service_removed',
      resource_type: 'staff',
      resource_id: staffId,
      details: {
        service_id: serviceId,
        removed_by: context.user.id
      }
    })

    // Invalidate cache
    revalidatePath(`/dashboard/staff/${staffId}`)
    revalidateTag(`staff-${staffId}-services`)
    revalidateTag(`salon-${context.salonId}-services`)

    return {
      success: true,
      message: 'Service removed from staff member successfully'
    }
  } catch (error) {
    console.error('[Server Action Error - assignServicesToStaff]:', error)

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation failed',
        fieldErrors: error.flatten().fieldErrors,
        code: 'VALIDATION_ERROR'
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to assign services',
      code: 'OPERATION_FAILED'
    }
  }
}

/**
 * Update staff member's service pricing
 */
export async function updateStaffServicePricingAction(
  staffId: string,
  serviceId: string,
  pricing: {
    custom_price?: number
    custom_duration?: number
  }
): Promise<ActionResponse> {
  try {
    const context = await requireSalonContext()
    if ('error' in context) return context

    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()

    const { error } = await supabase
      .from('staff_services')
      .update({
        custom_price: pricing.custom_price,
        custom_duration: pricing.custom_duration,
        updated_at: new Date().toISOString()
      })
      .eq('staff_id', staffId)
      .eq('service_id', serviceId)
      .eq('salon_id', context.salonId)

    if (error) throw error

    // Log security event
    await logSecurityEvent({
      action: 'staff.service_pricing_updated',
      resource_type: 'staff',
      resource_id: staffId,
      details: {
        service_id: serviceId,
        updated_by: context.user.id,
        custom_price: pricing.custom_price,
        custom_duration: pricing.custom_duration
      }
    })

    // Invalidate cache
    revalidatePath(`/dashboard/staff/${staffId}`)
    revalidateTag(`staff-${staffId}-services`)

    return {
      success: true,
      message: 'Service pricing updated successfully'
    }
  } catch (error) {
    console.error('[Server Action Error - assignServicesToStaff]:', error)

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation failed',
        fieldErrors: error.flatten().fieldErrors,
        code: 'VALIDATION_ERROR'
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to assign services',
      code: 'OPERATION_FAILED'
    }
  }
}