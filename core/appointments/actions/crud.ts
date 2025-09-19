'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createAppointment, updateAppointment, cancelAppointment } from '../dal/appointments-mutations'
import type { AppointmentInsert, AppointmentUpdate } from '../dal/appointments-types'
import { getUserContext, requireSalonContext, logSecurityEvent } from '@/core/auth/actions/auth-helpers'

// Response types
export interface ActionResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  fieldErrors?: Record<string, string[] | undefined>
  code?: string
  message?: string
}

// Validation schemas
const CreateAppointmentSchema = z.object({
  salon_id: z.string().uuid('Invalid salon ID'),
  staff_id: z.string().uuid('Invalid staff ID'),
  customer_id: z.string().uuid('Invalid customer ID'),
  service_id: z.string().uuid('Invalid service ID').optional(),
  scheduled_at: z.string().datetime('Invalid date/time format'),
  duration_minutes: z.number().min(5, 'Duration must be at least 5 minutes').max(480),
  price: z.number().min(0, 'Price cannot be negative'),
  notes: z.string().max(500, 'Notes too long').optional(),
  is_walk_in: z.boolean().default(false),
  requires_confirmation: z.boolean().default(true),
  send_reminders: z.boolean().default(true),
  deposit_required: z.boolean().default(false),
  deposit_amount: z.number().min(0).optional()
})

const UpdateAppointmentSchema = CreateAppointmentSchema.partial().extend({
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled', 'no_show', 'rescheduled']).optional()
})

/**
 * Create a new appointment
 */
export async function createAppointmentAction(
  data: FormData | AppointmentInsert
): Promise<ActionResponse<{ id: string; confirmation_code: string }>> {
  try {
    // 1. Authentication - customer or staff can create appointments
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

    // 2. Parse and validate input
    const rawData = data instanceof FormData ? {
      salon_id: data.get('salon_id'),
      staff_id: data.get('staff_id'),
      customer_id: data.get('customer_id') || context.user.id, // Default to current user
      service_id: data.get('service_id') || undefined,
      scheduled_at: data.get('scheduled_at'),
      duration_minutes: parseInt(data.get('duration_minutes') as string || '30'),
      price: parseFloat(data.get('price') as string || '0'),
      notes: data.get('notes') || undefined,
      is_walk_in: data.get('is_walk_in') === 'true',
      requires_confirmation: data.get('requires_confirmation') !== 'false', // Default true
      send_reminders: data.get('send_reminders') !== 'false', // Default true
      deposit_required: data.get('deposit_required') === 'true',
      deposit_amount: data.get('deposit_amount') ? parseFloat(data.get('deposit_amount') as string) : undefined
    } : data

    const validatedData = CreateAppointmentSchema.parse(rawData)

    // 3. Create appointment with proper status
    const appointmentData: AppointmentInsert = {
      ...validatedData,
      status: validatedData.requires_confirmation ? 'pending' : 'confirmed',
      payment_status: 'pending'
      // Note: created_by field doesn't exist in AppointmentInsert type
    } as AppointmentInsert

    const appointment = await createAppointment(appointmentData)

    // 4. Log the action
    await logSecurityEvent('appointment.create', {
      appointment_id: appointment.id,
      salon_id: validatedData.salon_id,
      staff_id: validatedData.staff_id,
      customer_id: validatedData.customer_id,
      scheduled_at: validatedData.scheduled_at,
      user_id: context.user.id
    })

    // 5. Revalidate caches
    revalidatePath('/dashboard/appointments')
    revalidatePath('/customer/appointments')
    revalidatePath('/staff/appointments')
    revalidateTag(`appointments-${validatedData.salon_id}`)
    revalidateTag(`staff-appointments-${validatedData.staff_id}`)
    revalidateTag(`customer-appointments-${validatedData.customer_id}`)

    return {
      success: true,
      data: {
        id: appointment.id || '',
        confirmation_code: appointment.confirmation_code || ''
      },
      message: 'Appointment booked successfully'
    }

  } catch (error) {
    console.error('[Server Action Error - createAppointment]:', error)

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation failed. Please check your input.',
        fieldErrors: error.flatten().fieldErrors,
        code: 'VALIDATION_ERROR'
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create appointment',
      code: 'OPERATION_FAILED'
    }
  }
}

/**
 * Update an appointment
 */
export async function updateAppointmentAction(
  id: string,
  data: FormData | AppointmentUpdate
): Promise<ActionResponse> {
  try {
    const context = await requireSalonContext()

    const rawData = data instanceof FormData ? {
      staff_id: data.has('staff_id') ? data.get('staff_id') : undefined,
      scheduled_at: data.has('scheduled_at') ? data.get('scheduled_at') : undefined,
      duration_minutes: data.has('duration_minutes') ? parseInt(data.get('duration_minutes') as string) : undefined,
      price: data.has('price') ? parseFloat(data.get('price') as string) : undefined,
      notes: data.has('notes') ? data.get('notes') : undefined,
      status: data.has('status') ? data.get('status') : undefined
    } : data

    // Remove undefined values
    const cleanData = Object.fromEntries(
      Object.entries(rawData).filter(([_, v]) => v !== undefined)
    )

    const validatedData = UpdateAppointmentSchema.parse(cleanData)

    await updateAppointment(id, validatedData)

    await logSecurityEvent('appointment.update', {
      appointment_id: id,
      salon_id: context.salonId,
      changes: validatedData,
      user_id: context.user.id
    })

    revalidatePath('/dashboard/appointments')
    revalidatePath(`/appointments/${id}`)
    revalidateTag(`appointment-${id}`)

    return {
      success: true,
      message: 'Appointment updated successfully'
    }

  } catch (error) {
    console.error('[Server Action Error - updateAppointment]:', error)

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
      error: error instanceof Error ? error.message : 'Failed to update appointment',
      code: 'OPERATION_FAILED'
    }
  }
}

/**
 * Cancel an appointment
 */
export async function cancelAppointmentAction(
  id: string,
  reason?: string
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

    const appointment = await cancelAppointment(id, reason)

    await logSecurityEvent('appointment.cancel', {
      appointment_id: id,
      reason,
      user_id: context.user.id
    }, 'warning')

    // Revalidate all relevant paths
    revalidatePath('/dashboard/appointments')
    revalidatePath('/customer/appointments')
    revalidatePath('/staff/appointments')
    revalidateTag(`appointment-${id}`)

    return {
      success: true,
      message: 'Appointment cancelled successfully'
    }

  } catch (error) {
    console.error('[Server Action Error - cancelAppointment]:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cancel appointment',
      code: 'OPERATION_FAILED'
    }
  }
}
