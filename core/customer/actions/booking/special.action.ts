'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { BookingWizardState, RecurringSettings, GroupBooking } from '../types'
import {
  createBooking as dalCreateBooking,
  createRecurringBookings as dalCreateRecurring,
  createGroupBooking as dalCreateGroup
} from '../dal'

// Create recurring bookings
export async function createRecurringBookingsAction(
  baseBookingData: BookingWizardState,
  recurringSettings: RecurringSettings
) {
  try {
    const appointments = await dalCreateRecurring(baseBookingData, recurringSettings)

    // Revalidate relevant paths
    revalidatePath('/booking')
    revalidatePath('/dashboard/appointments')

    return { success: true, data: appointments }
  } catch (error) {
    console.error('Error in createRecurringBookingsAction:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create recurring bookings'
    }
  }
}

// Create group booking
export async function createGroupBookingAction(groupData: GroupBooking) {
  try {
    const appointments = await dalCreateGroup(groupData)

    // Revalidate relevant paths
    revalidatePath('/booking')
    revalidatePath('/dashboard/appointments')

    return { success: true, data: appointments }
  } catch (error) {
    console.error('Error in createGroupBookingAction:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create group booking'
    }
  }
}

// Quick booking action (simplified booking flow)
export async function quickBookingAction(formData: FormData) {
  try {
    const serviceId = formData.get('serviceId') as string
    const staffId = formData.get('staffId') as string | null
    const date = formData.get('date') as string
    const time = formData.get('time') as string
    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string

    // Create booking data
    const bookingData: BookingWizardState = {
      currentStep: 'confirmation',
      selectedServices: [{
        serviceId,
        serviceName: 'Service', // Will be fetched from service ID
        categoryId: '',
        categoryName: '',
        duration: 60,
        price: 0,
        quantity: 1
      }],
      selectedStaff: staffId,
      selectedDate: new Date(date),
      selectedTime: time,
      customerInfo: {
        firstName,
        lastName,
        email,
        phone,
        isNewCustomer: false
      },
      selectedAddons: [],
      paymentMethod: null,
      bookingSource: 'online'
    }

    const appointment = await dalCreateBooking(bookingData)

    // Revalidate and redirect
    revalidatePath('/booking')
    redirect(`/booking/confirmation/${appointment.id}`)
  } catch (error) {
    console.error('Error in quickBookingAction:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create quick booking'
    }
  }
}