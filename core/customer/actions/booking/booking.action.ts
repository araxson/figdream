'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { BookingWizardState, BookingStatus } from '../types'
import {
  createBooking as dalCreateBooking,
  updateBookingStatus as dalUpdateStatus,
  rescheduleBooking as dalReschedule,
  cancelBooking as dalCancel,
  checkInCustomer as dalCheckIn,
  completeAppointment as dalComplete,
  markNoShow as dalMarkNoShow,
  addAppointmentNotes as dalAddNotes,
  updatePaymentStatus as dalUpdatePayment,
  addToWaitingList as dalAddToWaitingList
} from '../dal'

// Create a new booking
export async function createBookingAction(bookingData: BookingWizardState) {
  try {
    const appointment = await dalCreateBooking(bookingData)

    // Revalidate relevant paths
    revalidatePath('/booking')
    revalidatePath('/dashboard/appointments')
    revalidatePath(`/booking/confirmation/${appointment.id}`)

    return { success: true, data: appointment }
  } catch (error) {
    console.error('Error in createBookingAction:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create booking'
    }
  }
}

// Update booking status
export async function updateBookingStatusAction(
  appointmentId: string,
  status: BookingStatus,
  reason?: string
) {
  try {
    const updated = await dalUpdateStatus(appointmentId, status, reason)

    // Revalidate relevant paths
    revalidatePath('/booking')
    revalidatePath('/dashboard/appointments')
    revalidatePath(`/booking/${appointmentId}`)

    return { success: true, data: updated }
  } catch (error) {
    console.error('Error in updateBookingStatusAction:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update booking status'
    }
  }
}

// Reschedule booking
export async function rescheduleBookingAction(
  appointmentId: string,
  newDate: Date,
  newTime: string,
  newStaffId?: string
) {
  try {
    const updated = await dalReschedule(appointmentId, newDate, newTime, newStaffId)

    // Revalidate relevant paths
    revalidatePath('/booking')
    revalidatePath('/dashboard/appointments')
    revalidatePath(`/booking/${appointmentId}`)

    return { success: true, data: updated }
  } catch (error) {
    console.error('Error in rescheduleBookingAction:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to reschedule booking'
    }
  }
}

// Cancel booking
export async function cancelBookingAction(appointmentId: string, reason: string) {
  try {
    const updated = await dalCancel(appointmentId, reason)

    // Revalidate relevant paths
    revalidatePath('/booking')
    revalidatePath('/dashboard/appointments')
    revalidatePath(`/booking/${appointmentId}`)

    return { success: true, data: updated }
  } catch (error) {
    console.error('Error in cancelBookingAction:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cancel booking'
    }
  }
}

// Check in customer
export async function checkInCustomerAction(appointmentId: string) {
  try {
    const updated = await dalCheckIn(appointmentId)

    // Revalidate relevant paths
    revalidatePath('/booking')
    revalidatePath('/dashboard/appointments')
    revalidatePath(`/booking/${appointmentId}`)

    return { success: true, data: updated }
  } catch (error) {
    console.error('Error in checkInCustomerAction:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check in customer'
    }
  }
}

// Complete appointment
export async function completeAppointmentAction(appointmentId: string) {
  try {
    const updated = await dalComplete(appointmentId)

    // Revalidate relevant paths
    revalidatePath('/booking')
    revalidatePath('/dashboard/appointments')
    revalidatePath(`/booking/${appointmentId}`)

    return { success: true, data: updated }
  } catch (error) {
    console.error('Error in completeAppointmentAction:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to complete appointment'
    }
  }
}

// Mark as no-show
export async function markNoShowAction(appointmentId: string) {
  try {
    const updated = await dalMarkNoShow(appointmentId)

    // Revalidate relevant paths
    revalidatePath('/booking')
    revalidatePath('/dashboard/appointments')
    revalidatePath(`/booking/${appointmentId}`)

    return { success: true, data: updated }
  } catch (error) {
    console.error('Error in markNoShowAction:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to mark as no-show'
    }
  }
}

// Add appointment notes
export async function addAppointmentNotesAction(
  appointmentId: string,
  notes: string,
  isInternal = false
) {
  try {
    const updated = await dalAddNotes(appointmentId, notes, isInternal)

    // Revalidate relevant paths
    revalidatePath(`/booking/${appointmentId}`)
    revalidatePath('/dashboard/appointments')

    return { success: true, data: updated }
  } catch (error) {
    console.error('Error in addAppointmentNotesAction:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add notes'
    }
  }
}

// Update payment status
export async function updatePaymentStatusAction(
  appointmentId: string,
  paymentStatus: 'paid' | 'partially_paid' | 'failed' | 'refunded',
  paymentMethod?: string,
  transactionId?: string
) {
  try {
    const updated = await dalUpdatePayment(appointmentId, paymentStatus, paymentMethod, transactionId)

    // Revalidate relevant paths
    revalidatePath(`/booking/${appointmentId}`)
    revalidatePath('/dashboard/appointments')
    revalidatePath('/dashboard/billing')

    return { success: true, data: updated }
  } catch (error) {
    console.error('Error in updatePaymentStatusAction:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update payment status'
    }
  }
}

// Add to waiting list
export async function addToWaitingListAction(
  entry: Parameters<typeof dalAddToWaitingList>[0]
) {
  try {
    const result = await dalAddToWaitingList(entry)

    // Revalidate relevant paths
    revalidatePath('/booking')
    revalidatePath('/dashboard/appointments')
    revalidatePath('/booking/waiting-list')

    return { success: true, data: result }
  } catch (error) {
    console.error('Error in addToWaitingListAction:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add to waiting list'
    }
  }
}