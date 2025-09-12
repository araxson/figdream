import { NextRequest, NextResponse } from 'next/server'
import { verifyApiSession } from '@/lib/api/auth-utils'
import { createAuthClient } from '@/lib/api/auth-utils'

export async function GET(request: NextRequest) {
  try {
    // Verify session and check admin role
    const session = await verifyApiSession(request)
    if (!session || session.user.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Unauthorized', success: false },
        { status: 401 }
      )
    }

    const supabase = await createAuthClient(request)
    
    // Get current date ranges
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
    const startOfWeek = new Date()
    startOfWeek.setDate(startOfWeek.getDate() - 7)
    
    // Fetch all stats in parallel
    const [
      { count: totalUsers },
      { count: totalUsersLastMonth },
      { count: totalSalons },
      { count: totalSalonsLastMonth },
      { data: appointments },
      { data: appointmentsLastMonth },
      { count: totalStaff },
      { count: totalStaffLastMonth },
      { count: activeUsers },
      { count: newSignups },
      { count: pendingIssues }
    ] = await Promise.all([
      // Total users
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      
      // Users last month
      supabase.from('profiles')
        .select('*', { count: 'exact', head: true })
        .lte('created_at', endOfLastMonth.toISOString()),
      
      // Total salons
      supabase.from('salons').select('*', { count: 'exact', head: true }),
      
      // Salons last month
      supabase.from('salons')
        .select('*', { count: 'exact', head: true })
        .lte('created_at', endOfLastMonth.toISOString()),
      
      // Appointments this month
      supabase.from('appointments')
        .select('computed_total_price')
        .gte('created_at', startOfMonth.toISOString()),
      
      // Appointments last month
      supabase.from('appointments')
        .select('computed_total_price')
        .gte('created_at', startOfLastMonth.toISOString())
        .lt('created_at', startOfMonth.toISOString()),
      
      // Total staff
      supabase.from('staff_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true),
      
      // Staff last month
      supabase.from('staff_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .lte('created_at', endOfLastMonth.toISOString()),
      
      // Active users (logged in within 7 days) - using profiles last_sign_in_at
      supabase.from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('last_sign_in_at', startOfWeek.toISOString()),
      
      // New signups this month
      supabase.from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString()),
      
      // Pending issues (recent alerts with high severity)
      supabase.from('recent_alerts')
        .select('*', { count: 'exact', head: true })
        .eq('severity', 'high')
        .eq('is_resolved', false)
    ])
    
    // Calculate revenue
    const totalRevenue = appointments?.reduce((sum, apt) => sum + (apt.computed_total_price || 0), 0) || 0
    const lastMonthRevenue = appointmentsLastMonth?.reduce((sum, apt) => sum + (apt.computed_total_price || 0), 0) || 0
    
    // Calculate percentage changes
    const userChange = totalUsersLastMonth ? ((totalUsers! - totalUsersLastMonth) / totalUsersLastMonth) * 100 : 0
    const salonChange = totalSalonsLastMonth ? ((totalSalons! - totalSalonsLastMonth) / totalSalonsLastMonth) * 100 : 0
    const revenueChange = lastMonthRevenue ? ((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0
    const staffChange = totalStaffLastMonth ? ((totalStaff! - totalStaffLastMonth) / totalStaffLastMonth) * 100 : 0
    
    // Calculate system health (basic metric based on active users vs total)
    const systemHealth = totalUsers ? (activeUsers! / totalUsers) * 100 : 0
    const healthChange = 2.1 // This would need historical data to calculate properly
    
    const stats = {
      totalUsers: totalUsers || 0,
      userChange: Math.round(userChange * 10) / 10,
      totalSalons: totalSalons || 0,
      salonChange: Math.round(salonChange * 10) / 10,
      totalRevenue: Math.round(totalRevenue),
      revenueChange: Math.round(revenueChange * 10) / 10,
      systemHealth: Math.round(systemHealth * 10) / 10,
      healthChange,
      activeUsers: activeUsers || 0,
      newSignups: newSignups || 0,
      pendingIssues: pendingIssues || 0,
      totalAppointments: appointments?.length || 0,
      appointmentChange: 0, // Would need historical data
      totalStaff: totalStaff || 0,
      staffChange: Math.round(staffChange * 10) / 10
    }
    
    return NextResponse.json({
      stats,
      success: true
    })
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats', success: false },
      { status: 500 }
    )
  }
}