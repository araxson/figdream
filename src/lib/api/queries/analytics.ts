import { createClient } from '@/lib/supabase/server'
import { formatTime } from '@/lib/utils/format'

export async function getStaffStats() {
  const supabase = await createClient()
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // Get staff profile
    const { data: staffProfile } = await supabase
      .from('staff_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!staffProfile) return null

    const today = new Date().toISOString().split('T')[0]
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

    // Get today's appointments
    const { data: todayAppointments } = await supabase
      .from('appointments')
      .select('*')
      .eq('staff_id', staffProfile.id)
      .eq('appointment_date', today)
      .neq('status', 'cancelled')
      .order('start_time')

    // Get next appointment
    const now = new Date()
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    
    const nextAppointment = todayAppointments?.find(apt => apt.start_time > currentTime)
    const nextAppointmentTime = nextAppointment ? formatTime(nextAppointment.start_time) : null

    // Calculate hours today
    let totalMinutes = 0
    todayAppointments?.forEach(apt => {
      const [startH, startM] = apt.start_time.split(':').map(Number)
      const [endH, endM] = apt.end_time.split(':').map(Number)
      const minutes = (endH * 60 + endM) - (startH * 60 + startM)
      totalMinutes += minutes
    })
    const hoursToday = `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`

    // Get tips for today
    const { data: todayTips } = await supabase
      .from('staff_earnings')
      .select('tip_amount')
      .eq('staff_id', staffProfile.id)
      .eq('service_date', today)

    const tipsToday = todayTips?.reduce((sum, earning) => sum + (earning.tip_amount || 0), 0) || 0

    // Get tips for this month
    const { data: monthTips } = await supabase
      .from('staff_earnings')
      .select('tip_amount')
      .eq('staff_id', staffProfile.id)
      .gte('service_date', startOfMonth)

    const tipsThisMonth = monthTips?.reduce((sum, earning) => sum + (earning.tip_amount || 0), 0) || 0

    return {
      appointmentsToday: todayAppointments?.length || 0,
      nextAppointmentTime,
      hoursToday,
      breakTime: '1h', // Default break time
      tipsToday,
      tipsThisMonth
    }
  } catch (error) {
    console.error('Error fetching staff stats:', error)
    return null
  }
}