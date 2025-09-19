'use server'

import { redirect } from 'next/navigation'
import {
  createAppointmentAction,
  updateAppointmentAction,
  cancelAppointmentAction
} from './crud'
import {
  confirmAppointmentAction,
  checkInAppointmentAction,
  completeAppointmentAction,
  noShowAppointmentAction,
  rescheduleAppointmentAction
} from './status'

/**
 * Form action handler for non-JS environments
 */
export async function handleAppointmentFormAction(formData: FormData) {
  const action = formData.get('_action') as string
  const id = formData.get('id') as string

  try {
    switch (action) {
      case 'create':
        const createResult = await createAppointmentAction(formData)
        if (createResult.success && createResult.data) {
          redirect(`/appointments/${createResult.data.id}`)
        }
        break

      case 'update':
        if (!id) throw new Error('Appointment ID required for update')
        const updateResult = await updateAppointmentAction(id, formData)
        if (updateResult.success) {
          redirect(`/appointments/${id}`)
        }
        break

      case 'cancel':
        if (!id) throw new Error('Appointment ID required for cancel')
        const reason = formData.get('reason') as string
        const cancelResult = await cancelAppointmentAction(id, reason)
        if (cancelResult.success) {
          redirect('/dashboard/appointments')
        }
        break

      case 'reschedule':
        if (!id) throw new Error('Appointment ID required for reschedule')
        const rescheduleResult = await rescheduleAppointmentAction(id, formData)
        if (rescheduleResult.success) {
          redirect(`/appointments/${id}`)
        }
        break

      case 'confirm':
        if (!id) throw new Error('Appointment ID required for confirm')
        const confirmResult = await confirmAppointmentAction(id)
        if (confirmResult.success) {
          redirect(`/appointments/${id}`)
        }
        break

      case 'checkin':
        if (!id) throw new Error('Appointment ID required for check-in')
        const checkinResult = await checkInAppointmentAction(id)
        if (checkinResult.success) {
          redirect(`/appointments/${id}`)
        }
        break

      case 'complete':
        if (!id) throw new Error('Appointment ID required for complete')
        const notes = formData.get('completion_notes') as string
        const completeResult = await completeAppointmentAction(id, notes)
        if (completeResult.success) {
          redirect('/dashboard/appointments')
        }
        break

      case 'noshow':
        if (!id) throw new Error('Appointment ID required for no-show')
        const noshowResult = await noShowAppointmentAction(id)
        if (noshowResult.success) {
          redirect('/dashboard/appointments')
        }
        break

      default:
        throw new Error(`Invalid action: ${action}`)
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Operation failed'
    redirect(`/dashboard/appointments?error=${encodeURIComponent(errorMessage)}`)
  }
}
