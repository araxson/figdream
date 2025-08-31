'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import type { Database } from '@/types/database'
import { 
  createBooking, 
  updateBookingStatus, 
  updateBooking,
  cancelBooking,
  getBookingById,
  getAvailableTimeSlots,
  isTimeSlotAvailable,
  getAvailableStaff,
  getBookingConflicts
} from '@/lib/data-access/bookings'
import { getLocationServices } from '@/lib/data-access/services'
import { getUserWithRole } from '@/lib/data-access/auth/verify'

type BookingStatus = Database['public']['Enums']['booking_status']

// Validation schemas
const createBookingSchema = z.object({
  location_id: z.string().min(1, 'Location is required'),
  staff_id: z.string().optional(),
  booking_date: z.string().min(1, 'Date is required'),
  start_time: z.string().min(1, 'Start time is required'),
  end_time: z.string().min(1, 'End time is required'),
  services: z.array(z.string()).min(1, 'At least one service must be selected'),
  total_price: z.number().min(0, 'Total price must be non-negative'),
  deposit_amount: z.number().optional(),
  notes: z.string().max(500).optional(),
  special_requests: z.string().max(500).optional(),
  customer: z.object({
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email'),
    phone: z.string().min(10, 'Phone must be at least 10 digits'),
  }).optional(),
  is_walk_in: z.boolean().default(false),
  send_reminders: z.boolean().default(true),
  marketing_consent: z.boolean().default(false),
})

const updateBookingSchema = z.object({
  booking_id: z.string().min(1, 'Booking ID is required'),
  booking_date: z.string().optional(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  staff_id: z.string().optional(),
  notes: z.string().max(500).optional(),
  special_requests: z.string().max(500).optional(),
})

const cancelBookingSchema = z.object({
  booking_id: z.string().min(1, 'Booking ID is required'),
  reason: z.string().max(500).optional(),
})

const rescheduleBookingSchema = z.object({
  booking_id: z.string().min(1, 'Booking ID is required'),
  new_date: z.string().min(1, 'New date is required'),
  new_start_time: z.string().min(1, 'New start time is required'),
  new_end_time: z.string().min(1, 'New end time is required'),
  new_staff_id: z.string().optional(),
})

const checkAvailabilitySchema = z.object({
  location_id: z.string().min(1, 'Location is required'),
  staff_id: z.string().optional(),
  service_ids: z.array(z.string()).min(1, 'Services are required'),
  date: z.string().min(1, 'Date is required'),
  start_time: z.string().optional(),
})

// Server Actions

/**
 * Create a new booking
 */
export async function createBookingAction(formData: FormData | any) {
  try {
    // Parse and validate data
    const data = typeof formData === 'object' && !(formData instanceof FormData) 
      ? formData 
      : Object.fromEntries(formData.entries())

    // Parse nested objects from FormData if needed
    if (formData instanceof FormData) {
      if (formData.get('customer_first_name')) {
        data.customer = {
          first_name: formData.get('customer_first_name') as string,
          last_name: formData.get('customer_last_name') as string,
          email: formData.get('customer_email') as string,
          phone: formData.get('customer_phone') as string,
        }
      }
      
      data.services = formData.getAll('services') as string[]
      data.total_price = parseFloat(formData.get('total_price') as string || '0')
      data.deposit_amount = formData.get('deposit_amount') ? parseFloat(formData.get('deposit_amount') as string) : undefined
      data.is_walk_in = formData.get('is_walk_in') === 'true'
      data.send_reminders = formData.get('send_reminders') !== 'false'
      data.marketing_consent = formData.get('marketing_consent') === 'true'
    }

    const validatedData = createBookingSchema.parse(data)
    
    // Get current user
    const { user, error: authError } = await getUserWithRole()
    if (authError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    // Check if time slot is still available
    if (validatedData.staff_id) {
      const { available, error: availabilityError } = await isTimeSlotAvailable(
        validatedData.staff_id,
        validatedData.booking_date,
        validatedData.start_time,
        validatedData.end_time
      )

      if (availabilityError) {
        return { success: false, error: availabilityError }
      }

      if (!available) {
        return { success: false, error: 'Selected time slot is no longer available' }
      }
    }

    // Validate services are available at location
    const { data: locationServices, error: servicesError } = await getLocationServices(validatedData.location_id)
    if (servicesError || !locationServices) {
      return { success: false, error: 'Failed to validate services' }
    }

    const validServiceIds = locationServices.map(s => s.id)
    const invalidServices = validatedData.services.filter(id => !validServiceIds.includes(id))
    if (invalidServices.length > 0) {
      return { success: false, error: 'One or more selected services are not available at this location' }
    }

    // Prepare booking data
    const bookingData = {
      location_id: validatedData.location_id,
      staff_id: validatedData.staff_id,
      booking_date: validatedData.booking_date,
      start_time: validatedData.start_time,
      end_time: validatedData.end_time,
      total_price: validatedData.total_price,
      deposit_amount: validatedData.deposit_amount || null,
      notes: validatedData.notes || null,
      status: 'pending' as BookingStatus,
    }

    // Create the booking
    const { data: booking, error: createError } = await createBooking(bookingData, validatedData.services)
    
    if (createError || !booking) {
      return { success: false, error: createError || 'Failed to create booking' }
    }

    // TODO: Send notification emails/SMS
    // TODO: Process payment if required
    // TODO: Create calendar events

    // Revalidate relevant paths
    revalidatePath('/customer/appointments')
    revalidatePath('/location/appointments')
    revalidatePath('/staff/appointments')

    return { 
      success: true, 
      booking: booking,
      message: 'Booking created successfully' 
    }
  } catch (error) {
    console.error('Create booking action error:', error)
    
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: 'Invalid booking data',
        fieldErrors: error.flatten().fieldErrors
      }
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create booking' 
    }
  }
}

/**
 * Update an existing booking
 */
export async function updateBookingAction(formData: FormData | any) {
  try {
    const data = typeof formData === 'object' && !(formData instanceof FormData) 
      ? formData 
      : Object.fromEntries(formData.entries())

    const validatedData = updateBookingSchema.parse(data)

    // Check if the booking exists and user has permission
    const { data: existingBooking, error: fetchError } = await getBookingById(validatedData.booking_id)
    if (fetchError || !existingBooking) {
      return { success: false, error: 'Booking not found' }
    }

    // Check for conflicts if date/time is being changed
    if (validatedData.booking_date || validatedData.start_time || validatedData.end_time) {
      const newDate = validatedData.booking_date || existingBooking.booking_date
      const newStartTime = validatedData.start_time || existingBooking.start_time
      const newEndTime = validatedData.end_time || existingBooking.end_time
      const staffId = validatedData.staff_id || existingBooking.staff_id

      if (staffId) {
        const { data: conflicts, error: conflictError } = await getBookingConflicts(
          staffId,
          newDate,
          newStartTime,
          newEndTime,
          validatedData.booking_id
        )

        if (conflictError) {
          return { success: false, error: 'Failed to check for conflicts' }
        }

        if (conflicts && conflicts.length > 0) {
          return { success: false, error: 'New time slot conflicts with existing bookings' }
        }
      }
    }

    // Update the booking
    const updateData = {
      booking_date: validatedData.booking_date,
      start_time: validatedData.start_time,
      end_time: validatedData.end_time,
      staff_id: validatedData.staff_id,
      notes: validatedData.notes,
    }

    const { data: updatedBooking, error: updateError } = await updateBooking(
      validatedData.booking_id, 
      updateData
    )

    if (updateError || !updatedBooking) {
      return { success: false, error: updateError || 'Failed to update booking' }
    }

    // Revalidate paths
    revalidatePath('/customer/appointments')
    revalidatePath('/location/appointments')
    revalidatePath('/staff/appointments')

    return { 
      success: true, 
      booking: updatedBooking,
      message: 'Booking updated successfully' 
    }
  } catch (error) {
    console.error('Update booking action error:', error)
    
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: 'Invalid booking data',
        fieldErrors: error.flatten().fieldErrors
      }
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update booking' 
    }
  }
}

/**
 * Cancel a booking
 */
export async function cancelBookingAction(formData: FormData | any) {
  try {
    const data = typeof formData === 'object' && !(formData instanceof FormData) 
      ? formData 
      : Object.fromEntries(formData.entries())

    const validatedData = cancelBookingSchema.parse(data)

    // Cancel the booking
    const { data: cancelledBooking, error: cancelError } = await cancelBooking(
      validatedData.booking_id,
      validatedData.reason
    )

    if (cancelError || !cancelledBooking) {
      return { success: false, error: cancelError || 'Failed to cancel booking' }
    }

    // TODO: Send cancellation notifications
    // TODO: Process refunds if applicable
    // TODO: Update calendar events

    // Revalidate paths
    revalidatePath('/customer/appointments')
    revalidatePath('/location/appointments')
    revalidatePath('/staff/appointments')

    return { 
      success: true, 
      booking: cancelledBooking,
      message: 'Booking cancelled successfully' 
    }
  } catch (error) {
    console.error('Cancel booking action error:', error)
    
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: 'Invalid cancellation data',
        fieldErrors: error.flatten().fieldErrors
      }
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to cancel booking' 
    }
  }
}

/**
 * Reschedule a booking
 */
export async function rescheduleBookingAction(formData: FormData | any) {
  try {
    const data = typeof formData === 'object' && !(formData instanceof FormData) 
      ? formData 
      : Object.fromEntries(formData.entries())

    const validatedData = rescheduleBookingSchema.parse(data)

    // Check if the booking exists
    const { data: existingBooking, error: fetchError } = await getBookingById(validatedData.booking_id)
    if (fetchError || !existingBooking) {
      return { success: false, error: 'Booking not found' }
    }

    // Check if new time slot is available
    const staffId = validatedData.new_staff_id || existingBooking.staff_id
    if (staffId) {
      const { available, error: availabilityError } = await isTimeSlotAvailable(
        staffId,
        validatedData.new_date,
        validatedData.new_start_time,
        validatedData.new_end_time
      )

      if (availabilityError) {
        return { success: false, error: availabilityError }
      }

      if (!available) {
        return { success: false, error: 'Selected time slot is not available' }
      }
    }

    // Update the booking with new date/time
    const updateData = {
      booking_date: validatedData.new_date,
      start_time: validatedData.new_start_time,
      end_time: validatedData.new_end_time,
      staff_id: validatedData.new_staff_id,
    }

    const { data: rescheduledBooking, error: updateError } = await updateBooking(
      validatedData.booking_id, 
      updateData
    )

    if (updateError || !rescheduledBooking) {
      return { success: false, error: updateError || 'Failed to reschedule booking' }
    }

    // TODO: Send rescheduling notifications
    // TODO: Update calendar events

    // Revalidate paths
    revalidatePath('/customer/appointments')
    revalidatePath('/location/appointments')
    revalidatePath('/staff/appointments')

    return { 
      success: true, 
      booking: rescheduledBooking,
      message: 'Booking rescheduled successfully' 
    }
  } catch (error) {
    console.error('Reschedule booking action error:', error)
    
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: 'Invalid rescheduling data',
        fieldErrors: error.flatten().fieldErrors
      }
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to reschedule booking' 
    }
  }
}

/**
 * Update booking status (for staff/admin use)
 */
export async function updateBookingStatusAction(formData: FormData) {
  try {
    const bookingId = formData.get('booking_id') as string
    const status = formData.get('status') as BookingStatus
    const reason = formData.get('reason') as string | null

    if (!bookingId || !status) {
      return { success: false, error: 'Booking ID and status are required' }
    }

    const { data: updatedBooking, error: updateError } = await updateBookingStatus(
      bookingId,
      status,
      reason || undefined
    )

    if (updateError || !updatedBooking) {
      return { success: false, error: updateError || 'Failed to update booking status' }
    }

    // TODO: Send status change notifications

    // Revalidate paths
    revalidatePath('/customer/appointments')
    revalidatePath('/location/appointments')
    revalidatePath('/staff/appointments')

    return { 
      success: true, 
      booking: updatedBooking,
      message: `Booking ${status} successfully` 
    }
  } catch (error) {
    console.error('Update booking status action error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update booking status' 
    }
  }
}

/**
 * Check availability for services at a location
 */
export async function checkAvailabilityAction(formData: FormData | any) {
  try {
    const data = typeof formData === 'object' && !(formData instanceof FormData) 
      ? formData 
      : {
          location_id: formData.get('location_id') as string,
          staff_id: formData.get('staff_id') as string || undefined,
          service_ids: formData.getAll('service_ids') as string[],
          date: formData.get('date') as string,
          start_time: formData.get('start_time') as string || undefined,
        }

    const validatedData = checkAvailabilitySchema.parse(data)

    // Calculate total service duration
    const { data: locationServices, error: servicesError } = await getLocationServices(validatedData.location_id)
    if (servicesError || !locationServices) {
      return { success: false, error: 'Failed to load services' }
    }

    const selectedServices = locationServices.filter(s => validatedData.service_ids.includes(s.id))
    const totalDuration = selectedServices.reduce((sum, service) => 
      sum + (service.custom_duration || service.duration_minutes), 0
    )

    if (validatedData.staff_id) {
      // Check specific staff member availability
      const { data: timeSlots, error: slotsError } = await getAvailableTimeSlots(
        validatedData.staff_id,
        validatedData.date,
        totalDuration
      )

      if (slotsError) {
        return { success: false, error: slotsError }
      }

      return {
        success: true,
        data: {
          available_slots: timeSlots || [],
          staff_available: (timeSlots || []).length > 0,
          total_duration: totalDuration
        }
      }
    } else {
      // Check availability across all staff
      const { data: availableStaff, error: staffError } = await getAvailableStaff(
        validatedData.location_id,
        validatedData.service_ids[0], // Use first service for staff filtering
        validatedData.date,
        validatedData.start_time
      )

      if (staffError) {
        return { success: false, error: staffError }
      }

      return {
        success: true,
        data: {
          available_staff: availableStaff || [],
          staff_count: (availableStaff || []).length,
          total_duration: totalDuration
        }
      }
    }
  } catch (error) {
    console.error('Check availability action error:', error)
    
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: 'Invalid availability check data',
        fieldErrors: error.flatten().fieldErrors
      }
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to check availability' 
    }
  }
}

/**
 * Get booking details (for viewing/editing)
 */
export async function getBookingDetailsAction(bookingId: string) {
  try {
    if (!bookingId) {
      return { success: false, error: 'Booking ID is required' }
    }

    const { data: booking, error } = await getBookingById(bookingId)
    
    if (error || !booking) {
      return { success: false, error: error || 'Booking not found' }
    }

    return { 
      success: true, 
      data: booking 
    }
  } catch (error) {
    console.error('Get booking details action error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to get booking details' 
    }
  }
}

/**
 * Mark booking as completed
 */
export async function completeBookingAction(formData: FormData) {
  try {
    const bookingId = formData.get('booking_id') as string
    const notes = formData.get('completion_notes') as string | null

    if (!bookingId) {
      return { success: false, error: 'Booking ID is required' }
    }

    const { data: completedBooking, error: updateError } = await updateBookingStatus(
      bookingId,
      'completed',
      notes || undefined
    )

    if (updateError || !completedBooking) {
      return { success: false, error: updateError || 'Failed to complete booking' }
    }

    // TODO: Send completion notifications
    // TODO: Request review/feedback
    // TODO: Process final payment

    // Revalidate paths
    revalidatePath('/customer/appointments')
    revalidatePath('/location/appointments') 
    revalidatePath('/staff/appointments')

    return { 
      success: true, 
      booking: completedBooking,
      message: 'Booking completed successfully' 
    }
  } catch (error) {
    console.error('Complete booking action error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to complete booking' 
    }
  }
}

/**
 * Mark booking as no-show
 */
export async function markNoShowAction(formData: FormData) {
  try {
    const bookingId = formData.get('booking_id') as string
    const reason = formData.get('reason') as string | null

    if (!bookingId) {
      return { success: false, error: 'Booking ID is required' }
    }

    const { data: updatedBooking, error: updateError } = await updateBookingStatus(
      bookingId,
      'no_show',
      reason || 'Customer did not show up'
    )

    if (updateError || !updatedBooking) {
      return { success: false, error: updateError || 'Failed to mark as no-show' }
    }

    // TODO: Send no-show notifications
    // TODO: Process no-show fees if applicable

    // Revalidate paths
    revalidatePath('/customer/appointments')
    revalidatePath('/location/appointments')
    revalidatePath('/staff/appointments')

    return { 
      success: true, 
      booking: updatedBooking,
      message: 'Booking marked as no-show' 
    }
  } catch (error) {
    console.error('Mark no-show action error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to mark as no-show' 
    }
  }
}