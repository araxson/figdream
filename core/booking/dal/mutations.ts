// Booking system data access layer - Write operations
import { createClient } from '@/lib/supabase/server'
import type {
  BookingWizardState,
  BookingStatus,
  PaymentStatus,
  RecurringSettings,
  GroupBooking,
  WaitingListEntry
} from '../types'

// Create a new booking
export async function createBooking(bookingData: BookingWizardState) {
  const supabase = await createClient()

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  // Get salon ID from user's profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('salon_id')
    .eq('id', user.id)
    .single()

  if (profileError || !profile?.salon_id) {
    throw new Error('Salon context not found')
  }

  const salonId = profile.salon_id

  // Calculate total amount and duration
  const allServices = [...bookingData.selectedServices, ...bookingData.selectedAddons]
  const totalAmount = allServices.reduce((sum, s) => sum + (s.price * s.quantity), 0)
  const totalDuration = allServices.reduce((sum, s) => sum + (s.duration * s.quantity), 0)

  // Create confirmation code
  const confirmationCode = `BK${Date.now().toString(36).toUpperCase()}`

  // Calculate end time
  const startTime = new Date(`${bookingData.selectedDate?.toDateString()} ${bookingData.selectedTime}`)
  const endTime = new Date(startTime.getTime() + totalDuration * 60000)

  try {
    // Start transaction
    // Create main appointment
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .insert({
        salon_id: salonId,
        customer_id: bookingData.customerInfo?.id || user.id,
        staff_id: bookingData.selectedStaff,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        duration_minutes: totalDuration,
        status: 'pending' as BookingStatus,
        confirmation_code: confirmationCode,
        service_count: allServices.length,
        subtotal: totalAmount,
        tax_amount: totalAmount * 0.1, // 10% tax
        discount_amount: 0,
        tip_amount: 0,
        total_amount: totalAmount * 1.1, // Including tax
        payment_status: 'pending' as PaymentStatus,
        payment_method: bookingData.paymentMethod?.type,
        notes: bookingData.specialRequests,
        preferences: {
          customerInfo: bookingData.customerInfo,
          paymentMethod: bookingData.paymentMethod
        },
        booking_source: bookingData.bookingSource,
        reminder_sent: false
      })
      .select()
      .single()

    if (appointmentError) {
      console.error('Error creating appointment:', appointmentError)
      throw new Error('Failed to create appointment')
    }

    // Create appointment services
    const serviceInserts = allServices.map((service, index) => ({
      appointment_id: appointment.id,
      service_id: service.serviceId,
      staff_id: bookingData.selectedStaff,
      service_name: service.serviceName,
      duration_minutes: service.duration,
      unit_price: service.price,
      quantity: service.quantity,
      discount_percentage: 0,
      subtotal: service.price * service.quantity,
      service_order: index + 1,
      start_time: new Date(startTime.getTime() + (index > 0 ? allServices.slice(0, index).reduce((sum, s) => sum + s.duration, 0) * 60000 : 0)).toISOString(),
      end_time: new Date(startTime.getTime() + allServices.slice(0, index + 1).reduce((sum, s) => sum + s.duration, 0) * 60000).toISOString(),
      is_completed: false
    }))

    const { error: servicesError } = await supabase
      .from('appointment_services')
      .insert(serviceInserts)

    if (servicesError) {
      console.error('Error creating appointment services:', servicesError)
      // Rollback appointment
      await supabase.from('appointments').delete().eq('id', appointment.id)
      throw new Error('Failed to create appointment services')
    }

    return appointment

  } catch (error) {
    console.error('Error in createBooking:', error)
    throw error
  }
}

// Update booking status
export async function updateBookingStatus(
  appointmentId: string,
  status: BookingStatus,
  reason?: string
) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  const updateData: any = {
    status,
    updated_at: new Date().toISOString()
  }

  // Add status-specific fields
  switch (status) {
    case 'cancelled':
      updateData.cancelled_at = new Date().toISOString()
      updateData.cancelled_by = user.id
      updateData.cancellation_reason = reason
      break
    case 'no_show':
      updateData.marked_no_show_at = new Date().toISOString()
      updateData.marked_no_show_by = user.id
      break
    case 'checked_in':
      updateData.checked_in_at = new Date().toISOString()
      updateData.checked_in_by = user.id
      break
    case 'completed':
      updateData.completed_at = new Date().toISOString()
      updateData.completed_by = user.id
      break
  }

  const { data: appointment, error } = await supabase
    .from('appointments')
    .update(updateData)
    .eq('id', appointmentId)
    .select()
    .single()

  if (error) {
    console.error('Error updating booking status:', error)
    throw new Error('Failed to update booking status')
  }

  return appointment
}

// Reschedule booking
export async function rescheduleBooking(
  appointmentId: string,
  newDate: Date,
  newTime: string,
  newStaffId?: string
) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  // Get existing appointment
  const { data: existing, error: fetchError } = await supabase
    .from('appointments')
    .select('duration_minutes')
    .eq('id', appointmentId)
    .single()

  if (fetchError || !existing) {
    throw new Error('Appointment not found')
  }

  // Calculate new times
  const startTime = new Date(`${newDate.toDateString()} ${newTime}`)
  const endTime = new Date(startTime.getTime() + existing.duration_minutes * 60000)

  const updateData: any = {
    start_time: startTime.toISOString(),
    end_time: endTime.toISOString(),
    updated_at: new Date().toISOString()
  }

  if (newStaffId) {
    updateData.staff_id = newStaffId
  }

  const { data: appointment, error } = await supabase
    .from('appointments')
    .update(updateData)
    .eq('id', appointmentId)
    .select()
    .single()

  if (error) {
    console.error('Error rescheduling booking:', error)
    throw new Error('Failed to reschedule booking')
  }

  // Update appointment services times if needed
  if (newStaffId) {
    await supabase
      .from('appointment_services')
      .update({ staff_id: newStaffId })
      .eq('appointment_id', appointmentId)
  }

  return appointment
}

// Cancel booking
export async function cancelBooking(appointmentId: string, reason: string) {
  return updateBookingStatus(appointmentId, 'cancelled', reason)
}

// Mark as no-show
export async function markNoShow(appointmentId: string) {
  return updateBookingStatus(appointmentId, 'no_show')
}

// Check in customer
export async function checkInCustomer(appointmentId: string) {
  return updateBookingStatus(appointmentId, 'checked_in')
}

// Complete appointment
export async function completeAppointment(appointmentId: string) {
  return updateBookingStatus(appointmentId, 'completed')
}

// Add to waiting list
export async function addToWaitingList(
  entry: Omit<WaitingListEntry, 'id' | 'createdAt' | 'notified' | 'notifiedAt'>
) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  // Note: Would need waiting_list table in production
  // For now, storing in metadata of a placeholder appointment
  const { data, error } = await supabase
    .from('appointments')
    .insert({
      salon_id: entry.customerId, // Temporary hack
      customer_id: entry.customerId,
      staff_id: entry.preferredStaffId,
      start_time: entry.preferredDate?.toISOString() || new Date().toISOString(),
      end_time: entry.preferredDate?.toISOString() || new Date().toISOString(),
      duration_minutes: 0,
      status: 'pending' as BookingStatus,
      metadata: {
        type: 'waiting_list',
        ...entry
      }
    })
    .select()
    .single()

  if (error) {
    console.error('Error adding to waiting list:', error)
    throw new Error('Failed to add to waiting list')
  }

  return data
}

// Create recurring appointments
export async function createRecurringBookings(
  baseBookingData: BookingWizardState,
  recurringSettings: RecurringSettings
) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  const appointments = []
  const currentDate = new Date(baseBookingData.selectedDate!)
  const endDate = recurringSettings.endDate || new Date(currentDate.getTime() + 365 * 24 * 60 * 60 * 1000) // 1 year max
  const maxOccurrences = recurringSettings.occurrences || 52

  let occurrenceCount = 0

  while (currentDate <= endDate && occurrenceCount < maxOccurrences) {
    // Create appointment for this occurrence
    const bookingData = {
      ...baseBookingData,
      selectedDate: new Date(currentDate)
    }

    try {
      const appointment = await createBooking(bookingData)
      appointments.push(appointment)
      occurrenceCount++
    } catch (error) {
      console.error(`Failed to create recurring appointment ${occurrenceCount + 1}:`, error)
    }

    // Calculate next occurrence
    switch (recurringSettings.frequency) {
      case 'daily':
        currentDate.setDate(currentDate.getDate() + recurringSettings.interval)
        break
      case 'weekly':
        currentDate.setDate(currentDate.getDate() + (7 * recurringSettings.interval))
        break
      case 'biweekly':
        currentDate.setDate(currentDate.getDate() + 14)
        break
      case 'monthly':
        currentDate.setMonth(currentDate.getMonth() + recurringSettings.interval)
        if (recurringSettings.dayOfMonth) {
          currentDate.setDate(recurringSettings.dayOfMonth)
        }
        break
    }
  }

  return appointments
}

// Create group booking
export async function createGroupBooking(groupData: GroupBooking) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  const appointments = []

  // Create appointments for each participant
  for (const participant of groupData.participants) {
    const services = [
      ...(groupData.sharedServices || []),
      ...(groupData.individualServices?.get(participant.email) || [])
    ]

    if (services.length === 0) continue

    // Create booking data for this participant
    const bookingData: BookingWizardState = {
      currentStep: 'confirmation',
      selectedServices: services,
      selectedStaff: groupData.preferSameStaff ? services[0].staffId || null : null,
      selectedDate: new Date(),
      selectedTime: '10:00',
      customerInfo: participant,
      selectedAddons: [],
      paymentMethod: null,
      bookingSource: 'online'
    }

    try {
      const appointment = await createBooking(bookingData)
      appointments.push(appointment)
    } catch (error) {
      console.error(`Failed to create group booking for ${participant.email}:`, error)
    }
  }

  return appointments
}

// Update payment status
export async function updatePaymentStatus(
  appointmentId: string,
  paymentStatus: PaymentStatus,
  paymentMethod?: string,
  transactionId?: string
) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  const updateData: any = {
    payment_status: paymentStatus,
    updated_at: new Date().toISOString()
  }

  if (paymentMethod) {
    updateData.payment_method = paymentMethod
  }

  if (paymentStatus === 'paid') {
    updateData.paid_at = new Date().toISOString()
  }

  if (transactionId) {
    updateData.metadata = {
      transaction_id: transactionId
    }
  }

  const { data: appointment, error } = await supabase
    .from('appointments')
    .update(updateData)
    .eq('id', appointmentId)
    .select()
    .single()

  if (error) {
    console.error('Error updating payment status:', error)
    throw new Error('Failed to update payment status')
  }

  return appointment
}

// Add appointment notes
export async function addAppointmentNotes(
  appointmentId: string,
  notes: string,
  isInternal = false
) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  const field = isInternal ? 'internal_notes' : 'notes'

  const { data: appointment, error } = await supabase
    .from('appointments')
    .update({
      [field]: notes,
      updated_at: new Date().toISOString()
    })
    .eq('id', appointmentId)
    .select()
    .single()

  if (error) {
    console.error('Error adding notes:', error)
    throw new Error('Failed to add notes')
  }

  return appointment
}