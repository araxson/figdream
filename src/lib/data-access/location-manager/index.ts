import { createClient } from '@/lib/database/supabase/server'
import { Database } from '@/types/database.types'
import { startOfDay, endOfDay } from 'date-fns'

type UserRole = Database['public']['Tables']['user_roles']['Row']
type SalonLocation = Database['public']['Tables']['salon_locations']['Row']
type Appointment = Database['public']['Tables']['appointments']['Row']
type StaffProfile = Database['public']['Tables']['staff_profiles']['Row']

/**
 * Get location manager's assigned location
 */
export async function getLocationManagerData(userId: string) {
  const supabase = await createClient()
  
  const { data: userRole, error } = await supabase
    .from('user_roles')
    .select(`
      *,
      salon_locations (*)
    `)
    .eq('user_id', userId)
    .eq('role', 'location_manager')
    .eq('is_active', true)
    .single()
    
  if (error || !userRole?.location_id) {
    throw new Error('Location manager has no assigned location')
  }
  
  return {
    locationId: userRole.location_id,
    location: userRole.salon_locations as SalonLocation,
    salonId: userRole.salon_id,
    permissions: userRole.permissions as Record<string, any>
  }
}

/**
 * Get location appointments for a specific date
 */
export async function getLocationAppointments(
  locationId: string,
  date: Date = new Date()
) {
  const supabase = await createClient()
  const start = startOfDay(date).toISOString()
  const end = endOfDay(date).toISOString()
  
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      profiles!appointments_customer_id_fkey (
        id,
        full_name,
        email,
        phone
      ),
      staff_profiles (
        id,
        user_id,
        title,
        profiles:user_id (
          full_name,
          avatar_url
        )
      ),
      appointment_services (
        id,
        price,
        duration_minutes,
        services (
          id,
          name
        )
      )
    `)
    .eq('location_id', locationId)
    .gte('start_time', start)
    .lte('start_time', end)
    .order('start_time', { ascending: true })
  
  if (error) {
    console.error('Error fetching location appointments:', error)
    return []
  }
  
  return data || []
}

/**
 * Get all appointments for the location (with pagination)
 */
export async function getAllLocationAppointments(
  locationId: string,
  page: number = 1,
  limit: number = 50
) {
  const supabase = await createClient()
  const offset = (page - 1) * limit
  
  const { data, error, count } = await supabase
    .from('appointments')
    .select(`
      *,
      profiles!appointments_customer_id_fkey (
        id,
        full_name,
        email,
        phone
      ),
      staff_profiles (
        id,
        user_id,
        title,
        profiles:user_id (
          full_name,
          avatar_url
        )
      ),
      appointment_services (
        id,
        price,
        duration_minutes,
        services (
          id,
          name
        )
      )
    `, { count: 'exact' })
    .eq('location_id', locationId)
    .order('start_time', { ascending: false })
    .range(offset, offset + limit - 1)
  
  if (error) {
    console.error('Error fetching all location appointments:', error)
    return { appointments: [], total: 0 }
  }
  
  return { appointments: data || [], total: count || 0 }
}

/**
 * Get location staff
 */
export async function getLocationStaff(locationId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('staff_profiles')
    .select(`
      *,
      profiles:user_id (
        id,
        full_name,
        email,
        phone,
        avatar_url
      )
    `)
    .eq('location_id', locationId)
    .eq('is_active', true)
    .order('hire_date', { ascending: true })
  
  if (error) {
    console.error('Error fetching location staff:', error)
    return []
  }
  
  return data || []
}

/**
 * Get location metrics for dashboard
 */
export async function getLocationMetrics(locationId: string, date: Date = new Date()) {
  const supabase = await createClient()
  const start = startOfDay(date).toISOString()
  const end = endOfDay(date).toISOString()
  
  // Get today's appointments count
  const { count: appointmentCount } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('location_id', locationId)
    .gte('start_time', start)
    .lte('start_time', end)
    .in('status', ['confirmed', 'in_progress', 'completed'])
  
  // Get active staff count
  const { data: activeStaff } = await supabase
    .from('staff_profiles')
    .select('id')
    .eq('location_id', locationId)
    .eq('is_active', true)
  
  // Get today's revenue
  const { data: revenueData } = await supabase
    .from('appointments')
    .select('total_amount')
    .eq('location_id', locationId)
    .eq('status', 'completed')
    .gte('start_time', start)
    .lte('start_time', end)
  
  const todaysRevenue = revenueData?.reduce((sum, apt) => sum + (apt.total_amount || 0), 0) || 0
  
  // Calculate utilization rate
  const { data: workingStaff } = await supabase
    .from('appointments')
    .select('staff_id')
    .eq('location_id', locationId)
    .gte('start_time', start)
    .lte('start_time', end)
    .not('staff_id', 'is', null)
  
  const uniqueWorkingStaff = new Set(workingStaff?.map(a => a.staff_id) || [])
  const totalStaff = activeStaff?.length || 0
  const utilizationRate = totalStaff > 0 
    ? Math.round((uniqueWorkingStaff.size / totalStaff) * 100)
    : 0
  
  // Get yesterday's comparison data
  const yesterday = new Date(date)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStart = startOfDay(yesterday).toISOString()
  const yesterdayEnd = endOfDay(yesterday).toISOString()
  
  const { count: yesterdayAppointments } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('location_id', locationId)
    .gte('start_time', yesterdayStart)
    .lte('start_time', yesterdayEnd)
    .in('status', ['confirmed', 'in_progress', 'completed'])
  
  return {
    todaysAppointments: appointmentCount || 0,
    appointmentChange: (appointmentCount || 0) - (yesterdayAppointments || 0),
    activeStaff: totalStaff,
    todaysRevenue,
    utilizationRate
  }
}

/**
 * Get location schedule (blocked times and staff availability)
 */
export async function getLocationSchedule(
  locationId: string,
  startDate: Date,
  endDate: Date
) {
  const supabase = await createClient()
  
  const [blockedTimes, timeOff, appointments] = await Promise.all([
    // Get blocked times
    supabase
      .from('blocked_times')
      .select(`
        *,
        staff_profiles (
          id,
          profiles:user_id (
            full_name
          )
        )
      `)
      .eq('location_id', locationId)
      .gte('start_datetime', startDate.toISOString())
      .lte('end_datetime', endDate.toISOString()),
    
    // Get time off requests
    supabase
      .from('time_off')
      .select(`
        *,
        staff_profiles (
          id,
          profiles:user_id (
            full_name
          )
        )
      `)
      .eq('location_id', locationId)
      .eq('status', 'approved')
      .gte('end_date', startDate.toISOString())
      .lte('start_date', endDate.toISOString()),
    
    // Get appointments for the period
    supabase
      .from('appointments')
      .select(`
        id,
        start_time,
        end_time,
        staff_id,
        status
      `)
      .eq('location_id', locationId)
      .gte('start_time', startDate.toISOString())
      .lte('end_time', endDate.toISOString())
  ])
  
  return {
    blockedTimes: blockedTimes.data || [],
    timeOff: timeOff.data || [],
    appointments: appointments.data || []
  }
}

/**
 * Get location settings
 */
export async function getLocationSettings(locationId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('location_id', locationId)
    .single()
  
  if (error && error.code !== 'PGRST116') { // Not found is ok
    console.error('Error fetching location settings:', error)
  }
  
  // Return default settings if none exist
  return data || {
    business_hours: {
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '09:00', close: '18:00', closed: false },
      saturday: { open: '10:00', close: '16:00', closed: false },
      sunday: { open: '10:00', close: '16:00', closed: true }
    },
    booking_rules: {
      advance_booking_days: 30,
      cancellation_hours: 24,
      max_bookings_per_day: 10
    }
  }
}

/**
 * Get location reports data
 */
export async function getLocationReports(
  locationId: string,
  startDate: Date,
  endDate: Date
) {
  const supabase = await createClient()
  
  // Get appointment statistics
  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      status,
      total_amount,
      created_at,
      start_time,
      staff_id,
      appointment_services (
        services (
          id,
          name,
          category_id
        )
      )
    `)
    .eq('location_id', locationId)
    .gte('start_time', startDate.toISOString())
    .lte('start_time', endDate.toISOString())
  
  // Calculate statistics
  const stats = {
    totalAppointments: appointments?.length || 0,
    completedAppointments: appointments?.filter(a => a.status === 'completed').length || 0,
    cancelledAppointments: appointments?.filter(a => a.status === 'cancelled').length || 0,
    noShowAppointments: appointments?.filter(a => a.status === 'no_show').length || 0,
    totalRevenue: appointments
      ?.filter(a => a.status === 'completed')
      .reduce((sum, a) => sum + (a.total_amount || 0), 0) || 0,
    averageRevenue: 0,
    popularServices: [] as any[],
    staffPerformance: [] as any[]
  }
  
  // Calculate average revenue
  if (stats.completedAppointments > 0) {
    stats.averageRevenue = stats.totalRevenue / stats.completedAppointments
  }
  
  // Get popular services
  const serviceCounts = new Map<string, { name: string; count: number }>()
  appointments?.forEach(apt => {
    apt.appointment_services?.forEach((as: any) => {
      if (as.services) {
        const key = as.services.id
        const current = serviceCounts.get(key) || { name: as.services.name, count: 0 }
        current.count++
        serviceCounts.set(key, current)
      }
    })
  })
  
  stats.popularServices = Array.from(serviceCounts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
  
  // Get staff performance
  const staffStats = new Map<string, { appointments: number; revenue: number }>()
  appointments?.forEach(apt => {
    if (apt.staff_id && apt.status === 'completed') {
      const current = staffStats.get(apt.staff_id) || { appointments: 0, revenue: 0 }
      current.appointments++
      current.revenue += apt.total_amount || 0
      staffStats.set(apt.staff_id, current)
    }
  })
  
  // Get staff names
  const staffIds = Array.from(staffStats.keys())
  if (staffIds.length > 0) {
    const { data: staffData } = await supabase
      .from('staff_profiles')
      .select(`
        id,
        profiles:user_id (
          full_name
        )
      `)
      .in('id', staffIds)
    
    stats.staffPerformance = staffData?.map(staff => ({
      name: staff.profiles?.full_name || 'Unknown',
      ...staffStats.get(staff.id) || { appointments: 0, revenue: 0 }
    })) || []
  }
  
  return stats
}

/**
 * Verify location access for the user
 */
export async function verifyLocationAccess(
  userId: string,
  locationId: string
): Promise<boolean> {
  try {
    const data = await getLocationManagerData(userId)
    return data.locationId === locationId
  } catch {
    return false
  }
}