// Booking system data access layer - Read operations
import { createClient } from '@/lib/supabase/server'
import type {
  Appointment,
  AppointmentService,
  Service,
  ServiceCategory,
  StaffProfile,
  StaffSchedule,
  TimeSlot,
  DailyAvailability,
  StaffAvailability,
  BookingListItem,
  BookingFilters,
  CapacityInfo,
  BookingAnalytics,
  WaitingListEntry,
  ExtendedAppointment
} from '../types'

// Get available services with categories
export async function getAvailableServices(salonId: string) {
  const supabase = await createClient()

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  const { data: services, error } = await supabase
    .from('services')
    .select(`
      *,
      service_categories (
        id,
        name,
        display_order
      )
    `)
    .eq('salon_id', salonId)
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching services:', error)
    throw new Error('Failed to fetch services')
  }

  return services || []
}

// Get service categories
export async function getServiceCategories(salonId: string) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  const { data: categories, error } = await supabase
    .from('service_categories')
    .select('*')
    .eq('salon_id', salonId)
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching categories:', error)
    throw new Error('Failed to fetch categories')
  }

  return categories || []
}

// Get available staff for services
export async function getAvailableStaff(salonId: string, serviceIds?: string[]) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  let query = supabase
    .from('staff_profiles')
    .select(`
      *,
      staff_services!inner (
        service_id,
        is_primary
      )
    `)
    .eq('salon_id', salonId)
    .eq('is_active', true)

  // Filter by service capability if service IDs provided
  if (serviceIds && serviceIds.length > 0) {
    query = query.in('staff_services.service_id', serviceIds)
  }

  const { data: staff, error } = await query
    .order('display_name', { ascending: true })

  if (error) {
    console.error('Error fetching staff:', error)
    throw new Error('Failed to fetch staff')
  }

  return staff || []
}

// Get staff schedules for date range
export async function getStaffSchedules(
  salonId: string,
  staffIds: string[],
  startDate: Date,
  endDate: Date
) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  const { data: schedules, error } = await supabase
    .from('staff_schedules')
    .select('*')
    .eq('salon_id', salonId)
    .in('staff_id', staffIds)
    .gte('date', startDate.toISOString())
    .lte('date', endDate.toISOString())
    .order('date', { ascending: true })

  if (error) {
    console.error('Error fetching schedules:', error)
    throw new Error('Failed to fetch schedules')
  }

  return schedules || []
}

// Get appointments for availability checking
export async function getExistingAppointments(
  salonId: string,
  staffId?: string,
  startDate?: Date,
  endDate?: Date
) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  let query = supabase
    .from('appointments')
    .select(`
      *,
      appointment_services (*)
    `)
    .eq('salon_id', salonId)
    .in('status', ['confirmed', 'checked_in', 'in_progress'])

  if (staffId) {
    query = query.eq('staff_id', staffId)
  }

  if (startDate) {
    query = query.gte('start_time', startDate.toISOString())
  }

  if (endDate) {
    query = query.lte('end_time', endDate.toISOString())
  }

  const { data: appointments, error } = await query
    .order('start_time', { ascending: true })

  if (error) {
    console.error('Error fetching appointments:', error)
    throw new Error('Failed to fetch appointments')
  }

  return appointments || []
}

// Get available time slots for a specific date and staff
export async function getAvailableTimeSlots(
  salonId: string,
  date: Date,
  serviceDuration: number,
  staffId?: string
): Promise<TimeSlot[]> {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  // Get existing appointments for the date
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  const appointments = await getExistingAppointments(
    salonId,
    staffId,
    startOfDay,
    endOfDay
  )

  // Get staff schedules if staff specified
  let schedules: StaffSchedule[] = []
  if (staffId) {
    schedules = await getStaffSchedules(
      salonId,
      [staffId],
      startOfDay,
      endOfDay
    )
  }

  // Generate time slots (9 AM to 7 PM with 15-minute intervals)
  const slots: TimeSlot[] = []
  const startHour = 9
  const endHour = 19
  const interval = 15 // minutes

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      const slotTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      const slotStart = new Date(date)
      slotStart.setHours(hour, minute, 0, 0)
      const slotEnd = new Date(slotStart.getTime() + serviceDuration * 60000)

      // Check if slot conflicts with existing appointments
      const hasConflict = appointments.some(apt => {
        const aptStart = new Date(apt.start_time!)
        const aptEnd = new Date(apt.end_time!)
        return (slotStart < aptEnd && slotEnd > aptStart)
      })

      // Check if staff is available (if staff schedule exists)
      let staffAvailable = true
      if (staffId && schedules.length > 0) {
        const schedule = schedules.find(s =>
          new Date(s.date!).toDateString() === date.toDateString()
        )
        if (schedule) {
          const scheduleStart = new Date(date)
          const [startHr, startMin] = (schedule.start_time || '09:00').split(':').map(Number)
          scheduleStart.setHours(startHr, startMin, 0, 0)

          const scheduleEnd = new Date(date)
          const [endHr, endMin] = (schedule.end_time || '19:00').split(':').map(Number)
          scheduleEnd.setHours(endHr, endMin, 0, 0)

          staffAvailable = slotStart >= scheduleStart && slotEnd <= scheduleEnd
        }
      }

      slots.push({
        time: slotTime,
        available: !hasConflict && staffAvailable,
        staffId: staffId
      })
    }
  }

  return slots
}

// Get bookings with filters
export async function getBookings(
  salonId: string,
  filters?: BookingFilters
): Promise<BookingListItem[]> {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  let query = supabase
    .from('appointments')
    .select(`
      *,
      appointment_services (
        service_name
      ),
      customer:customer_id (
        id,
        email
      ),
      staff:staff_id (
        id,
        display_name
      )
    `)
    .eq('salon_id', salonId)

  // Apply filters
  if (filters) {
    if (filters.status && filters.status.length > 0) {
      query = query.in('status', filters.status)
    }
    if (filters.staffId) {
      query = query.eq('staff_id', filters.staffId)
    }
    if (filters.customerId) {
      query = query.eq('customer_id', filters.customerId)
    }
    if (filters.dateRange) {
      query = query
        .gte('start_time', filters.dateRange.start.toISOString())
        .lte('start_time', filters.dateRange.end.toISOString())
    }
    if (filters.searchTerm) {
      query = query.or(`confirmation_code.ilike.%${filters.searchTerm}%,notes.ilike.%${filters.searchTerm}%`)
    }
  }

  const { data: bookings, error } = await query
    .order('start_time', { ascending: false })
    .limit(100)

  if (error) {
    console.error('Error fetching bookings:', error)
    throw new Error('Failed to fetch bookings')
  }

  // Transform data
  return (bookings || []).map(booking => ({
    ...booking,
    customerName: booking.customer?.email || 'Unknown',
    staffName: booking.staff?.display_name || 'Unassigned',
    services: booking.appointment_services?.map((s: any) => s.service_name) || [],
    isPastDue: new Date(booking.start_time!) < new Date() && booking.status === 'confirmed',
    canReschedule: ['pending', 'confirmed'].includes(booking.status!),
    canCancel: ['pending', 'confirmed'].includes(booking.status!)
  }))
}

// Get booking by ID
export async function getBookingById(appointmentId: string): Promise<ExtendedAppointment> {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  const { data: booking, error } = await supabase
    .from('appointments')
    .select(`
      *,
      appointment_services (*),
      customer:customer_id (
        id,
        email
      ),
      staff:staff_id (
        *
      ),
      salon:salon_id (
        id,
        name,
        address,
        phone,
        email
      )
    `)
    .eq('id', appointmentId)
    .single()

  if (error) {
    console.error('Error fetching booking:', error)
    throw new Error('Failed to fetch booking')
  }

  // Add extended properties with defaults
  return {
    ...booking,
    confirmation_code: booking.confirmation_code || `CONF-${appointmentId.slice(0, 8).toUpperCase()}`,
    total_amount: booking.total_amount || 0,
    deposit_amount: booking.deposit_amount || 0
  } as ExtendedAppointment
}

// Get waiting list entries
export async function getWaitingList(
  salonId: string,
  filters?: {
    serviceIds?: string[]
    staffId?: string
    dateRange?: { start: Date; end: Date }
  }
): Promise<WaitingListEntry[]> {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  // Note: Waiting list would need its own table in production
  // For now, returning empty array as placeholder
  return []
}

// Get capacity information for date range
export async function getCapacityInfo(
  salonId: string,
  startDate: Date,
  endDate: Date
): Promise<CapacityInfo[]> {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  const appointments = await getExistingAppointments(
    salonId,
    undefined,
    startDate,
    endDate
  )

  // Calculate capacity per day (simplified)
  const capacityByDate = new Map<string, CapacityInfo>()
  const totalSlotsPerDay = 32 // 8 hours * 4 slots per hour

  appointments.forEach(apt => {
    const date = new Date(apt.start_time!).toDateString()
    const info = capacityByDate.get(date) || {
      date: new Date(apt.start_time!),
      totalSlots: totalSlotsPerDay,
      bookedSlots: 0,
      availableSlots: totalSlotsPerDay,
      utilizationPercentage: 0
    }

    info.bookedSlots++
    info.availableSlots = info.totalSlots - info.bookedSlots
    info.utilizationPercentage = (info.bookedSlots / info.totalSlots) * 100

    capacityByDate.set(date, info)
  })

  return Array.from(capacityByDate.values())
}

// Get booking analytics
export async function getBookingAnalytics(
  salonId: string,
  startDate: Date,
  endDate: Date
): Promise<BookingAnalytics> {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  const { data: appointments, error } = await supabase
    .from('appointments')
    .select(`
      *,
      appointment_services (
        service_name,
        service_id
      ),
      staff:staff_id (
        id,
        display_name
      )
    `)
    .eq('salon_id', salonId)
    .gte('start_time', startDate.toISOString())
    .lte('start_time', endDate.toISOString())

  if (error) {
    console.error('Error fetching analytics:', error)
    throw new Error('Failed to fetch analytics')
  }

  const bookings = appointments || []

  // Calculate analytics
  const serviceCount = new Map<string, { name: string; count: number }>()
  const staffCount = new Map<string, { name: string; count: number }>()
  const hourCount = new Map<number, number>()

  let totalBookings = 0
  let completedBookings = 0
  let cancelledBookings = 0
  let noShowBookings = 0
  let totalLeadTime = 0

  bookings.forEach(booking => {
    totalBookings++

    if (booking.status === 'completed') completedBookings++
    if (booking.status === 'cancelled') cancelledBookings++
    if (booking.status === 'no_show') noShowBookings++

    // Lead time (hours between creation and appointment)
    const leadTime = (new Date(booking.start_time!).getTime() - new Date(booking.created_at!).getTime()) / 3600000
    totalLeadTime += leadTime

    // Service popularity
    booking.appointment_services?.forEach((service: any) => {
      const key = service.service_id
      const existing = serviceCount.get(key)
      if (existing) {
        existing.count++
      } else {
        serviceCount.set(key, { name: service.service_name, count: 1 })
      }
    })

    // Staff bookings
    if (booking.staff) {
      const key = booking.staff.id
      const existing = staffCount.get(key)
      if (existing) {
        existing.count++
      } else {
        staffCount.set(key, { name: booking.staff.display_name, count: 1 })
      }
    }

    // Peak hours
    const hour = new Date(booking.start_time!).getHours()
    hourCount.set(hour, (hourCount.get(hour) || 0) + 1)
  })

  // Get top services
  const popularServices = Array.from(serviceCount.entries())
    .map(([id, data]) => ({ serviceId: id, serviceName: data.name, count: data.count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // Get top staff
  const topStaff = Array.from(staffCount.entries())
    .map(([id, data]) => ({ staffId: id, staffName: data.name, bookings: data.count }))
    .sort((a, b) => b.bookings - a.bookings)
    .slice(0, 5)

  // Get peak hours
  const peakBookingTimes = Array.from(hourCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([hour]) => `${hour}:00`)

  return {
    totalBookings,
    completedBookings,
    cancelledBookings,
    noShowBookings,
    averageLeadTime: totalBookings > 0 ? totalLeadTime / totalBookings : 0,
    peakBookingTimes,
    popularServices,
    topStaff
  }
}