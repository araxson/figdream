import { createClient } from '@/lib/supabase/server'
import { startOfDay, startOfMonth } from 'date-fns'

export async function getAdminStats() {
  const supabase = await createClient()
  const today = startOfDay(new Date())
  const monthStart = startOfMonth(new Date())

  const [
    { count: todayAppointments },
    { count: totalSalons },
    { count: totalStaff },
    { count: totalCustomers }
  ] = await Promise.all([
    supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .gte('start_time', today.toISOString())
      .lt('start_time', new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString()),
    supabase
      .from('salons')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true),
    supabase
      .from('staff_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true),
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'customer')
  ])

  const { data: monthlyRevenue } = await supabase
    .from('appointments')
    .select('computed_total_price')
    .gte('start_time', monthStart.toISOString())
    .eq('status', 'completed')

  const revenue = monthlyRevenue?.reduce((sum, apt) => sum + (apt.computed_total_price || 0), 0) || 0

  return {
    todayAppointments: todayAppointments || 0,
    totalSalons: totalSalons || 0,
    totalStaff: totalStaff || 0,
    totalCustomers: totalCustomers || 0,
    monthlyRevenue: revenue
  }
}

export async function getTodayAppointments() {
  const supabase = await createClient()
  const today = startOfDay(new Date())

  const { data } = await supabase
    .from('appointments')
    .select(`
      id,
      start_time,
      status,
      customer:profiles!appointments_customer_id_fkey (first_name, last_name),
      appointment_services (services (name)),
      staff:staff_profiles!appointments_staff_id_fkey (user:profiles!staff_profiles_user_id_fkey (first_name, last_name))
    `)
    .gte('start_time', today.toISOString())
    .lt('start_time', new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString())
    .order('start_time')
    .limit(5)

  return (data || []).map(apt => {
    const customer = Array.isArray(apt.customer) ? apt.customer[0] : apt.customer
    const staff = Array.isArray(apt.staff) ? apt.staff[0] : apt.staff
    const staffUser = staff?.user ? (Array.isArray(staff.user) ? staff.user[0] : staff.user) : null
    
    return {
      id: apt.id,
      time: new Date(apt.start_time).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      customer: customer 
        ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Unknown'
        : 'Unknown',
      service: apt.appointment_services?.[0]?.services?.name || 'Unknown Service',
      staff: staffUser 
        ? `${staffUser.first_name || ''} ${staffUser.last_name || ''}`.trim() || 'Unknown'
        : 'Unknown',
      status: apt.status
    }
  })
}

export async function getRecentReviews() {
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('reviews')
    .select(`
      id,
      rating,
      comment,
      created_at,
      customer:profiles!reviews_customer_id_fkey (first_name, last_name)
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  return (data || []).map(review => {
    const customer = Array.isArray(review.customer) ? review.customer[0] : review.customer
    
    return {
      id: review.id,
      customer_name: customer 
        ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Anonymous'
        : 'Anonymous',
      rating: review.rating,
      comment: review.comment || 'No comment provided',
      created_at: review.created_at
    }
  })
}

export async function getSalonOverview() {
  const supabase = await createClient()
  const today = startOfDay(new Date())
  
  const { data: salons } = await supabase
    .from('salons')
    .select('id, name, is_active')
    .limit(5)

  if (!salons) return []

  const salonData = await Promise.all(
    salons.map(async (salon) => {
      const { count } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('salon_id', salon.id)
        .gte('start_time', today.toISOString())
        .lt('start_time', new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString())

      return {
        id: salon.id,
        name: salon.name,
        is_active: salon.is_active,
        appointments_today: count || 0
      }
    })
  )

  return salonData
}

interface Activity {
  id: string
  type: string
  description: string
  user: string
  created_at: string
}

export async function getRecentActivity(): Promise<Activity[]> {
  // For now, return empty array since we don't have an activity log table
  // This would typically fetch from an audit_logs or activity_logs table
  return []
}

export async function getStaffStats() {
  // Placeholder for staff stats - to be implemented
  return {
    todayAppointments: 0,
    completedToday: 0,
    upcomingToday: 0,
    weeklyEarnings: 0,
    monthlyEarnings: 0,
    averageRating: 0,
    totalReviews: 0,
    regularClients: 0
  }
}