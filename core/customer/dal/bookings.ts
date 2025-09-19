import { createClient } from '@/lib/supabase/server'
import type {
  SalonSearchResult,
  SalonSearchFilters,
  ServiceSelectionItem,
  StaffMember,
  TimeSlot,
  BookingDetails,
  SalonBookingData,
  BookingFormData
} from '../types'

export async function searchSalons(
  filters: SalonSearchFilters = {},
  userId?: string
): Promise<SalonSearchResult[]> {
  const supabase = await createClient()

  let query = supabase
    .from('salons')
    .select(`
      id,
      name,
      slug,
      description,
      short_description,
      address,
      rating_average,
      rating_count,
      logo_url,
      cover_image_url,
      features,
      is_accepting_bookings,
      business_type
    `)
    .eq('is_active', true)
    .eq('is_accepting_bookings', true)

  // Apply filters
  if (filters.rating) {
    query = query.gte('rating_average', filters.rating)
  }

  if (filters.services && filters.services.length > 0) {
    // Join with services to filter by service offerings
    query = query.in('id',
      supabase
        .from('services')
        .select('salon_id')
        .in('name', filters.services)
        .eq('is_active', true)
    )
  }

  const { data, error } = await query
    .order('rating_average', { ascending: false })
    .limit(20)

  if (error) {
    throw new Error(`Failed to search salons: ${error.message}`)
  }

  return data.map(salon => ({
    id: salon.id,
    name: salon.name,
    slug: salon.slug,
    description: salon.description || '',
    shortDescription: salon.short_description || '',
    address: salon.address,
    rating: salon.rating_average || 0,
    reviewCount: salon.rating_count || 0,
    priceRange: '$$', // TODO: Calculate from services
    coverImageUrl: salon.cover_image_url,
    logoUrl: salon.logo_url,
    features: salon.features || [],
    isBookingAvailable: salon.is_accepting_bookings,
    nextAvailableSlot: undefined // TODO: Calculate from schedules
  }))
}

export async function getSalonBookingData(
  salonId: string,
  userId?: string
): Promise<SalonBookingData> {
  const supabase = createClient()

  // Get salon details
  const { data: salon, error: salonError } = await supabase
    .from('salons')
    .select(`
      id,
      name,
      slug,
      description,
      short_description,
      address,
      rating_average,
      rating_count,
      logo_url,
      cover_image_url,
      features,
      is_accepting_bookings,
      settings
    `)
    .eq('id', salonId)
    .eq('is_active', true)
    .single()

  if (salonError || !salon) {
    throw new Error('Salon not found')
  }

  // Get services
  const { data: services, error: servicesError } = await supabase
    .from('services')
    .select(`
      id,
      name,
      description,
      base_price,
      duration_minutes,
      category_id,
      image_url,
      is_active,
      service_categories!inner(name)
    `)
    .eq('salon_id', salonId)
    .eq('is_active', true)
    .order('category_id')

  if (servicesError) {
    throw new Error(`Failed to fetch services: ${servicesError.message}`)
  }

  // Get staff
  const { data: staff, error: staffError } = await supabase
    .from('staff_profiles')
    .select(`
      id,
      user_id,
      title,
      bio,
      experience_years,
      specializations,
      rating_average,
      rating_count,
      profile_image_url,
      portfolio_urls,
      is_active,
      is_bookable,
      profiles!inner(first_name, last_name)
    `)
    .eq('salon_id', salonId)
    .eq('is_active', true)
    .eq('is_bookable', true)

  if (staffError) {
    throw new Error(`Failed to fetch staff: ${staffError.message}`)
  }

  // Get operating hours
  const { data: operatingHours, error: hoursError } = await supabase
    .from('operating_hours')
    .select('day_of_week, open_time, close_time, is_closed')
    .eq('salon_id', salonId)

  if (hoursError) {
    throw new Error(`Failed to fetch operating hours: ${hoursError.message}`)
  }

  const salonResult: SalonSearchResult = {
    id: salon.id,
    name: salon.name,
    slug: salon.slug,
    description: salon.description || '',
    shortDescription: salon.short_description || '',
    address: salon.address,
    rating: salon.rating_average || 0,
    reviewCount: salon.rating_count || 0,
    priceRange: '$$',
    coverImageUrl: salon.cover_image_url,
    logoUrl: salon.logo_url,
    features: salon.features || [],
    isBookingAvailable: salon.is_accepting_bookings
  }

  const serviceItems: ServiceSelectionItem[] = services.map(service => ({
    id: service.id,
    name: service.name,
    description: service.description || '',
    duration: service.duration_minutes,
    price: service.base_price,
    category: service.service_categories?.name || 'General',
    isSelected: false,
    imageUrl: service.image_url
  }))

  const staffMembers: StaffMember[] = staff.map(member => ({
    id: member.id,
    userId: member.user_id,
    name: `${member.profiles?.first_name || ''} ${member.profiles?.last_name || ''}`.trim(),
    title: member.title || '',
    bio: member.bio || '',
    specializations: member.specializations || [],
    rating: member.rating_average || 0,
    reviewCount: member.rating_count || 0,
    experienceYears: member.experience_years || 0,
    profileImageUrl: member.profile_image_url,
    portfolioUrls: member.portfolio_urls || [],
    isAvailable: true // TODO: Check schedule
  }))

  const hours = operatingHours.reduce((acc, hour) => {
    acc[hour.day_of_week] = {
      open: hour.open_time || '09:00',
      close: hour.close_time || '17:00',
      isClosed: hour.is_closed
    }
    return acc
  }, {} as Record<string, any>)

  return {
    salon: salonResult,
    services: serviceItems,
    staff: staffMembers,
    availability: [], // TODO: Calculate availability
    operatingHours: hours
  }
}

export async function getAvailableTimeSlots(
  salonId: string,
  date: Date,
  serviceIds: string[],
  staffId?: string
): Promise<TimeSlot[]> {
  const supabase = createClient()

  // Get salon operating hours for the day
  const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'lowercase' }) as any

  const { data: hours, error: hoursError } = await supabase
    .from('operating_hours')
    .select('open_time, close_time, is_closed')
    .eq('salon_id', salonId)
    .eq('day_of_week', dayOfWeek)
    .single()

  if (hoursError || !hours || hours.is_closed) {
    return []
  }

  // Get service durations
  const { data: services, error: servicesError } = await supabase
    .from('services')
    .select('id, duration_minutes')
    .in('id', serviceIds)

  if (servicesError) {
    throw new Error(`Failed to fetch service durations: ${servicesError.message}`)
  }

  const totalDuration = services.reduce((sum, service) => sum + service.duration_minutes, 0)

  // Get existing appointments for the date
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  let appointmentQuery = supabase
    .from('appointments')
    .select('start_time, end_time, staff_id')
    .eq('salon_id', salonId)
    .gte('start_time', startOfDay.toISOString())
    .lte('start_time', endOfDay.toISOString())
    .in('status', ['scheduled', 'confirmed', 'in_progress'])

  if (staffId) {
    appointmentQuery = appointmentQuery.eq('staff_id', staffId)
  }

  const { data: appointments, error: appointmentsError } = await appointmentQuery

  if (appointmentsError) {
    throw new Error(`Failed to fetch appointments: ${appointmentsError.message}`)
  }

  // Generate time slots
  const slots: TimeSlot[] = []
  const openTime = new Date(`${date.toISOString().split('T')[0]}T${hours.open_time}`)
  const closeTime = new Date(`${date.toISOString().split('T')[0]}T${hours.close_time}`)

  let currentTime = new Date(openTime)

  while (currentTime < closeTime) {
    const endTime = new Date(currentTime.getTime() + totalDuration * 60000)

    if (endTime <= closeTime) {
      // Check if slot conflicts with existing appointments
      const isAvailable = !appointments?.some(apt => {
        const aptStart = new Date(apt.start_time)
        const aptEnd = new Date(apt.end_time)
        return (
          (currentTime >= aptStart && currentTime < aptEnd) ||
          (endTime > aptStart && endTime <= aptEnd) ||
          (currentTime <= aptStart && endTime >= aptEnd)
        )
      })

      slots.push({
        date,
        time: currentTime.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }),
        isAvailable,
        staffId,
        duration: totalDuration
      })
    }

    // Move to next 30-minute slot
    currentTime = new Date(currentTime.getTime() + 30 * 60000)
  }

  return slots
}

export async function createBooking(
  userId: string,
  bookingData: BookingFormData
): Promise<string> {
  const supabase = createClient()

  // Verify authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== userId) {
    throw new Error('Unauthorized')
  }

  // Get service details for pricing
  const { data: services, error: servicesError } = await supabase
    .from('services')
    .select('id, name, base_price, duration_minutes')
    .in('id', bookingData.services.map(s => s.id))

  if (servicesError) {
    throw new Error(`Failed to fetch services: ${servicesError.message}`)
  }

  const totalPrice = services.reduce((sum, service) => sum + service.base_price, 0)
  const totalDuration = services.reduce((sum, service) => sum + service.duration_minutes, 0)

  // Create appointment
  const startTime = new Date(`${bookingData.date}T${bookingData.time}`)
  const endTime = new Date(startTime.getTime() + totalDuration * 60000)

  const { data: appointment, error: appointmentError } = await supabase
    .from('appointments')
    .insert({
      salon_id: bookingData.salonId,
      customer_id: userId,
      staff_id: bookingData.staffId,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      total_price: totalPrice,
      status: 'scheduled',
      notes: bookingData.notes,
      booking_type: 'online'
    })
    .select('id')
    .single()

  if (appointmentError) {
    throw new Error(`Failed to create appointment: ${appointmentError.message}`)
  }

  // Add services to appointment
  const appointmentServices = services.map(service => ({
    appointment_id: appointment.id,
    service_id: service.id,
    price: service.base_price,
    duration_minutes: service.duration_minutes
  }))

  const { error: servicesInsertError } = await supabase
    .from('appointment_services')
    .insert(appointmentServices)

  if (servicesInsertError) {
    throw new Error(`Failed to add services: ${servicesInsertError.message}`)
  }

  return appointment.id
}

export async function cancelBooking(
  userId: string,
  appointmentId: string,
  reason?: string
): Promise<void> {
  const supabase = createClient()

  // Verify authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== userId) {
    throw new Error('Unauthorized')
  }

  // Verify appointment belongs to user
  const { data: appointment, error: verifyError } = await supabase
    .from('appointments')
    .select('id, customer_id, start_time, status')
    .eq('id', appointmentId)
    .eq('customer_id', userId)
    .single()

  if (verifyError || !appointment) {
    throw new Error('Appointment not found')
  }

  // Check if cancellation is allowed
  const now = new Date()
  const appointmentTime = new Date(appointment.start_time)
  const hoursUntilAppointment = (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60)

  if (hoursUntilAppointment < 24) {
    throw new Error('Appointments cannot be cancelled less than 24 hours in advance')
  }

  if (!['scheduled', 'confirmed'].includes(appointment.status)) {
    throw new Error('Appointment cannot be cancelled')
  }

  // Cancel appointment
  const { error: cancelError } = await supabase
    .from('appointments')
    .update({
      status: 'cancelled',
      cancellation_reason: reason,
      cancelled_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', appointmentId)

  if (cancelError) {
    throw new Error(`Failed to cancel appointment: ${cancelError.message}`)
  }
}

export async function rescheduleBooking(
  userId: string,
  appointmentId: string,
  newDate: string,
  newTime: string
): Promise<void> {
  const supabase = createClient()

  // Verify authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== userId) {
    throw new Error('Unauthorized')
  }

  // Verify appointment belongs to user
  const { data: appointment, error: verifyError } = await supabase
    .from('appointments')
    .select(`
      id,
      customer_id,
      start_time,
      end_time,
      status,
      appointment_services(duration_minutes)
    `)
    .eq('id', appointmentId)
    .eq('customer_id', userId)
    .single()

  if (verifyError || !appointment) {
    throw new Error('Appointment not found')
  }

  if (!['scheduled', 'confirmed'].includes(appointment.status)) {
    throw new Error('Appointment cannot be rescheduled')
  }

  // Calculate new end time
  const totalDuration = appointment.appointment_services?.reduce(
    (sum: number, service: any) => sum + service.duration_minutes,
    0
  ) || 60

  const newStartTime = new Date(`${newDate}T${newTime}`)
  const newEndTime = new Date(newStartTime.getTime() + totalDuration * 60000)

  // Update appointment
  const { error: updateError } = await supabase
    .from('appointments')
    .update({
      start_time: newStartTime.toISOString(),
      end_time: newEndTime.toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', appointmentId)

  if (updateError) {
    throw new Error(`Failed to reschedule appointment: ${updateError.message}`)
  }
}