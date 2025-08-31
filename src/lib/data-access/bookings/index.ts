'use server'

import { createClient } from '@/lib/database/supabase/server'
import { Database } from '@/types/database.types'

// Type definitions for booking operations
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show'
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed'

export interface CreateBookingInput {
  customer_id: string
  location_id: string
  staff_id: string
  service_id: string
  booking_date: string
  start_time: string
  end_time: string
  price: number
  deposit_amount?: number
  notes?: string
  add_ons?: string[]
}

export interface UpdateBookingInput {
  status?: BookingStatus
  staff_id?: string
  start_time?: string
  end_time?: string
  notes?: string
  payment_status?: PaymentStatus
}

export interface BookingFilters {
  location_id?: string
  staff_id?: string
  customer_id?: string
  service_id?: string
  status?: BookingStatus
  date_from?: string
  date_to?: string
  limit?: number
  offset?: number
}

/**
 * Create a new booking
 */
export async function createBooking(input: CreateBookingInput) {
  const supabase = await createClient()
  
  // Check for conflicts
  const conflicts = await checkBookingConflicts({
    staff_id: input.staff_id,
    booking_date: input.booking_date,
    start_time: input.start_time,
    end_time: input.end_time
  })
  
  if (conflicts.length > 0) {
    return { 
      error: 'Booking conflict detected', 
      conflicts 
    }
  }
  
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      ...input,
      status: 'pending',
      payment_status: 'pending',
      created_at: new Date().toISOString()
    })
    .select()
    .single()
  
  if (error) {
    return { error: error.message }
  }
  
  // Create booking status history entry
  await createBookingStatusHistory(data.id, 'pending', 'Booking created')
  
  // Send confirmation email/SMS
  await sendBookingConfirmation(data.id)
  
  return { data }
}

/**
 * Get booking by ID
 */
export async function getBookingById(bookingId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      customer:customers(*),
      location:locations(*),
      staff:staff(*),
      service:services(*),
      booking_services(*)
    `)
    .eq('id', bookingId)
    .single()
  
  if (error) {
    return { error: error.message }
  }
  
  return { data }
}

/**
 * Get bookings with filters
 */
export async function getBookings(filters: BookingFilters = {}) {
  const supabase = await createClient()
  
  let query = supabase
    .from('bookings')
    .select(`
      *,
      customer:customers(id, first_name, last_name, email, phone),
      location:locations(id, name),
      staff:staff(id, first_name, last_name),
      service:services(id, name, duration, price)
    `)
  
  // Apply filters
  if (filters.location_id) {
    query = query.eq('location_id', filters.location_id)
  }
  if (filters.staff_id) {
    query = query.eq('staff_id', filters.staff_id)
  }
  if (filters.customer_id) {
    query = query.eq('customer_id', filters.customer_id)
  }
  if (filters.service_id) {
    query = query.eq('service_id', filters.service_id)
  }
  if (filters.status) {
    query = query.eq('status', filters.status)
  }
  if (filters.date_from) {
    query = query.gte('booking_date', filters.date_from)
  }
  if (filters.date_to) {
    query = query.lte('booking_date', filters.date_to)
  }
  
  // Apply pagination
  if (filters.limit) {
    query = query.limit(filters.limit)
  }
  if (filters.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
  }
  
  // Order by booking date and time
  query = query.order('booking_date', { ascending: false })
    .order('start_time', { ascending: false })
  
  const { data, error } = await query
  
  if (error) {
    return { error: error.message }
  }
  
  return { data }
}

/**
 * Update booking
 */
export async function updateBooking(bookingId: string, input: UpdateBookingInput) {
  const supabase = await createClient()
  
  // Get current booking
  const { data: currentBooking } = await getBookingById(bookingId)
  if (!currentBooking) {
    return { error: 'Booking not found' }
  }
  
  // Check for conflicts if time/staff is being changed
  if (input.staff_id || input.start_time || input.end_time) {
    const conflicts = await checkBookingConflicts({
      staff_id: input.staff_id || currentBooking.staff_id,
      booking_date: currentBooking.booking_date,
      start_time: input.start_time || currentBooking.start_time,
      end_time: input.end_time || currentBooking.end_time,
      exclude_booking_id: bookingId
    })
    
    if (conflicts.length > 0) {
      return { 
        error: 'Booking conflict detected', 
        conflicts 
      }
    }
  }
  
  const { data, error } = await supabase
    .from('bookings')
    .update({
      ...input,
      updated_at: new Date().toISOString()
    })
    .eq('id', bookingId)
    .select()
    .single()
  
  if (error) {
    return { error: error.message }
  }
  
  // Log status change if applicable
  if (input.status && input.status !== currentBooking.status) {
    await createBookingStatusHistory(bookingId, input.status, 'Status updated')
    
    // Send notification based on status
    if (input.status === 'confirmed') {
      await sendBookingConfirmation(bookingId)
    } else if (input.status === 'cancelled') {
      await sendBookingCancellation(bookingId)
    }
  }
  
  return { data }
}

/**
 * Cancel booking
 */
export async function cancelBooking(bookingId: string, reason?: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('bookings')
    .update({
      status: 'cancelled',
      cancellation_reason: reason,
      cancelled_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', bookingId)
    .select()
    .single()
  
  if (error) {
    return { error: error.message }
  }
  
  // Create status history
  await createBookingStatusHistory(bookingId, 'cancelled', reason || 'Booking cancelled')
  
  // Send cancellation notification
  await sendBookingCancellation(bookingId)
  
  // Process refund if applicable
  if (data.deposit_amount && data.deposit_amount > 0) {
    await processBookingRefund(bookingId, data.deposit_amount)
  }
  
  return { data }
}

/**
 * Check for booking conflicts
 */
export async function checkBookingConflicts(params: {
  staff_id: string
  booking_date: string
  start_time: string
  end_time: string
  exclude_booking_id?: string
}) {
  const supabase = await createClient()
  
  let query = supabase
    .from('bookings')
    .select('*')
    .eq('staff_id', params.staff_id)
    .eq('booking_date', params.booking_date)
    .in('status', ['pending', 'confirmed'])
  
  if (params.exclude_booking_id) {
    query = query.neq('id', params.exclude_booking_id)
  }
  
  const { data, error } = await query
  
  if (error) {
    return []
  }
  
  // Check for time overlaps
  const conflicts = data?.filter(booking => {
    const bookingStart = booking.start_time
    const bookingEnd = booking.end_time
    const newStart = params.start_time
    const newEnd = params.end_time
    
    return (
      (newStart >= bookingStart && newStart < bookingEnd) ||
      (newEnd > bookingStart && newEnd <= bookingEnd) ||
      (newStart <= bookingStart && newEnd >= bookingEnd)
    )
  }) || []
  
  return conflicts
}

/**
 * Get available time slots
 */
export async function getAvailableTimeSlots(params: {
  staff_id: string
  service_id: string
  date: string
  location_id: string
}) {
  const supabase = await createClient()
  
  // Get staff working hours
  const { data: staffSchedule } = await supabase
    .from('staff_schedules')
    .select('*')
    .eq('staff_id', params.staff_id)
    .eq('location_id', params.location_id)
    .eq('day_of_week', new Date(params.date).getDay())
    .single()
  
  if (!staffSchedule || !staffSchedule.is_working) {
    return { data: [] }
  }
  
  // Get service duration
  const { data: service } = await supabase
    .from('services')
    .select('duration')
    .eq('id', params.service_id)
    .single()
  
  if (!service) {
    return { error: 'Service not found' }
  }
  
  // Get existing bookings for the day
  const { data: bookings } = await getBookings({
    staff_id: params.staff_id,
    date_from: params.date,
    date_to: params.date
  })
  
  // Generate available slots
  const slots = generateTimeSlots({
    startTime: staffSchedule.start_time,
    endTime: staffSchedule.end_time,
    duration: service.duration,
    breakStart: staffSchedule.break_start,
    breakEnd: staffSchedule.break_end,
    existingBookings: bookings || []
  })
  
  return { data: slots }
}

/**
 * Get upcoming bookings for customer
 */
export async function getCustomerUpcomingBookings(customerId: string) {
  const today = new Date().toISOString().split('T')[0]
  
  return getBookings({
    customer_id: customerId,
    date_from: today,
    status: 'confirmed',
    limit: 10
  })
}

/**
 * Get past bookings for customer
 */
export async function getCustomerPastBookings(customerId: string) {
  const today = new Date().toISOString().split('T')[0]
  
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      location:locations(id, name),
      staff:staff(id, first_name, last_name),
      service:services(id, name, duration, price)
    `)
    .eq('customer_id', customerId)
    .lt('booking_date', today)
    .order('booking_date', { ascending: false })
    .limit(20)
  
  if (error) {
    return { error: error.message }
  }
  
  return { data }
}

/**
 * Get staff bookings for a date
 */
export async function getStaffDayBookings(staffId: string, date: string) {
  return getBookings({
    staff_id: staffId,
    date_from: date,
    date_to: date
  })
}

/**
 * Mark booking as completed
 */
export async function completeBooking(bookingId: string) {
  return updateBooking(bookingId, {
    status: 'completed'
  })
}

/**
 * Mark booking as no-show
 */
export async function markBookingNoShow(bookingId: string) {
  return updateBooking(bookingId, {
    status: 'no-show'
  })
}

// Helper functions

async function createBookingStatusHistory(
  bookingId: string, 
  status: BookingStatus, 
  notes?: string
) {
  const supabase = await createClient()
  
  await supabase
    .from('booking_status_history')
    .insert({
      booking_id: bookingId,
      status,
      notes,
      created_at: new Date().toISOString()
    })
}

async function sendBookingConfirmation(bookingId: string) {
  // Implementation for sending confirmation email/SMS
  console.log('Sending booking confirmation for:', bookingId)
  // This would integrate with your email/SMS service
}

async function sendBookingCancellation(bookingId: string) {
  // Implementation for sending cancellation notification
  console.log('Sending booking cancellation for:', bookingId)
  // This would integrate with your email/SMS service
}

async function processBookingRefund(bookingId: string, amount: number) {
  // Implementation for processing refunds
  console.log('Processing refund for booking:', bookingId, 'Amount:', amount)
  // This would integrate with your payment processor
}

function generateTimeSlots(params: {
  startTime: string
  endTime: string
  duration: number
  breakStart?: string
  breakEnd?: string
  existingBookings: any[]
}) {
  const slots = []
  const slotDuration = params.duration
  
  // Parse times
  const [startHour, startMin] = params.startTime.split(':').map(Number)
  const [endHour, endMin] = params.endTime.split(':').map(Number)
  
  let currentHour = startHour
  let currentMin = startMin
  
  while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
    const slotStart = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`
    
    // Calculate slot end
    let endSlotMin = currentMin + slotDuration
    let endSlotHour = currentHour
    
    while (endSlotMin >= 60) {
      endSlotMin -= 60
      endSlotHour++
    }
    
    const slotEnd = `${endSlotHour.toString().padStart(2, '0')}:${endSlotMin.toString().padStart(2, '0')}`
    
    // Check if slot is available (not conflicting with breaks or existing bookings)
    const isAvailable = checkSlotAvailability(slotStart, slotEnd, params)
    
    if (isAvailable) {
      slots.push({
        start: slotStart,
        end: slotEnd,
        available: true
      })
    }
    
    // Move to next slot
    currentMin += 30 // 30-minute intervals
    if (currentMin >= 60) {
      currentMin -= 60
      currentHour++
    }
  }
  
  return slots
}

function checkSlotAvailability(
  slotStart: string, 
  slotEnd: string, 
  params: any
): boolean {
  // Check if slot conflicts with break time
  if (params.breakStart && params.breakEnd) {
    if (
      (slotStart >= params.breakStart && slotStart < params.breakEnd) ||
      (slotEnd > params.breakStart && slotEnd <= params.breakEnd)
    ) {
      return false
    }
  }
  
  // Check if slot conflicts with existing bookings
  for (const booking of params.existingBookings) {
    if (
      (slotStart >= booking.start_time && slotStart < booking.end_time) ||
      (slotEnd > booking.start_time && slotEnd <= booking.end_time)
    ) {
      return false
    }
  }
  
  return true
}