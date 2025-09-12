import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const metric = searchParams.get('metric') || 'overview'

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    switch (metric) {
      case 'overview':
        return await getPlatformOverview(supabase)
      case 'users':
        return await getUserMetrics(supabase)
      case 'activity':
        return await getActivityMetrics(supabase)
      case 'growth':
        return await getGrowthMetrics(supabase)
      case 'performance':
        return await getPerformanceMetrics(supabase)
      default:
        return NextResponse.json({ error: 'Invalid metric parameter' }, { status: 400 })
    }
  } catch (error) {
    console.error('Platform analytics API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function getPlatformOverview(supabase: SupabaseClient<Database>) {
  try {
    // Get counts for different entities
    const [customersResult, staffResult, servicesResult, appointmentsResult] = await Promise.all([
      supabase.from('customers').select('id', { count: 'exact', head: true }),
      supabase.from('staff_profiles').select('id', { count: 'exact', head: true }),
      supabase.from('services').select('id', { count: 'exact', head: true }),
      supabase.from('appointments').select('id', { count: 'exact', head: true })
    ])

    // Get recent activity (appointments in last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: recentAppointments, error: recentError } = await supabase
      .from('appointments')
      .select('id, appointment_date, status')
      .gte('appointment_date', thirtyDaysAgo.toISOString())

    if (recentError) throw recentError

    // Calculate activity metrics
    const totalActivity = recentAppointments?.length || 0
    const completedActivity = recentAppointments?.filter((a: { status: string }) => a.status === 'completed').length || 0
    const activityRate = totalActivity > 0 ? (completedActivity / totalActivity) * 100 : 0

    return NextResponse.json({
      success: true,
      data: {
        totalCustomers: customersResult.count || 0,
        totalStaff: staffResult.count || 0,
        totalServices: servicesResult.count || 0,
        totalAppointments: appointmentsResult.count || 0,
        recentActivity: totalActivity,
        activityRate,
        lastUpdated: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Platform overview error:', error)
    return NextResponse.json({ error: 'Failed to fetch platform overview' }, { status: 500 })
  }
}

async function getUserMetrics(supabase: SupabaseClient<Database>) {
  try {
    // Get user registrations by month
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('created_at')
      .order('created_at', { ascending: true })

    if (customersError) throw customersError

    const { data: staff, error: staffError } = await supabase
      .from('staff_profiles')
      .select('created_at')
      .order('created_at', { ascending: true })

    if (staffError) throw staffError

    // Group by month
    const customersByMonth = customers?.reduce((acc: Record<string, number>, customer: { created_at: string }) => {
      const month = new Date(customer.created_at).toISOString().slice(0, 7) // YYYY-MM
      acc[month] = (acc[month] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    const staffByMonth = staff?.reduce((acc: Record<string, number>, member: { created_at: string }) => {
      const month = new Date(member.created_at).toISOString().slice(0, 7)
      acc[month] = (acc[month] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    // Calculate active users (users with recent appointments)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: activeCustomers, error: activeError } = await supabase
      .from('appointments')
      .select('customer_id')
      .gte('appointment_date', thirtyDaysAgo.toISOString())
      .not('customer_id', 'is', null)

    if (activeError) throw activeError

    const uniqueActiveCustomers = new Set(activeCustomers?.map((a: { customer_id: string }) => a.customer_id)).size

    return NextResponse.json({
      success: true,
      data: {
        totalCustomers: customers?.length || 0,
        totalStaff: staff?.length || 0,
        activeCustomers: uniqueActiveCustomers,
        customersByMonth,
        staffByMonth,
        customerRetentionRate: customers?.length > 0 ? (uniqueActiveCustomers / customers.length) * 100 : 0
      }
    })
  } catch (error) {
    console.error('User metrics error:', error)
    return NextResponse.json({ error: 'Failed to fetch user metrics' }, { status: 500 })
  }
}

async function getActivityMetrics(supabase: SupabaseClient<Database>) {
  try {
    // Get appointment activity by day
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('appointment_date, status, computed_total_price')
      .order('appointment_date', { ascending: true })

    if (error) throw error

    // Group by date
    const activityByDate = appointments?.reduce((acc: Record<string, { appointments: number; completed: number; revenue: number }>, appointment: { appointment_date: string; status: string; computed_total_price?: number | null }) => {
      const date = new Date(appointment.appointment_date).toISOString().split('T')[0]
      if (!acc[date]) {
        acc[date] = { appointments: 0, completed: 0, revenue: 0 }
      }
      acc[date].appointments++
      if (appointment.status === 'completed') {
        acc[date].completed++
        acc[date].revenue += appointment.computed_total_price || 0
      }
      return acc
    }, {} as Record<string, { appointments: number; completed: number; revenue: number }>) || {}

    // Calculate peak hours (assuming appointment_date includes time)
    const hourlyActivity = appointments?.reduce((acc: Record<number, number>, appointment: { appointment_date: string }) => {
      const hour = new Date(appointment.appointment_date).getHours()
      acc[hour] = (acc[hour] || 0) + 1
      return acc
    }, {} as Record<number, number>) || {}

    return NextResponse.json({
      success: true,
      data: {
        totalAppointments: appointments?.length || 0,
        activityByDate,
        hourlyActivity,
        averageDailyAppointments: Object.keys(activityByDate).length > 0 
          ? Object.values(activityByDate).reduce((sum, day) => sum + day.appointments, 0) / Object.keys(activityByDate).length 
          : 0
      }
    })
  } catch (error) {
    console.error('Activity metrics error:', error)
    return NextResponse.json({ error: 'Failed to fetch activity metrics' }, { status: 500 })
  }
}

async function getGrowthMetrics(supabase: SupabaseClient<Database>) {
  try {
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    // Get growth data for the last 6 months
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('appointment_date, status, computed_total_price')
      .gte('appointment_date', sixMonthsAgo.toISOString())

    if (appointmentsError) throw appointmentsError

    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('created_at')
      .gte('created_at', sixMonthsAgo.toISOString())

    if (customersError) throw customersError

    // Group by month
    const appointmentsByMonth = appointments?.reduce((acc: Record<string, { count: number; revenue: number }>, appointment: { appointment_date: string; status: string; computed_total_price?: number | null }) => {
      const month = new Date(appointment.appointment_date).toISOString().slice(0, 7)
      if (!acc[month]) {
        acc[month] = { count: 0, revenue: 0 }
      }
      acc[month].count++
      if (appointment.status === 'completed') {
        acc[month].revenue += appointment.computed_total_price || 0
      }
      return acc
    }, {} as Record<string, { count: number; revenue: number }>) || {}

    const customersByMonth = customers?.reduce((acc: Record<string, number>, customer: { created_at: string }) => {
      const month = new Date(customer.created_at).toISOString().slice(0, 7)
      acc[month] = (acc[month] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    // Calculate growth rates
    const months = Object.keys(appointmentsByMonth).sort()
    const growthRates = months.map((month, index) => {
      if (index === 0) return { month, appointmentGrowth: 0, revenueGrowth: 0 }
      
      const currentMonth = appointmentsByMonth[month]
      const previousMonth = appointmentsByMonth[months[index - 1]]
      
      const appointmentGrowth = previousMonth?.count > 0 
        ? ((currentMonth.count - previousMonth.count) / previousMonth.count) * 100 
        : 0
        
      const revenueGrowth = previousMonth?.revenue > 0 
        ? ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100 
        : 0

      return { month, appointmentGrowth, revenueGrowth }
    })

    return NextResponse.json({
      success: true,
      data: {
        appointmentsByMonth,
        customersByMonth,
        growthRates,
        totalGrowth: {
          appointments: months.length > 1 ? growthRates[growthRates.length - 1]?.appointmentGrowth || 0 : 0,
          revenue: months.length > 1 ? growthRates[growthRates.length - 1]?.revenueGrowth || 0 : 0
        }
      }
    })
  } catch (error) {
    console.error('Growth metrics error:', error)
    return NextResponse.json({ error: 'Failed to fetch growth metrics' }, { status: 500 })
  }
}

async function getPerformanceMetrics(supabase: SupabaseClient<Database>) {
  try {
    // Get appointment completion rates
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('status, appointment_date, created_at')

    if (appointmentsError) throw appointmentsError

    const totalAppointments = appointments?.length || 0
    const completedAppointments = appointments?.filter((a: { status: string }) => a.status === 'completed').length || 0
    const cancelledAppointments = appointments?.filter((a: { status: string }) => a.status === 'cancelled').length || 0
    const noShowAppointments = appointments?.filter((a: { status: string }) => a.status === 'no_show').length || 0

    // Calculate average booking time (time between created_at and appointment_date)
    const avgBookingTime = appointments?.reduce((sum: number, appointment: { appointment_date: string; created_at: string }) => {
      const bookingTime = new Date(appointment.appointment_date).getTime() - new Date(appointment.created_at).getTime()
      return sum + bookingTime
    }, 0) / (appointments?.length || 1) / (1000 * 60 * 60 * 24) // Convert to days

    // Get staff utilization
    const { data: staff, error: staffError } = await supabase
      .from('staff_profiles')
      .select(`
        id,
        profiles!inner (
          full_name
        ),
        appointments (
          id,
          status
        )
      `)

    if (staffError) throw staffError

    const staffUtilization = staff?.map((member: { id: string; profiles?: { full_name?: string | null }; appointments?: Array<{ status: string }> }) => {
      const memberAppointments = member.appointments || []
      const completedCount = memberAppointments.filter((a: { status: string }) => a.status === 'completed').length
      return {
        staffId: member.id,
        name: member.profiles?.full_name || 'Unknown',
        totalAppointments: memberAppointments.length,
        completedAppointments: completedCount,
        utilizationRate: memberAppointments.length > 0 ? (completedCount / memberAppointments.length) * 100 : 0
      }
    }) || []

    return NextResponse.json({
      success: true,
      data: {
        completionRate: totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0,
        cancellationRate: totalAppointments > 0 ? (cancelledAppointments / totalAppointments) * 100 : 0,
        noShowRate: totalAppointments > 0 ? (noShowAppointments / totalAppointments) * 100 : 0,
        averageBookingLeadTime: avgBookingTime,
        staffUtilization,
        overallUtilization: staffUtilization.length > 0 
          ? staffUtilization.reduce((sum: number, staff: { utilizationRate: number }) => sum + staff.utilizationRate, 0) / staffUtilization.length 
          : 0
      }
    })
  } catch (error) {
    console.error('Performance metrics error:', error)
    return NextResponse.json({ error: 'Failed to fetch performance metrics' }, { status: 500 })
  }
}