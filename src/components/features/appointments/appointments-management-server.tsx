import { createClient } from '@/lib/supabase/server'
import { AppointmentsManagementClient } from './appointments-management-client'

async function getAppointmentsData() {
  const supabase = await createClient()
  const today = new Date()
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay())
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  
  // Get appointments with full details
  const { data: appointments, error: appointmentsError } = await supabase
    .from('appointments')
    .select(`
      *,
      customer:profiles!appointments_customer_id_fkey(id, full_name, email, phone),
      staff:staff_profiles!appointments_staff_id_fkey(id, user_id, bio, specialties),
      service:services!appointments_service_id_fkey(id, name, duration_minutes, price),
      salon:salons!appointments_salon_id_fkey(id, name, address)
    `)
    .order('start_time', { ascending: false })
    .limit(50)
  
  if (appointmentsError) {
    console.error('Error fetching appointments:', appointmentsError)
  }
  
  // Get counts by status
  const { count: totalCount } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
  
  const { count: scheduledCount } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'scheduled')
  
  const { count: completedCount } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'completed')
  
  const { count: cancelledCount } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'cancelled')
  
  // Get today's appointments count
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date()
  todayEnd.setHours(23, 59, 59, 999)
  
  const { count: todayCount } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .gte('start_time', todayStart.toISOString())
    .lte('start_time', todayEnd.toISOString())
  
  // Get this week's appointments count
  const { count: weekCount } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .gte('start_time', startOfWeek.toISOString())
    .lte('start_time', endOfWeek.toISOString())
  
  // Get salons for filter
  const { data: salons } = await supabase
    .from('salons')
    .select('id, name')
    .order('name')
  
  // Get services for filter
  const { data: services } = await supabase
    .from('services')
    .select('id, name')
    .order('name')
  
  return {
    appointments: appointments || [],
    counts: {
      total: totalCount || 0,
      scheduled: scheduledCount || 0,
      completed: completedCount || 0,
      cancelled: cancelledCount || 0,
      today: todayCount || 0,
      week: weekCount || 0
    },
    salons: salons || [],
    services: services || []
  }
}

export async function AppointmentsManagementServer() {
  const data = await getAppointmentsData()
  
  return <AppointmentsManagementClient {...data} />
}