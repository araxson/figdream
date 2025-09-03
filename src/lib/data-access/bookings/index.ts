'use server'
import { createClient } from '@/lib/database/supabase/server'
import { Database } from '@/types/database.types'
// Type definitions for appointment operations
type _Appointment = Database['public']['Tables']['appointments']['Row']
type _AppointmentInsert = Database['public']['Tables']['appointments']['Insert']
type _AppointmentUpdate = Database['public']['Tables']['appointments']['Update']
export type AppointmentStatus = Database['public']['Tables']['appointments']['Row']['status']
export interface CreateAppointmentInput {
  customer_id: string
  salon_id: string
  location_id: string
  staff_id: string
  appointment_date: string
  start_time: string
  end_time: string
  total_amount?: number
  notes?: string
  is_walk_in?: boolean
  services?: Database['public']['Tables']['appointments']['Row']['services']
  total_duration?: number
}
export interface UpdateAppointmentInput {
  status?: AppointmentStatus
  staff_id?: string
  start_time?: string
  end_time?: string
  notes?: string
  total_amount?: number
}
export interface AppointmentFilters {
  salon_id?: string
  location_id?: string
  staff_id?: string
  customer_id?: string
  service_id?: string
  status?: AppointmentStatus
  date_from?: string
  date_to?: string
  limit?: number
  offset?: number
}
/**
 * Create a new appointment
 */
export async function createAppointment(input: CreateAppointmentInput) {
  const supabase = await createClient()
  // Check for conflicts
  const conflicts = await checkAppointmentConflicts({
    staff_id: input.staff_id,
    appointment_date: input.appointment_date,
    start_time: input.start_time,
    end_time: input.end_time
  })
  if (conflicts.length > 0) {
    return { 
      error: 'Appointment conflict detected', 
      conflicts 
    }
  }
  const { data, error } = await supabase
    .from('appointments')
    .insert({
      ...input,
      status: 'pending',
      created_at: new Date().toISOString()
    })
    .select()
    .single()
  if (error) {
    return { error: error.message }
  }
  // Create appointment status history entry
  await createAppointmentStatusHistory(data.id, 'pending', 'Appointment created')
  // Send confirmation email/SMS
  await sendAppointmentConfirmation(data.id)
  return { data }
}
/**
 * Get appointment by ID
 */
export async function getAppointmentById(appointmentId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      customers(*),
      salon_locations!appointments_location_id_fkey(*),
      staff_profiles!appointments_staff_id_fkey(*),
      appointment_services(*)
    `)
    .eq('id', appointmentId)
    .single()
  if (error) {
    return { error: error.message }
  }
  return { data }
}
/**
 * Get appointments with filters
 */
export async function getAppointments(filters: AppointmentFilters = {}) {
  const supabase = await createClient()
  let query = supabase
    .from('appointments')
    .select(`
      *,
      customers(id, first_name, last_name, email, phone),
      salon_locations!appointments_location_id_fkey(id, name),
      staff_profiles!appointments_staff_id_fkey(id, display_name),
      appointment_services(*, services(*))
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
    query = query.gte('appointment_date', filters.date_from)
  }
  if (filters.date_to) {
    query = query.lte('appointment_date', filters.date_to)
  }
  // Apply pagination
  if (filters.limit) {
    query = query.limit(filters.limit)
  }
  if (filters.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
  }
  // Order by appointment date and time
  query = query.order('appointment_date', { ascending: false })
    .order('start_time', { ascending: false })
  const { data, error } = await query
  if (error) {
    return { error: error.message }
  }
  return { data }
}
/**
 * Update appointment
 */
export async function updateAppointment(appointmentId: string, input: UpdateAppointmentInput) {
  const supabase = await createClient()
  // Get current appointment
  const { data: currentAppointment } = await getAppointmentById(appointmentId)
  if (!currentAppointment) {
    return { error: 'Appointment not found' }
  }
  // Check for conflicts if time/staff is being changed
  if (input.staff_id || input.start_time || input.end_time) {
    const conflicts = await checkAppointmentConflicts({
      staff_id: input.staff_id || currentAppointment.staff_id,
      appointment_date: currentAppointment.appointment_date,
      start_time: input.start_time || currentAppointment.start_time,
      end_time: input.end_time || currentAppointment.end_time,
      exclude_appointment_id: appointmentId
    })
    if (conflicts.length > 0) {
      return { 
        error: 'Appointment conflict detected', 
        conflicts 
      }
    }
  }
  const { data, error } = await supabase
    .from('appointments')
    .update({
      ...input,
      updated_at: new Date().toISOString()
    })
    .eq('id', appointmentId)
    .select()
    .single()
  if (error) {
    return { error: error.message }
  }
  // Log status change if applicable
  if (input.status && input.status !== currentAppointment.status) {
    await createAppointmentStatusHistory(appointmentId, input.status, 'Status updated')
    // Send notification based on status
    if (input.status === 'confirmed') {
      await sendAppointmentConfirmation(appointmentId)
    } else if (input.status === 'cancelled') {
      await sendAppointmentCancellation(appointmentId)
    }
  }
  return { data }
}
/**
 * Cancel appointment
 */
export async function cancelAppointment(appointmentId: string, reason?: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('appointments')
    .update({
      status: 'cancelled',
      cancellation_reason: reason,
      cancelled_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', appointmentId)
    .select()
    .single()
  if (error) {
    return { error: error.message }
  }
  // Create status history
  await createAppointmentStatusHistory(appointmentId, 'cancelled', reason || 'Appointment cancelled')
  // Send cancellation notification
  await sendAppointmentCancellation(appointmentId)
  // Process refund if applicable
  if (data.total_amount && data.total_amount > 0) {
    await processAppointmentRefund(appointmentId, data.total_amount)
  }
  return { data }
}
/**
 * Check for appointment conflicts
 */
export async function checkAppointmentConflicts(params: {
  staff_id: string
  appointment_date: string
  start_time: string
  end_time: string
  exclude_appointment_id?: string
}) {
  const supabase = await createClient()
  let query = supabase
    .from('appointments')
    .select('*')
    .eq('staff_id', params.staff_id)
    .eq('appointment_date', params.appointment_date)
    .in('status', ['pending', 'confirmed'])
  if (params.exclude_appointment_id) {
    query = query.neq('id', params.exclude_appointment_id)
  }
  const { data, error } = await query
  if (error) {
    return []
  }
  // Check for time overlaps
  const conflicts = data?.filter(appointment => {
    const appointmentStart = appointment.start_time
    const appointmentEnd = appointment.end_time
    const newStart = params.start_time
    const newEnd = params.end_time
    return (
      (newStart >= appointmentStart && newStart < appointmentEnd) ||
      (newEnd > appointmentStart && newEnd <= appointmentEnd) ||
      (newStart <= appointmentStart && newEnd >= appointmentEnd)
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
  // Get existing appointments for the day
  const { data: appointments } = await getAppointments({
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
    existingAppointments: appointments || []
  })
  return { data: slots }
}
/**
 * Get upcoming appointments for customer
 */
export async function getCustomerUpcomingAppointments(customerId: string) {
  const today = new Date().toISOString().split('T')[0]
  return getAppointments({
    customer_id: customerId,
    date_from: today,
    status: 'confirmed',
    limit: 10
  })
}
/**
 * Get past appointments for customer
 */
export async function getCustomerPastAppointments(customerId: string) {
  const today = new Date().toISOString().split('T')[0]
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      salon_locations!appointments_location_id_fkey(id, name),
      staff_profiles!appointments_staff_id_fkey(id, display_name),
      appointment_services(*, services(*))
    `)
    .eq('customer_id', customerId)
    .lt('appointment_date', today)
    .order('appointment_date', { ascending: false })
    .limit(20)
  if (error) {
    return { error: error.message }
  }
  return { data }
}
/**
 * Get staff appointments for a date
 */
export async function getStaffDayAppointments(staffId: string, date: string) {
  return getAppointments({
    staff_id: staffId,
    date_from: date,
    date_to: date
  })
}
/**
 * Mark appointment as completed
 */
export async function completeAppointment(appointmentId: string) {
  return updateAppointment(appointmentId, {
    status: 'completed'
  })
}
/**
 * Mark appointment as no-show
 */
export async function markAppointmentNoShow(appointmentId: string) {
  return updateAppointment(appointmentId, {
    status: 'no-show'
  })
}
/**
 * Update appointment status specifically
 */
export async function updateBookingStatus(appointmentId: string, status: AppointmentStatus, reason?: string) {
  const supabase = await createClient()
  const updateData: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString()
  }
  // Add specific fields based on status
  if (status === 'cancelled') {
    updateData.cancelled_at = new Date().toISOString()
    updateData.cancellation_reason = reason
  } else if (status === 'completed') {
    updateData.completed_at = new Date().toISOString()
  } else if (status === 'confirmed') {
    updateData.confirmed_at = new Date().toISOString()
  }
  const { data, error } = await supabase
    .from('appointments')
    .update(updateData)
    .eq('id', appointmentId)
    .select()
    .single()
  if (error) {
    return { error: error.message }
  }
  // Create status history
  await createAppointmentStatusHistory(appointmentId, status, reason || `Status updated to ${status}`)
  // Send notifications based on status
  if (status === 'confirmed') {
    await sendAppointmentConfirmation(appointmentId)
  } else if (status === 'cancelled') {
    await sendAppointmentCancellation(appointmentId)
  }
  return { data }
}
/**
 * Check if a specific time slot is available
 */
export async function isTimeSlotAvailable(params: {
  staff_id: string
  location_id: string
  appointment_date: string
  start_time: string
  end_time: string
  exclude_appointment_id?: string
}) {
  const conflicts = await checkAppointmentConflicts(params)
  // Check staff schedule
  const supabase = await createClient()
  const dayOfWeek = new Date(params.appointment_date).getDay()
  const { data: schedule } = await supabase
    .from('staff_schedules')
    .select('*')
    .eq('staff_id', params.staff_id)
    .eq('location_id', params.location_id)
    .eq('day_of_week', dayOfWeek)
    .single()
  if (!schedule || !schedule.is_working) {
    return { available: false, reason: 'Staff not working on this day' }
  }
  // Check if time slot is within working hours
  if (params.start_time < schedule.start_time || params.end_time > schedule.end_time) {
    return { available: false, reason: 'Time slot outside working hours' }
  }
  // Check if time slot conflicts with break
  if (schedule.break_start && schedule.break_end) {
    if (
      (params.start_time >= schedule.break_start && params.start_time < schedule.break_end) ||
      (params.end_time > schedule.break_start && params.end_time <= schedule.break_end) ||
      (params.start_time <= schedule.break_start && params.end_time >= schedule.break_end)
    ) {
      return { available: false, reason: 'Time slot conflicts with break time' }
    }
  }
  // Check for blocked times
  const { data: blockedTimes } = await supabase
    .from('blocked_times')
    .select('*')
    .eq('staff_id', params.staff_id)
    .eq('location_id', params.location_id)
  if (blockedTimes && blockedTimes.length > 0) {
    for (const blockedTime of blockedTimes) {
      const blockedStart = blockedTime.start_datetime
      const blockedEnd = blockedTime.end_datetime
      const appointmentStart = `${params.appointment_date}T${params.start_time}`
      const appointmentEnd = `${params.appointment_date}T${params.end_time}`
      if (
        (appointmentStart >= blockedStart && appointmentStart < blockedEnd) ||
        (appointmentEnd > blockedStart && appointmentEnd <= blockedEnd) ||
        (appointmentStart <= blockedStart && appointmentEnd >= blockedEnd)
      ) {
        return { available: false, reason: 'Time slot is blocked' }
      }
    }
  }
  if (conflicts.length > 0) {
    return { available: false, reason: 'Time slot conflicts with existing appointment', conflicts }
  }
  return { available: true }
}
/**
 * Get available staff for a specific service and time slot
 */
export async function getAvailableStaff(params: {
  salon_id: string
  location_id: string
  service_id: string
  appointment_date: string
  start_time: string
  end_time: string
}) {
  const supabase = await createClient()
  // Get staff who can perform this service
  const { data: staffServices, error: staffServicesError } = await supabase
    .from('staff_services')
    .select(`
      staff_id,
      staff_profiles (
        id,
        user_id,
        display_name,
        is_active,
        profiles:user_id (
          first_name,
          last_name,
          avatar_url
        )
      )
    `)
    .eq('service_id', params.service_id)
  if (staffServicesError) {
    return { error: staffServicesError.message }
  }
  if (!staffServices || staffServices.length === 0) {
    return { data: [] }
  }
  const availableStaff = []
  // Check availability for each staff member
  for (const staffService of staffServices) {
    if (!staffService.staff_profiles?.is_active) {
      continue
    }
    const availability = await isTimeSlotAvailable({
      staff_id: staffService.staff_id,
      location_id: params.location_id,
      appointment_date: params.appointment_date,
      start_time: params.start_time,
      end_time: params.end_time
    })
    if (availability.available) {
      availableStaff.push({
        id: staffService.staff_id,
        display_name: staffService.staff_profiles.display_name,
        first_name: staffService.staff_profiles.profiles?.first_name,
        last_name: staffService.staff_profiles.profiles?.last_name,
        avatar_url: staffService.staff_profiles.profiles?.avatar_url
      })
    }
  }
  return { data: availableStaff }
}
// Alias functions for backward compatibility and the requested function names
export const createBooking = createAppointment
export const updateBooking = updateAppointment
export const cancelBooking = cancelAppointment
export const getBookingById = getAppointmentById
export const getBookingConflicts = checkAppointmentConflicts
// Helper functions
async function createAppointmentStatusHistory(
  appointmentId: string, 
  status: AppointmentStatus, 
  notes?: string
) {
  const supabase = await createClient()
  await supabase
    .from('appointment_status_history')
    .insert({
      appointment_id: appointmentId,
      status,
      notes,
      created_at: new Date().toISOString()
    })
}
async function sendAppointmentConfirmation(_appointmentId: string) {
  // Implementation for sending confirmation email/SMS
  // This would integrate with your email/SMS service
}
async function sendAppointmentCancellation(_appointmentId: string) {
  // Implementation for sending cancellation notification
  // This would integrate with your email/SMS service
}
async function processAppointmentRefund(_appointmentId: string, _amount: number) {
  // Implementation for processing refunds
  // This would integrate with your payment processor
}
function generateTimeSlots(params: {
  startTime: string
  endTime: string
  duration: number
  breakStart?: string
  breakEnd?: string
  existingAppointments: { start_time: string; end_time: string }[]
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
    // Check if slot is available (not conflicting with breaks or existing appointments)
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
  params: {
    breakStart?: string
    breakEnd?: string
    existingAppointments: { start_time: string; end_time: string }[]
  }
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
  // Check if slot conflicts with existing appointments
  for (const appointment of params.existingAppointments) {
    if (
      (slotStart >= appointment.start_time && slotStart < appointment.end_time) ||
      (slotEnd > appointment.start_time && slotEnd <= appointment.end_time)
    ) {
      return false
    }
  }
  return true
}