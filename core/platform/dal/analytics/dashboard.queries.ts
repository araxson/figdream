// Dashboard Data Access Layer
import { createClient } from '@/lib/supabase/server'
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns'
import type { DashboardMetrics, RevenueChartData, TopService, StaffPerformance } from '../types'

export async function getDashboardMetrics(salonId: string): Promise<DashboardMetrics | null> {
  const supabase = await createClient()

  // Auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  try {
    const now = new Date()
    const currentMonthStart = startOfMonth(now)
    const currentMonthEnd = endOfMonth(now)
    const lastMonthStart = startOfMonth(subMonths(now, 1))
    const lastMonthEnd = endOfMonth(subMonths(now, 1))

    // Get salon details
    const { data: salon } = await supabase
      .from('salons')
      .select('total_revenue, total_bookings, rating_average, employee_count')
      .eq('id', salonId)
      .single()

    if (!salon) return null

    // Get current month revenue
    const { data: currentRevenue } = await supabase
      .from('revenue_analytics')
      .select('total_revenue')
      .eq('salon_id', salonId)
      .gte('date', currentMonthStart.toISOString())
      .lte('date', currentMonthEnd.toISOString())

    // Get last month revenue for growth calculation
    const { data: lastRevenue } = await supabase
      .from('revenue_analytics')
      .select('total_revenue')
      .eq('salon_id', salonId)
      .gte('date', lastMonthStart.toISOString())
      .lte('date', lastMonthEnd.toISOString())

    // Get appointment counts
    const { count: currentAppointments } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('salon_id', salonId)
      .gte('start_time', currentMonthStart.toISOString())
      .lte('start_time', currentMonthEnd.toISOString())

    const { count: lastAppointments } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('salon_id', salonId)
      .gte('start_time', lastMonthStart.toISOString())
      .lte('start_time', lastMonthEnd.toISOString())

    // Get unique customers
    const { data: customers } = await supabase
      .from('appointments')
      .select('customer_id')
      .eq('salon_id', salonId)
      .gte('start_time', currentMonthStart.toISOString())

    const uniqueCustomers = new Set(customers?.map(c => c.customer_id) || []).size

    // Calculate current totals
    const currentRevenueTotal = currentRevenue?.reduce((sum, r) => sum + Number(r.total_revenue || 0), 0) || 0
    const lastRevenueTotal = lastRevenue?.reduce((sum, r) => sum + Number(r.total_revenue || 0), 0) || 0

    // Calculate growth percentages
    const revenueGrowth = lastRevenueTotal > 0
      ? ((currentRevenueTotal - lastRevenueTotal) / lastRevenueTotal) * 100
      : 0

    const appointmentGrowth = (lastAppointments || 0) > 0
      ? (((currentAppointments || 0) - (lastAppointments || 0)) / (lastAppointments || 0)) * 100
      : 0

    return {
      totalRevenue: currentRevenueTotal,
      totalAppointments: currentAppointments || 0,
      totalCustomers: uniqueCustomers,
      totalStaff: salon.employee_count || 0,
      averageRating: Number(salon.rating_average) || 0,
      revenueGrowth,
      appointmentGrowth,
      customerGrowth: 0 // Calculate based on historical data
    }
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error)
    return null
  }
}

export async function getRevenueChart(salonId: string, days = 30): Promise<RevenueChartData[]> {
  const supabase = await createClient()

  // Auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data } = await supabase
    .from('revenue_analytics')
    .select('date, total_revenue, transaction_count')
    .eq('salon_id', salonId)
    .gte('date', startDate.toISOString())
    .lte('date', endDate.toISOString())
    .order('date', { ascending: true })

  return data?.map(item => ({
    date: format(new Date(item.date), 'MMM dd'),
    revenue: Number(item.total_revenue) || 0,
    appointments: item.transaction_count || 0
  })) || []
}

export async function getTopServices(salonId: string, limit = 5): Promise<TopService[]> {
  const supabase = await createClient()

  // Auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data } = await supabase
    .from('services')
    .select(`
      id,
      name,
      appointment_services(
        count,
        price
      )
    `)
    .eq('salon_id', salonId)
    .order('appointment_services.count', { ascending: false })
    .limit(limit)

  return data?.map(service => ({
    id: service.id || '',
    name: service.name || '',
    bookings: 0, // Calculate from appointment_services
    revenue: 0 // Calculate from appointment_services
  })) || []
}

export async function getStaffPerformance(salonId: string): Promise<StaffPerformance[]> {
  const supabase = await createClient()

  // Auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data } = await supabase
    .from('staff_profiles')
    .select(`
      id,
      user_id,
      rating_average,
      total_appointments,
      total_revenue,
      profiles!inner(
        full_name
      )
    `)
    .eq('salon_id', salonId)
    .eq('is_active', true)
    .order('total_revenue', { ascending: false })

  return data?.map(staff => ({
    id: staff.id || '',
    name: staff.profiles?.full_name || 'Unknown',
    appointments: staff.total_appointments || 0,
    revenue: Number(staff.total_revenue) || 0,
    rating: Number(staff.rating_average) || 0
  })) || []
}

export async function getTodayAppointments(salonId: string) {
  const supabase = await createClient()

  // Auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const { data } = await supabase
    .from('appointments')
    .select(`
      id,
      start_time,
      end_time,
      status,
      customer:profiles!appointments_customer_id_fkey(
        id,
        full_name,
        email
      ),
      staff:staff_profiles!appointments_staff_id_fkey(
        id,
        profiles!inner(
          full_name
        )
      ),
      appointment_services(
        services(
          name
        )
      )
    `)
    .eq('salon_id', salonId)
    .gte('start_time', today.toISOString())
    .lt('start_time', tomorrow.toISOString())
    .order('start_time', { ascending: true })

  return data || []
}

export async function getRecentActivity(salonId: string, limit = 10) {
  const supabase = await createClient()

  // Auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data } = await supabase
    .from('events')
    .select('*')
    .eq('salon_id', salonId)
    .order('created_at', { ascending: false })
    .limit(limit)

  return data || []
}