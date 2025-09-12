import { createClient } from '@/lib/supabase/server'
import { PlatformAnalyticsClient } from './platform-analytics-client'

async function getAnalyticsData() {
  const supabase = await createClient()
  
  // Get user growth data (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  const { data: users } = await supabase
    .from('profiles')
    .select('created_at, role')
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at')
  
  // Group users by day
  const userGrowth: Record<string, number> = {}
  const usersByRole: Record<string, number> = {}
  
  users?.forEach(user => {
    const date = new Date(user.created_at).toLocaleDateString()
    userGrowth[date] = (userGrowth[date] || 0) + 1
    usersByRole[user.role] = (usersByRole[user.role] || 0) + 1
  })
  
  // Get appointment data
  const { data: appointments } = await supabase
    .from('appointments')
    .select('start_time, status, computed_total_price')
    .gte('start_time', thirtyDaysAgo.toISOString())
  
  // Group appointments by day and calculate revenue
  const appointmentsByDay: Record<string, { count: number; revenue: number }> = {}
  appointments?.forEach(apt => {
    const date = new Date(apt.start_time).toLocaleDateString()
    if (!appointmentsByDay[date]) {
      appointmentsByDay[date] = { count: 0, revenue: 0 }
    }
    appointmentsByDay[date].count++
    if (apt.status === 'completed') {
      appointmentsByDay[date].revenue += apt.computed_total_price || 0
    }
  })
  
  // Get salon performance
  const { data: salons } = await supabase
    .from('salons')
    .select(`
      id,
      name,
      appointments (
        id,
        status,
        computed_total_price
      )
    `)
  
  const salonPerformance = salons?.map(salon => ({
    name: salon.name,
    appointments: salon.appointments?.length || 0,
    revenue: salon.appointments
      ?.filter((a: any) => a.status === 'completed')
      ?.reduce((sum: number, a: any) => sum + (a.computed_total_price || 0), 0) || 0
  })) || []
  
  // Calculate summary stats
  const totalUsers = await supabase.from('profiles').select('id', { count: 'exact', head: true })
  const totalAppointments = await supabase.from('appointments').select('id', { count: 'exact', head: true })
  const { data: revenueData } = await supabase
    .from('appointments')
    .select('computed_total_price')
    .eq('status', 'completed')
  
  const totalRevenue = revenueData?.reduce((sum, apt) => sum + (apt.computed_total_price || 0), 0) || 0
  
  // Format data for charts
  const userGrowthData = Object.entries(userGrowth).map(([date, count]) => ({
    date,
    users: count
  }))
  
  const revenueChartData = Object.entries(appointmentsByDay).map(([date, data]) => ({
    date,
    appointments: data.count,
    revenue: data.revenue
  }))
  
  const roleDistribution = Object.entries(usersByRole).map(([role, count]) => ({
    name: role.replace('_', ' ').toUpperCase(),
    value: count
  }))
  
  return {
    summary: {
      totalUsers: totalUsers.count || 0,
      totalAppointments: totalAppointments.count || 0,
      totalRevenue,
      totalSalons: salons?.length || 0
    },
    userGrowthData,
    revenueData: revenueChartData,
    roleDistribution,
    salonPerformance
  }
}

export async function PlatformAnalyticsServer() {
  const data = await getAnalyticsData()
  
  return <PlatformAnalyticsClient data={data} />
}