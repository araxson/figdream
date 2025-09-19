'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireSalonContext, logSecurityEvent } from '@/core/auth/actions'
import { ActionResponse } from './staff-action-types'
import { z } from 'zod'

// Validation schemas
const BulkStaffIdsSchema = z.object({
  staffIds: z.array(z.string().uuid('Invalid staff ID')).min(1, 'At least one staff member is required')
})

const BulkUpdateRoleSchema = z.object({
  staffIds: z.array(z.string().uuid('Invalid staff ID')).min(1, 'At least one staff member is required'),
  role: z.string().min(1, 'Role is required')
})

/**
 * Bulk activate staff members
 */
export async function bulkActivateStaffAction(
  staffIds: string[]
): Promise<ActionResponse> {
  try {
    const context = await requireSalonContext()
    if ('error' in context) return context

    const supabase = await createClient()
    const { error } = await supabase
      .from('staff_profiles')
      .update({
        is_active: true,
        updated_at: new Date().toISOString()
      })
      .in('id', staffIds)
      .eq('salon_id', context.salonId)

    if (error) throw error

    await logSecurityEvent({
      action: 'staff.bulk_activated',
      resource_type: 'staff',
      resource_id: staffIds.join(','),
      details: {
        count: staffIds.length,
        updated_by: context.user.id
      }
    })

    revalidatePath('/dashboard/staff')
    revalidateTag(`salon-${context.salonId}-staff`)

    return {
      success: true,
      message: `${staffIds.length} staff members activated successfully`
    }
  } catch (error) {
    console.error('[Server Action Error - bulkActivateStaff]:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to activate staff members',
      code: 'OPERATION_FAILED'
    }
  }
}

/**
 * Bulk deactivate staff members
 */
export async function bulkDeactivateStaffAction(
  staffIds: string[]
): Promise<ActionResponse> {
  try {
    const context = await requireSalonContext()
    if ('error' in context) return context

    const supabase = await createClient()
    const { error } = await supabase
      .from('staff_profiles')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .in('id', staffIds)
      .eq('salon_id', context.salonId)

    if (error) throw error

    await logSecurityEvent({
      action: 'staff.bulk_deactivated',
      resource_type: 'staff',
      resource_id: staffIds.join(','),
      details: {
        count: staffIds.length,
        updated_by: context.user.id
      }
    })

    revalidatePath('/dashboard/staff')
    revalidateTag(`salon-${context.salonId}-staff`)

    return {
      success: true,
      message: `${staffIds.length} staff members deactivated successfully`
    }
  } catch (error) {
    console.error('[Server Action Error - bulkActivateStaff]:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to activate staff members',
      code: 'OPERATION_FAILED'
    }
  }
}

/**
 * Bulk update staff role
 */
export async function bulkUpdateStaffRoleAction(
  staffIds: string[],
  role: string
): Promise<ActionResponse> {
  try {
    const context = await requireSalonContext()
    if ('error' in context) return context

    const supabase = await createClient()
    const { error } = await supabase
      .from('staff_profiles')
      .update({
        role: role,
        updated_at: new Date().toISOString()
      })
      .in('id', staffIds)
      .eq('salon_id', context.salonId)

    if (error) throw error

    await logSecurityEvent({
      action: 'staff.bulk_role_updated',
      resource_type: 'staff',
      resource_id: staffIds.join(','),
      details: {
        count: staffIds.length,
        new_role: role,
        updated_by: context.user.id
      }
    })

    revalidatePath('/dashboard/staff')
    revalidateTag(`salon-${context.salonId}-staff`)

    return {
      success: true,
      message: `${staffIds.length} staff members updated to ${role} successfully`
    }
  } catch (error) {
    console.error('[Server Action Error - bulkActivateStaff]:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to activate staff members',
      code: 'OPERATION_FAILED'
    }
  }
}

/**
 * Bulk delete staff members
 */
export async function bulkDeleteStaffAction(
  staffIds: string[]
): Promise<ActionResponse> {
  try {
    const context = await requireSalonContext()
    if ('error' in context) return context

    const supabase = await createClient()

    // Check for active appointments
    const { data: activeAppointments } = await supabase
      .from('appointments')
      .select('staff_id')
      .in('staff_id', staffIds)
      .in('status', ['pending', 'confirmed'])

    if (activeAppointments && activeAppointments.length > 0) {
      return {
        success: false,
        error: 'Cannot delete staff members with active appointments',
        code: 'HAS_ACTIVE_APPOINTMENTS'
      }
    }

    // Soft delete all staff members
    const { error } = await supabase
      .from('staff_profiles')
      .update({
        is_active: false,
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .in('id', staffIds)
      .eq('salon_id', context.salonId)

    if (error) throw error

    await logSecurityEvent({
      action: 'staff.bulk_deleted',
      resource_type: 'staff',
      resource_id: staffIds.join(','),
      details: {
        count: staffIds.length,
        deleted_by: context.user.id
      }
    })

    revalidatePath('/dashboard/staff')
    revalidateTag(`salon-${context.salonId}-staff`)

    return {
      success: true,
      message: `${staffIds.length} staff members deleted successfully`
    }
  } catch (error) {
    console.error('[Server Action Error - bulkActivateStaff]:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to activate staff members',
      code: 'OPERATION_FAILED'
    }
  }
}

/**
 * Bulk update staff commission rates
 */
export async function bulkUpdateCommissionRatesAction(
  staffIds: string[],
  commissionRate: number
): Promise<ActionResponse> {
  try {
    const context = await requireSalonContext()
    if ('error' in context) return context

    const supabase = await createClient()
    const { error } = await supabase
      .from('staff_profiles')
      .update({
        commission_rate: commissionRate,
        updated_at: new Date().toISOString()
      })
      .in('id', staffIds)
      .eq('salon_id', context.salonId)

    if (error) throw error

    // Log security event
    await logSecurityEvent({
      action: 'staff.bulk_commission_updated',
      resource_type: 'staff',
      resource_id: staffIds.join(','),
      details: {
        count: staffIds.length,
        new_rate: commissionRate,
        updated_by: context.user.id
      }
    })

    // Invalidate cache
    revalidatePath('/dashboard/staff')
    revalidateTag(`salon-${context.salonId}-staff`)

    return {
      success: true,
      message: `Commission rates updated for ${staffIds.length} staff members`
    }
  } catch (error) {
    console.error('[Server Action Error - bulkActivateStaff]:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to activate staff members',
      code: 'OPERATION_FAILED'
    }
  }
}