'use server'

import { createClient } from '@/lib/supabase/server'

// Security event types
export type SecurityEventType =
  | 'login_success'
  | 'login_failure'
  | 'logout'
  | 'password_change'
  | 'email_change'
  | 'role_change'
  | 'permission_grant'
  | 'permission_revoke'
  | 'account_creation'
  | 'account_deletion'
  | 'suspicious_activity'
  | 'data_access'
  | 'data_modification'
  | 'failed_authorization'

export type SecurityEvent = {
  event_type: SecurityEventType
  user_id?: string
  ip_address?: string
  user_agent?: string
  resource?: string
  details?: Record<string, any>
  severity?: 'low' | 'medium' | 'high' | 'critical'
}

// Log security event
export async function logSecurityEvent(event: SecurityEvent): Promise<void> {
  try {
    const supabase = await createClient()

    // Get current user if not provided
    let userId = event.user_id
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser()
      userId = user?.id
    }

    // Create audit log entry
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        event_type: event.event_type,
        user_id: userId,
        ip_address: event.ip_address,
        user_agent: event.user_agent,
        resource: event.resource,
        details: event.details || {},
        severity: event.severity || 'low',
        created_at: new Date().toISOString(),
      })

    if (error) {
      console.error('[Security Audit] Failed to log event:', error)
    }
  } catch (error) {
    console.error('[Security Audit] Error logging security event:', error)
  }
}

// Log authentication events
export async function logAuthenticationAttempt(
  email: string,
  success: boolean,
  ipAddress?: string,
  userAgent?: string,
  failureReason?: string
): Promise<void> {
  const event: SecurityEvent = {
    event_type: success ? 'login_success' : 'login_failure',
    ip_address: ipAddress,
    user_agent: userAgent,
    resource: 'authentication',
    details: {
      email,
      ...(failureReason && { failure_reason: failureReason }),
    },
    severity: success ? 'low' : 'medium',
  }

  await logSecurityEvent(event)
}

// Log logout events
export async function logLogout(
  userId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  const event: SecurityEvent = {
    event_type: 'logout',
    user_id: userId,
    ip_address: ipAddress,
    user_agent: userAgent,
    resource: 'authentication',
    severity: 'low',
  }

  await logSecurityEvent(event)
}

// Log password changes
export async function logPasswordChange(
  userId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  const event: SecurityEvent = {
    event_type: 'password_change',
    user_id: userId,
    ip_address: ipAddress,
    user_agent: userAgent,
    resource: 'user_account',
    severity: 'medium',
  }

  await logSecurityEvent(event)
}

// Log role changes
export async function logRoleChange(
  targetUserId: string,
  oldRole: string,
  newRole: string,
  changedBy?: string,
  ipAddress?: string
): Promise<void> {
  const event: SecurityEvent = {
    event_type: 'role_change',
    user_id: changedBy,
    ip_address: ipAddress,
    resource: 'user_roles',
    details: {
      target_user_id: targetUserId,
      old_role: oldRole,
      new_role: newRole,
    },
    severity: 'high',
  }

  await logSecurityEvent(event)
}

// Log data access
export async function logDataAccess(
  resource: string,
  action: 'read' | 'write' | 'delete',
  resourceId?: string,
  userId?: string,
  ipAddress?: string
): Promise<void> {
  const event: SecurityEvent = {
    event_type: 'data_access',
    user_id: userId,
    ip_address: ipAddress,
    resource,
    details: {
      action,
      resource_id: resourceId,
    },
    severity: action === 'delete' ? 'high' : 'low',
  }

  await logSecurityEvent(event)
}

// Log failed authorization attempts
export async function logFailedAuthorization(
  resource: string,
  requiredPermission: string,
  userId?: string,
  ipAddress?: string
): Promise<void> {
  const event: SecurityEvent = {
    event_type: 'failed_authorization',
    user_id: userId,
    ip_address: ipAddress,
    resource,
    details: {
      required_permission: requiredPermission,
    },
    severity: 'medium',
  }

  await logSecurityEvent(event)
}

// Log suspicious activity
export async function logSuspiciousActivity(
  description: string,
  details: Record<string, any>,
  userId?: string,
  ipAddress?: string,
  severity: 'medium' | 'high' | 'critical' = 'medium'
): Promise<void> {
  const event: SecurityEvent = {
    event_type: 'suspicious_activity',
    user_id: userId,
    ip_address: ipAddress,
    resource: 'security',
    details: {
      description,
      ...details,
    },
    severity,
  }

  await logSecurityEvent(event)
}

// Get security events for a user
export async function getUserSecurityEvents(
  userId: string,
  limit = 100,
  offset = 0
): Promise<any[]> {
  try {
    const supabase = await createClient()

    // MANDATORY: Verify auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const { data: events, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return events || []
  } catch (error) {
    console.error('[Security Audit] Error getting user security events:', error)
    return []
  }
}

// Get recent security events
export async function getRecentSecurityEvents(
  limit = 50,
  severity?: 'low' | 'medium' | 'high' | 'critical'
): Promise<any[]> {
  try {
    const supabase = await createClient()

    // MANDATORY: Verify auth and admin role
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (userRole?.role !== 'admin') {
      throw new Error("Admin access required")
    }

    let query = supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (severity) {
      query = query.eq('severity', severity)
    }

    const { data: events, error } = await query

    if (error) throw error

    return events || []
  } catch (error) {
    console.error('[Security Audit] Error getting recent security events:', error)
    return []
  }
}

// Check for suspicious patterns
export async function checkSuspiciousPatterns(userId: string): Promise<{
  suspicious: boolean
  patterns: string[]
  details: Record<string, any>
}> {
  try {
    const supabase = await createClient()

    // Get recent events for the user
    const { data: events, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
      .order('created_at', { ascending: false })

    if (error) throw error

    if (!events || events.length === 0) {
      return { suspicious: false, patterns: [], details: {} }
    }

    const patterns: string[] = []
    const details: Record<string, any> = {}

    // Check for multiple failed login attempts
    const failedLogins = events.filter(e => e.event_type === 'login_failure')
    if (failedLogins.length >= 5) {
      patterns.push('multiple_failed_logins')
      details.failed_login_count = failedLogins.length
    }

    // Check for logins from multiple IP addresses
    const uniqueIPs = new Set(events.map(e => e.ip_address).filter(Boolean))
    if (uniqueIPs.size >= 3) {
      patterns.push('multiple_ip_addresses')
      details.unique_ip_count = uniqueIPs.size
      details.ip_addresses = Array.from(uniqueIPs)
    }

    // Check for rapid succession of events
    const rapidEvents = events.filter((event, index) => {
      if (index === 0) return false
      const timeDiff = new Date(events[index - 1].created_at).getTime() - new Date(event.created_at).getTime()
      return timeDiff < 1000 // Less than 1 second apart
    })
    if (rapidEvents.length >= 3) {
      patterns.push('rapid_succession_events')
      details.rapid_event_count = rapidEvents.length
    }

    // Check for unusual access patterns
    const dataAccess = events.filter(e => e.event_type === 'data_access')
    if (dataAccess.length >= 20) {
      patterns.push('excessive_data_access')
      details.data_access_count = dataAccess.length
    }

    return {
      suspicious: patterns.length > 0,
      patterns,
      details,
    }
  } catch (error) {
    console.error('[Security Audit] Error checking suspicious patterns:', error)
    return { suspicious: false, patterns: [], details: {} }
  }
}

// Generate security report
export async function generateSecurityReport(
  startDate: string,
  endDate: string
): Promise<any> {
  try {
    const supabase = await createClient()

    // MANDATORY: Verify auth and admin role
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (userRole?.role !== 'admin') {
      throw new Error("Admin access required")
    }

    const { data: events, error } = await supabase
      .from('audit_logs')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false })

    if (error) throw error

    if (!events) return { events: [], summary: {} }

    // Generate summary statistics
    const summary = {
      total_events: events.length,
      events_by_type: events.reduce((acc, event) => {
        acc[event.event_type] = (acc[event.event_type] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      events_by_severity: events.reduce((acc, event) => {
        acc[event.severity] = (acc[event.severity] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      unique_users: new Set(events.map(e => e.user_id).filter(Boolean)).size,
      unique_ips: new Set(events.map(e => e.ip_address).filter(Boolean)).size,
      suspicious_events: events.filter(e => e.event_type === 'suspicious_activity').length,
      failed_logins: events.filter(e => e.event_type === 'login_failure').length,
    }

    return {
      period: { start_date: startDate, end_date: endDate },
      summary,
      events: events.slice(0, 100), // Limit to first 100 events
      generated_at: new Date().toISOString(),
      generated_by: user.id,
    }
  } catch (error) {
    console.error('[Security Audit] Error generating security report:', error)
    throw new Error('Failed to generate security report')
  }
}