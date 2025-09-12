import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { verifySession } from './auth'

export interface AdminDashboardStats {
  totalUsers: number
  userChange: number
  totalSalons: number
  salonChange: number
  totalRevenue: number
  revenueChange: number
  systemHealth: number
  healthChange: number
  activeUsers: number
  newSignups: number
  pendingIssues: number
  totalAppointments: number
  appointmentChange: number
  totalStaff: number
  staffChange: number
}

export interface SystemStatus {
  name: string
  status: 'operational' | 'degraded' | 'down'
  uptime: number
  icon?: any
  database?: 'healthy' | 'warning' | 'error'
  api?: 'healthy' | 'warning' | 'error'
  storage?: 'healthy' | 'warning' | 'error'
  auth?: 'healthy' | 'warning' | 'error'
  lastChecked?: string
}

export interface RecentActivity {
  id: string
  type: 'user_signup' | 'salon_created' | 'appointment_booked' | 'payment_received' | 'issue_reported' | 'create' | 'update' | 'delete' | 'login' | 'alert' | 'system'
  title: string
  description: string
  timestamp: string
  userId?: string
  metadata?: Record<string, unknown>
  user?: string
  action?: string
  message?: string
  time?: string
  icon?: any
}

export const getAdminDashboardStats = cache(async (): Promise<AdminDashboardStats> => {
  const session = await verifySession()
  if (!session || session.user.role !== 'super_admin') {
    return {
      totalUsers: 0,
      userChange: 0,
      totalSalons: 0,
      salonChange: 0,
      totalRevenue: 0,
      revenueChange: 0,
      systemHealth: 0,
      healthChange: 0,
      activeUsers: 0,
      newSignups: 0,
      pendingIssues: 0,
      totalAppointments: 0,
      appointmentChange: 0,
      totalStaff: 0,
      staffChange: 0
    }
  }

  const supabase = await createClient()
  
  // Get current date ranges
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
  const startOfWeek = new Date(now.setDate(now.getDate() - 7))
  
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
    
    // Appointments this month (for revenue)
    supabase.from('appointments')
      .select('computed_total_price')
      .gte('created_at', startOfMonth.toISOString())
      .eq('status', 'completed'),
    
    // Appointments last month (for revenue comparison)
    supabase.from('appointments')
      .select('computed_total_price')
      .gte('created_at', startOfLastMonth.toISOString())
      .lte('created_at', endOfLastMonth.toISOString())
      .eq('status', 'completed'),
    
    // Total staff
    supabase.from('staff_profiles').select('*', { count: 'exact', head: true }),
    
    // Staff last month
    supabase.from('staff_profiles')
      .select('*', { count: 'exact', head: true })
      .lte('created_at', endOfLastMonth.toISOString()),
    
    // Active users (logged in within last 7 days)
    supabase.from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('last_sign_in_at', startOfWeek.toISOString()),
    
    // New signups this month
    supabase.from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString()),
    
    // Pending issues (from alert_history)
    supabase.from('alert_history')
      .select('*', { count: 'exact', head: true })
      .is('resolved_at', null)
  ])
  
  // Calculate revenue
  const totalRevenue = appointments?.reduce((sum, apt) => sum + (apt.computed_total_price || 0), 0) || 0
  const lastMonthRevenue = appointmentsLastMonth?.reduce((sum, apt) => sum + (apt.computed_total_price || 0), 0) || 0
  
  // Calculate percentage changes
  const userChange = totalUsersLastMonth && totalUsersLastMonth > 0 
    ? ((totalUsers! - totalUsersLastMonth) / totalUsersLastMonth) * 100 
    : 0
    
  const salonChange = totalSalonsLastMonth && totalSalonsLastMonth > 0
    ? ((totalSalons! - totalSalonsLastMonth) / totalSalonsLastMonth) * 100
    : 0
    
  const revenueChange = lastMonthRevenue > 0
    ? ((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
    : 0
    
  const staffChange = totalStaffLastMonth && totalStaffLastMonth > 0
    ? ((totalStaff! - totalStaffLastMonth) / totalStaffLastMonth) * 100
    : 0
  
  // Calculate system health based on real metrics
  // Count recent errors and calculate uptime
  const { data: recentErrors } = await supabase
    .from('error_logs')
    .select('id', { count: 'exact' })
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
  
  const errorCount = recentErrors?.length || 0
  const systemHealth = Math.max(0, 100 - (errorCount * 2)) // Deduct 2% per error
  
  // Calculate health change from previous period
  const { data: previousErrors } = await supabase
    .from('error_logs')
    .select('id', { count: 'exact' })
    .gte('created_at', new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString())
    .lt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
  
  const previousErrorCount = previousErrors?.length || 0
  const previousHealth = Math.max(0, 100 - (previousErrorCount * 2))
  const healthChange = systemHealth - previousHealth
  
  return {
    totalUsers: totalUsers || 0,
    userChange: Math.round(userChange * 10) / 10,
    totalSalons: totalSalons || 0,
    salonChange: Math.round(salonChange * 10) / 10,
    totalRevenue,
    revenueChange: Math.round(revenueChange * 10) / 10,
    systemHealth,
    healthChange,
    activeUsers: activeUsers || 0,
    newSignups: newSignups || 0,
    pendingIssues: pendingIssues || 0,
    totalAppointments: appointments?.length || 0,
    appointmentChange: 0, // Would calculate from historical data
    totalStaff: totalStaff || 0,
    staffChange: Math.round(staffChange * 10) / 10
  }
})

export const getSystemStatus = cache(async (): Promise<SystemStatus[]> => {
  const session = await verifySession()
  if (!session || session.user.role !== 'super_admin') {
    return []
  }
  
  const supabase = await createClient()
  
  // Check database health by querying system health metrics
  const { data: dbHealth } = await supabase
    .from('system_health_metrics')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  
  // Check for recent errors to determine service status
  const { data: recentErrors } = await supabase
    .from('error_logs')
    .select('error_type, count')
    .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
  
  const errorsByType = recentErrors?.reduce((acc, error) => {
    acc[error.error_type] = (acc[error.error_type] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}
  
  return [
    {
      name: "Database",
      status: errorsByType['database'] > 5 ? "degraded" : "operational",
      uptime: dbHealth?.database_uptime || 99.9
    },
    {
      name: "API Services",
      status: errorsByType['api'] > 10 ? "degraded" : "operational",
      uptime: dbHealth?.api_uptime || 99.5
    },
    {
      name: "Authentication",
      status: errorsByType['auth'] > 3 ? "degraded" : "operational",
      uptime: dbHealth?.auth_uptime || 99.99
    },
    {
      name: "Payment Gateway",
      status: errorsByType['payment'] > 2 ? "degraded" : "operational",
      uptime: dbHealth?.payment_uptime || 99.9
    }
  ]
})

export const getRecentActivity = cache(async (): Promise<RecentActivity[]> => {
  const session = await verifySession()
  if (!session || session.user.role !== 'super_admin') {
    return []
  }
  
  const supabase = await createClient()
  
  // Fetch recent audit logs
  const { data: auditLogs } = await supabase
    .from('audit_logs')
    .select(`
      *,
      user:profiles!audit_logs_user_id_fkey(email, full_name)
    `)
    .order('created_at', { ascending: false })
    .limit(10)
  
  if (!auditLogs) return []
  
  return auditLogs.map((log) => ({
    id: log.id,
    type: log.action === 'INSERT' ? 'create' : 
          log.action === 'UPDATE' ? 'update' : 
          log.action === 'DELETE' ? 'delete' : 
          'system' as any,
    title: `${log.action} ${log.entity_type}`,
    description: `${log.action} operation on ${log.entity_type}`,
    timestamp: log.created_at,
    user: log.user?.email || 'System',
    action: log.action,
    message: `${log.action} ${log.entity_type}${log.entity_id ? ` #${log.entity_id}` : ''}`,
    time: log.created_at,
    userId: log.user_id,
    metadata: {
      entityType: log.entity_type,
      entityId: log.entity_id,
      oldData: log.old_data,
      newData: log.new_data
    }
  }))
})

// Keep the old function signature for compatibility
export const getSystemStatusOld = cache(async (): Promise<SystemStatus> => {
  const session = await verifySession()
  if (!session || session.user.role !== 'super_admin') {
    return {
      name: 'System',
      status: 'operational',
      uptime: 100,
      database: 'healthy',
      api: 'healthy',
      storage: 'healthy',
      auth: 'healthy',
      uptime: 0,
      lastChecked: new Date().toISOString()
    }
  }

  const supabase = await createClient()
  
  // Check database health
  let databaseStatus: 'healthy' | 'warning' | 'error' = 'healthy'
  try {
    const { error } = await supabase.from('profiles').select('id').limit(1)
    if (error) databaseStatus = 'error'
  } catch {
    databaseStatus = 'error'
  }
  
  // In a real app, you'd have proper health check endpoints
  return {
    database: databaseStatus,
    api: 'healthy',
    storage: 'healthy',
    auth: 'healthy',
    uptime: 99.9,
    lastChecked: new Date().toISOString()
  }
})

export const getSecurityOverview = cache(async () => {
  const session = await verifySession()
  if (!session || session.user.role !== 'super_admin') {
    return {
      failedLoginAttempts: 0,
      suspiciousActivities: 0,
      blockedIPs: 0,
      activeThreats: 0
    }
  }
  
  const supabase = await createClient()
  
  // Get failed login attempts from auth_otp_attempts table
  const { data: failedLogins } = await supabase
    .from('auth_otp_attempts')
    .select('id', { count: 'exact' })
    .eq('success', false)
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
  
  // Get suspicious activities from audit_logs
  const { data: suspiciousLogs } = await supabase
    .from('audit_logs')
    .select('id', { count: 'exact' })
    .in('action', ['unauthorized_access', 'suspicious_activity', 'rate_limit_exceeded'])
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
  
  // Get blocked IPs from rate_limits table
  const { data: blockedIPs } = await supabase
    .from('rate_limits')
    .select('id', { count: 'exact' })
    .eq('is_blocked', true)
  
  // Check for active threats in error_logs
  const { data: threats } = await supabase
    .from('error_logs')
    .select('id', { count: 'exact' })
    .in('error_type', ['security_breach', 'injection_attempt', 'xss_attempt'])
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
  
  return {
    failedLoginAttempts: failedLogins?.length || 0,
    suspiciousActivities: suspiciousLogs?.length || 0,
    blockedIPs: blockedIPs?.length || 0,
    activeThreats: threats?.length || 0
  }
})