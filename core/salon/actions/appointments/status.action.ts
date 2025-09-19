'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import {
  confirmAppointment,
  checkInAppointment,
  completeAppointment,
  noShowAppointment,
  rescheduleAppointment
} from '../dal/appointments-mutations'
import { requireSalonContext, getUserContext, logSecurityEvent } from '@/core/auth/actions'
import type { ActionResponse } from './crud'

// Validation schemas
const RescheduleAppointmentSchema = z.object({
  scheduled_at: z.string().datetime('Invalid date/time format'),
  staff_id: z.string().uuid('Invalid staff ID').optional(),
  duration_minutes: z.number().min(5).max(480).optional(),
  reason: z.string().max(200, 'Reason too long').optional()
})

/**
 * Confirm an appointment
 */
export async function confirmAppointmentAction(id: string): Promise<ActionResponse> {
  try {
    const context = await requireSalonContext()

    await confirmAppointment(id)

    await logSecurityEvent('appointment.confirm', {
      appointment_id: id,
      salon_id: context.salonId,
      user_id: context.user.id
    })

    revalidatePath('/dashboard/appointments')
    revalidateTag(`appointment-${id}`)

    return {
      success: true,
      message: 'Appointment confirmed'
    }

  } catch (error) {
    console.error('[Server Action Error - confirmAppointment]:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to confirm appointment',
      code: 'OPERATION_FAILED'
    }
  }
}

/**
 * Check in appointment (customer arrived)
 */
export async function checkInAppointmentAction(id: string): Promise<ActionResponse> {
  try {
    const context = await requireSalonContext()

    await checkInAppointment(id)

    await logSecurityEvent('appointment.check_in', {
      appointment_id: id,
      salon_id: context.salonId,
      user_id: context.user.id
    })

    revalidatePath('/dashboard/appointments')
    revalidatePath('/staff/appointments')
    revalidateTag(`appointment-${id}`)

    return {
      success: true,
      message: 'Customer checked in'
    }

  } catch (error) {
    console.error('[Server Action Error - checkInAppointment]:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check in appointment',
      code: 'OPERATION_FAILED'
    }
  }
}

/**
 * Complete an appointment
 */
export async function completeAppointmentAction(
  id: string,
  completionNotes?: string
): Promise<ActionResponse> {
  try {
    const context = await requireSalonContext()

    await completeAppointment(id, completionNotes)

    await logSecurityEvent('appointment.complete', {
      appointment_id: id,
      salon_id: context.salonId,
      user_id: context.user.id
    })

    revalidatePath('/dashboard/appointments')
    revalidatePath('/staff/appointments')
    revalidateTag(`appointment-${id}`)

    return {
      success: true,
      message: 'Appointment completed'
    }

  } catch (error) {
    console.error('[Server Action Error - completeAppointment]:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to complete appointment',
      code: 'OPERATION_FAILED'
    }
  }
}

/**
 * Mark appointment as no-show
 */
export async function noShowAppointmentAction(id: string): Promise<ActionResponse> {
  try {
    const context = await requireSalonContext()

    await noShowAppointment(id)

    await logSecurityEvent('appointment.no_show', {
      appointment_id: id,
      salon_id: context.salonId,
      user_id: context.user.id
    }, 'warning')

    revalidatePath('/dashboard/appointments')
    revalidateTag(`appointment-${id}`)

    return {
      success: true,
      message: 'Appointment marked as no-show'
    }

  } catch (error) {
    console.error('[Server Action Error - noShowAppointment]:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to mark as no-show',
      code: 'OPERATION_FAILED'
    }
  }
}

/**
 * Reschedule an appointment
 */
export async function rescheduleAppointmentAction(
  id: string,
  data: FormData | { scheduled_at: string; staff_id?: string; duration_minutes?: number; reason?: string }
): Promise<ActionResponse> {
  try {
    const context = await getUserContext()
    if ('success' in context && !context.success) {
      return context
    }
    // Type guard to ensure we have a valid UserContext
    if (!('user' in context)) {
      return {
        success: false,
        error: 'Invalid authentication context',
        code: 'AUTH_ERROR'
      }
    }

    const rawData = data instanceof FormData ? {
      scheduled_at: data.get('scheduled_at') as string,
      staff_id: data.get('staff_id') as string || undefined,
      duration_minutes: data.has('duration_minutes') ? parseInt(data.get('duration_minutes') as string) : undefined,
      reason: data.get('reason') as string || undefined
    } : data

    const validatedData = RescheduleAppointmentSchema.parse(rawData)

    await rescheduleAppointment(id, validatedData)

    await logSecurityEvent('appointment.reschedule', {
      appointment_id: id,
      new_time: validatedData.scheduled_at,
      new_staff: validatedData.staff_id,
      reason: validatedData.reason,
      user_id: context.user.id
    })

    revalidatePath('/dashboard/appointments')
    revalidatePath('/customer/appointments')
    revalidateTag(`appointment-${id}`)

    return {
      success: true,
      message: 'Appointment rescheduled successfully'
    }

  } catch (error) {
    console.error('[Server Action Error - rescheduleAppointment]:', error)

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
      error: error instanceof Error ? error.message : 'Failed to reschedule appointment',
      code: 'OPERATION_FAILED'
    }
  }
}
