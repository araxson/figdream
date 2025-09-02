import { Database } from '@/types/database.types'
import { createClient } from '@/lib/database/supabase/server'
import { cache } from 'react'

type Salon = Database['public']['Tables']['salons']['Row']
type Service = Database['public']['Tables']['services']['Row']
type StaffProfile = Database['public']['Tables']['staff_profiles']['Row']
type Appointment = Database['public']['Tables']['appointments']['Row']
type AppointmentInsert = Database['public']['Tables']['appointments']['Insert']
type AppointmentService = Database['public']['Tables']['appointment_services']['Row']
type StaffSchedule = Database['public']['Tables']['staff_schedules']['Row']
type BlockedTime = Database['public']['Tables']['blocked_times']['Row']

/**
 * Get all active salons for public display
 */
export const getSalonsForBooking = cache(async () => {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('salons')
    .select(`
      *,
      salon_locations (
        id,
        address,
        city,
        state,
        postal_code,
        phone
      )
    `)
    .eq('is_active', true)
    .order('name')

  if (error) {
    console.error('Error fetching salons:', error)
    return []
  }

  return data || []
})

/**
 * Get salon details with services and staff
 */
export const getSalonForBooking = cache(async (salonId: string) => {
  const supabase = await createClient()
  
  const { data: salon, error: salonError } = await supabase
    .from('salons')
    .select(`
      *,
      salon_locations (
        id,
        address_line_1,
        address_line_2,
        city,
        state_province,
        postal_code,
        phone,
        latitude,
        longitude
      )
    `)
    .eq('id', salonId)
    .eq('is_active', true)
    .single()

  if (salonError || !salon) {
    console.error('Error fetching salon:', salonError)
    return null
  }

  return salon
})

/**
 * Get available services for a salon
 */
export const getServicesBySalon = cache(async (salonId: string) => {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('services')
    .select(`
      *,
      service_categories (
        id,
        name,
        description
      ),
      staff_services (
        staff_id
      )
    `)
    .eq('salon_id', salonId)
    .eq('is_active', true)
    .order('category_id')
    .order('name')

  if (error) {
    console.error('Error fetching services:', error)
    return []
  }

  return data || []
})

/**
 * Get staff members who can perform a specific service
 */
export const getStaffForService = cache(async (salonId: string, serviceId: string) => {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('staff_profiles')
    .select(`
      *,
      profiles (
        email,
        full_name,
        avatar_url
      ),
      staff_services!inner (
        service_id
      ),
      staff_schedules (
        day_of_week,
        start_time,
        end_time,
        is_available
      )
    `)
    .eq('salon_id', salonId)
    .eq('is_active', true)
    .eq('staff_services.service_id', serviceId)
    .order('display_name')

  if (error) {
    console.error('Error fetching staff:', error)
    return []
  }

  return data || []
})

/**
 * Get all staff for a salon
 */
export const getStaffBySalon = cache(async (salonId: string) => {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('staff_profiles')
    .select(`
      *,
      profiles (
        email,
        full_name,
        avatar_url
      ),
      staff_schedules (
        day_of_week,
        start_time,
        end_time,
        is_available
      )
    `)
    .eq('salon_id', salonId)
    .eq('is_active', true)
    .order('display_name')

  if (error) {
    console.error('Error fetching staff:', error)
    return []
  }

  return data || []
})

/**
 * Check staff availability for a specific date and time
 */
export async function checkStaffAvailability(
  staffId: string,
  date: string,
  startTime: string,
  duration: number
) {
  const supabase = await createClient()
  
  // Check staff schedule
  const dayOfWeek = new Date(date).getDay()
  const { data: schedule } = await supabase
    .from('staff_schedules')
    .select('*')
    .eq('staff_id', staffId)
    .eq('day_of_week', dayOfWeek)
    .eq('is_available', true)
    .single()

  if (!schedule) {
    return { available: false, reason: 'Staff not working this day' }
  }

  // Check if time is within working hours
  if (startTime < schedule.start_time || startTime >= schedule.end_time) {
    return { available: false, reason: 'Outside working hours' }
  }

  // Check for existing appointments
  const endTime = calculateEndTime(startTime, duration)
  const { data: conflicts } = await supabase
    .from('appointments')
    .select('id')
    .eq('staff_id', staffId)
    .eq('date', date)
    .gte('start_time', startTime)
    .lt('start_time', endTime)
    .in('status', ['confirmed', 'pending'])

  if (conflicts && conflicts.length > 0) {
    return { available: false, reason: 'Time slot already booked' }
  }

  // Check for blocked times
  const { data: blockedTimes } = await supabase
    .from('blocked_times')
    .select('id')
    .eq('staff_id', staffId)
    .lte('start_date', date)
    .gte('end_date', date)

  if (blockedTimes && blockedTimes.length > 0) {
    return { available: false, reason: 'Time blocked by staff' }
  }

  // Check for time off
  const { data: timeOff } = await supabase
    .from('staff_time_off')
    .select('id')
    .eq('staff_id', staffId)
    .lte('start_date', date)
    .gte('end_date', date)
    .eq('status', 'approved')

  if (timeOff && timeOff.length > 0) {
    return { available: false, reason: 'Staff on time off' }
  }

  return { available: true }
}

/**
 * Get available time slots for a staff member on a specific date
 */
export async function getAvailableTimeSlots(
  staffId: string,
  serviceId: string,
  date: string
) {
  const supabase = await createClient()
  
  // Get service duration
  const { data: service } = await supabase
    .from('services')
    .select('duration, buffer_time')
    .eq('id', serviceId)
    .single()

  if (!service) {
    return []
  }

  const totalDuration = service.duration + (service.buffer_time || 0)
  
  // Get staff schedule for the day
  const dayOfWeek = new Date(date).getDay()
  const { data: schedule } = await supabase
    .from('staff_schedules')
    .select('*')
    .eq('staff_id', staffId)
    .eq('day_of_week', dayOfWeek)
    .eq('is_available', true)
    .single()

  if (!schedule) {
    return []
  }

  // Get existing appointments
  const { data: appointments } = await supabase
    .from('appointments')
    .select('start_time, end_time')
    .eq('staff_id', staffId)
    .eq('date', date)
    .in('status', ['confirmed', 'pending'])
    .order('start_time')

  // Generate time slots
  const slots = []
  const startHour = parseInt(schedule.start_time.split(':')[0])
  const endHour = parseInt(schedule.end_time.split(':')[0])
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`
      const endTime = calculateEndTime(time, totalDuration)
      
      // Check if slot is available
      const isAvailable = !appointments?.some(apt => 
        (time >= apt.start_time && time < apt.end_time) ||
        (endTime > apt.start_time && endTime <= apt.end_time)
      )
      
      if (isAvailable && endTime <= schedule.end_time) {
        slots.push({
          time,
          available: true
        })
      }
    }
  }

  return slots
}

/**
 * Create a new booking
 */
export async function createBooking(data: {
  customerId?: string
  salonId: string
  staffId: string
  serviceId: string
  date: string
  startTime: string
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  notes?: string
}) {
  const supabase = await createClient()
  
  // Get service details
  const { data: service } = await supabase
    .from('services')
    .select('duration, buffer_time, price')
    .eq('id', data.serviceId)
    .single()

  if (!service) {
    throw new Error('Service not found')
  }

  const duration = service.duration + (service.buffer_time || 0)
  const endTime = calculateEndTime(data.startTime, duration)

  // Check availability one more time
  const availability = await checkStaffAvailability(
    data.staffId,
    data.date,
    data.startTime,
    duration
  )

  if (!availability.available) {
    throw new Error(availability.reason || 'Time slot not available')
  }

  // Create appointment
  const appointmentData: AppointmentInsert = {
    customer_id: data.customerId || null,
    salon_id: data.salonId,
    staff_id: data.staffId,
    date: data.date,
    start_time: data.startTime,
    end_time: endTime,
    status: 'pending',
    total_amount: service.price,
    notes: data.notes,
    // Store guest info if not logged in
    metadata: !data.customerId ? {
      guest_name: data.customerName,
      guest_email: data.customerEmail,
      guest_phone: data.customerPhone
    } : null
  }

  const { data: appointment, error: appointmentError } = await supabase
    .from('appointments')
    .insert(appointmentData)
    .select()
    .single()

  if (appointmentError) {
    console.error('Error creating appointment:', appointmentError)
    throw new Error('Failed to create appointment')
  }

  // Add service to appointment
  const { error: serviceError } = await supabase
    .from('appointment_services')
    .insert({
      appointment_id: appointment.id,
      service_id: data.serviceId,
      staff_id: data.staffId,
      price: service.price,
      duration: service.duration
    })

  if (serviceError) {
    console.error('Error adding service to appointment:', serviceError)
    // Rollback appointment
    await supabase
      .from('appointments')
      .delete()
      .eq('id', appointment.id)
    throw new Error('Failed to add service to appointment')
  }

  return appointment
}

/**
 * Helper function to calculate end time
 */
function calculateEndTime(startTime: string, duration: number): string {
  const [hours, minutes] = startTime.split(':').map(Number)
  const totalMinutes = hours * 60 + minutes + duration
  const endHours = Math.floor(totalMinutes / 60)
  const endMinutes = totalMinutes % 60
  return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}:00`
}