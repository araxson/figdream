'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import {
  addAppointmentService,
  removeAppointmentService,
  addAppointmentNote,
  cancelAppointment
} from '../dal/appointments-mutations'
import type { AppointmentServiceInsert } from '../dal/appointments-types'
import { requireSalonContext, logSecurityEvent } from '@/core/auth/actions/auth-helpers'
import type { ActionResponse } from './crud'

/**
 * Add service to appointment
 */
export async function addAppointmentServiceAction(
  appointmentId: string,
  serviceId: string,
  staffId: string,
  price: number
): Promise<ActionResponse> {
  try {
    const context = await requireSalonContext()

    const serviceData: AppointmentServiceInsert = {
      appointment_id: appointmentId,
      service_id: serviceId,
      staff_id: staffId,
      // Note: price field doesn't exist in AppointmentServiceInsert
      // It should use unit_price and total_price instead
      unit_price: price,
      total_price: price,
      quantity: 1,
      created_at: new Date().toISOString()
    } as AppointmentServiceInsert

    await addAppointmentService(serviceData)

    await logSecurityEvent('appointment.add_service', {
      appointment_id: appointmentId,
      service_id: serviceId,
      staff_id: staffId,
      price,
      salon_id: context.salonId,
      user_id: context.user.id
    })

    revalidatePath(`/appointments/${appointmentId}`)
    revalidateTag(`appointment-${appointmentId}`)

    return {
      success: true,
      message: 'Service added to appointment'
    }

  } catch (error) {
    console.error('[Server Action Error - addAppointmentService]:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add service',
      code: 'OPERATION_FAILED'
    }
  }
}

/**
 * Remove service from appointment
 */
export async function removeAppointmentServiceAction(
  appointmentId: string,
  serviceId: string
): Promise<ActionResponse> {
  try {
    const context = await requireSalonContext()

    await removeAppointmentService(appointmentId, serviceId)

    await logSecurityEvent('appointment.remove_service', {
      appointment_id: appointmentId,
      service_id: serviceId,
      salon_id: context.salonId,
      user_id: context.user.id
    })

    revalidatePath(`/appointments/${appointmentId}`)
    revalidateTag(`appointment-${appointmentId}`)

    return {
      success: true,
      message: 'Service removed from appointment'
    }

  } catch (error) {
    console.error('[Server Action Error - removeAppointmentService]:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to remove service',
      code: 'OPERATION_FAILED'
    }
  }
}

/**
 * Add note to appointment
 */
export async function addAppointmentNoteAction(
  appointmentId: string,
  note: string,
  isPrivate = false
): Promise<ActionResponse> {
  try {
    const context = await requireSalonContext()

    await addAppointmentNote(appointmentId, note, context.user.id, isPrivate)

    await logSecurityEvent('appointment.add_note', {
      appointment_id: appointmentId,
      note_preview: note.substring(0, 50),
      is_private: isPrivate,
      salon_id: context.salonId,
      user_id: context.user.id
    })

    revalidatePath(`/appointments/${appointmentId}`)
    revalidateTag(`appointment-${appointmentId}`)

    return {
      success: true,
      message: 'Note added to appointment'
    }

  } catch (error) {
    console.error('[Server Action Error - addAppointmentNote]:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add note',
      code: 'OPERATION_FAILED'
    }
  }
}

/**
 * Bulk cancel appointments
 */
export async function bulkCancelAppointmentsAction(
  ids: string[],
  reason?: string
): Promise<ActionResponse> {
  try {
    const context = await requireSalonContext()

    if (!ids || ids.length === 0) {
      return {
        success: false,
        error: 'No appointments selected',
        code: 'INVALID_INPUT'
      }
    }

    // Cancel each appointment
    const results = await Promise.allSettled(
      ids.map(id => cancelAppointment(id, reason))
    )

    const succeeded = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length

    await logSecurityEvent('appointment.bulk_cancel', {
      appointment_ids: ids,
      reason,
      succeeded,
      failed,
      salon_id: context.salonId,
      user_id: context.user.id
    }, 'warning')

    revalidatePath('/dashboard/appointments')
    revalidateTag(`appointments-${context.salonId}`)

    if (failed > 0) {
      return {
        success: false,
        error: `${succeeded} cancelled, ${failed} failed`,
        code: 'PARTIAL_SUCCESS'
      }
    }

    return {
      success: true,
      message: `${succeeded} appointments cancelled successfully`
    }

  } catch (error) {
    console.error('[Server Action Error - bulkCancelAppointments]:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cancel appointments',
      code: 'OPERATION_FAILED'
    }
  }
}

