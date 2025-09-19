'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { updateStaffSchedule, toggleStaffBookable } from '../dal/staff-mutations'
import { getStaffById } from '../dal/staff-queries'
import type { StaffScheduleInsert } from '../dal/staff-types'
import { requireSalonContext, logSecurityEvent } from '@/core/auth/actions/auth-helpers'
import { ActionResponse, StaffScheduleSchema } from './staff-action-types'

/**
 * Update staff member's weekly schedule
 */
export async function updateStaffScheduleAction(
  staffId: string,
  data: FormData | z.infer<typeof StaffScheduleSchema>
): Promise<ActionResponse> {
  try {
    const context = await requireSalonContext()
    if ('error' in context) return context

    const rawData = data instanceof FormData
      ? JSON.parse(data.get('schedule') as string)
      : data

    const validatedData = StaffScheduleSchema.parse(rawData)
    const supabase = await createClient()

    // Update schedule for each day
    for (const [day, schedule] of Object.entries(validatedData)) {
      if (schedule && schedule.enabled) {
        const scheduleData: StaffScheduleInsert = {
          staff_id: staffId,
          salon_id: context.salonId,
          day_of_week: day as any,
          start_time: schedule.start_time,
          end_time: schedule.end_time,
          break_start: schedule.break_start,
          break_end: schedule.break_end,
          is_available: true
        }

        await updateStaffSchedule(staffId, day as any, scheduleData)
      } else if (schedule && !schedule.enabled) {
        // Delete schedule for this day
        await supabase
          .from('staff_schedules')
          .delete()
          .eq('staff_id', staffId)
          .eq('day_of_week', day)
      }
    }

    await logSecurityEvent({
      action: 'staff.schedule_updated',
      resource_type: 'staff',
      resource_id: staffId,
      details: {
        updated_by: context.user.id
      }
    })

    revalidatePath(`/dashboard/staff/${staffId}`)
    revalidateTag(`staff-${staffId}-schedule`)
    revalidateTag(`salon-${context.salonId}-availability`)

    return {
      success: true,
      message: 'Staff schedule updated successfully'
    }
  } catch (error) {
    console.error('[Server Action Error - updateStaffSchedule]:', error)

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
      error: error instanceof Error ? error.message : 'Failed to update staff schedule',
      code: 'OPERATION_FAILED'
    }
  }
}

/**
 * Toggle staff availability (bookable status)
 */
export async function toggleStaffAvailabilityAction(
  staffId: string
): Promise<ActionResponse<{ is_bookable: boolean }>> {
  try {
    const context = await requireSalonContext()
    if ('error' in context) return context

    // Toggle bookable status
    await toggleStaffBookable(staffId)

    // Get updated status
    const staff = await getStaffById(staffId)

    // Log security event
    await logSecurityEvent({
      action: staff?.is_bookable ? 'staff.made_available' : 'staff.made_unavailable',
      resource_type: 'staff',
      resource_id: staffId,
      details: {
        updated_by: context.user.id
      }
    })

    // Invalidate cache
    revalidatePath('/dashboard/staff')
    revalidateTag(`staff-${staffId}`)
    revalidateTag(`salon-${context.salonId}-availability`)

    return {
      success: true,
      data: { is_bookable: staff?.is_bookable || false },
      message: `Staff member is now ${staff?.is_bookable ? 'available' : 'unavailable'} for booking`
    }
  } catch (error) {
    console.error('[Server Action Error - updateStaffSchedule]:', error)

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
      error: error instanceof Error ? error.message : 'Failed to update staff schedule',
      code: 'OPERATION_FAILED'
    }
  }
}

/**
 * Create time off request for staff
 */
export async function createTimeOffRequestAction(
  staffId: string,
  data: {
    start_date: string
    end_date: string
    reason?: string
  }
): Promise<ActionResponse> {
  try {
    const context = await requireSalonContext()
    if ('error' in context) return context

    const supabase = await createClient()
    const { error } = await supabase
      .from('staff_time_off')
      .insert({
        staff_id: staffId,
        salon_id: context.salonId,
        start_date: data.start_date,
        end_date: data.end_date,
        reason: data.reason,
        status: 'pending',
        requested_by: context.user.id,
        created_at: new Date().toISOString()
      })

    if (error) throw error

    // Log security event
    await logSecurityEvent({
      action: 'staff.time_off_requested',
      resource_type: 'staff',
      resource_id: staffId,
      details: {
        start_date: data.start_date,
        end_date: data.end_date,
        requested_by: context.user.id
      }
    })

    // Invalidate cache
    revalidatePath(`/dashboard/staff/${staffId}`)
    revalidateTag(`staff-${staffId}-time-off`)

    return {
      success: true,
      message: 'Time off request created successfully'
    }
  } catch (error) {
    console.error('[Server Action Error - updateStaffSchedule]:', error)

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
      error: error instanceof Error ? error.message : 'Failed to update staff schedule',
      code: 'OPERATION_FAILED'
    }
  }
}