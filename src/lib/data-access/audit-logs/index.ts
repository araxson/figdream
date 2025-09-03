'use server'
import { createClient } from '@/lib/database/supabase/server'
export interface AuditLogFilters {
  userId?: string
  salonId?: string
  action?: string
  entity?: string
  startDate?: string
  endDate?: string
  limit?: number
}
// Get audit logs with filters
export async function getAuditLogs(filters: AuditLogFilters = {}) {
  const supabase = await createClient()
  let query = supabase
    .from('audit_logs')
    .select(`
      *,
      profiles (
        id,
        email,
        full_name
      )
    `)
    .order('created_at', { ascending: false })
  if (filters.userId) {
    query = query.eq('user_id', filters.userId)
  }
  if (filters.salonId) {
    query = query.eq('salon_id', filters.salonId)
  }
  if (filters.action) {
    query = query.eq('action', filters.action)
  }
  if (filters.entity) {
    query = query.eq('entity_type', filters.entity)
  }
  if (filters.startDate && filters.endDate) {
    query = query
      .gte('created_at', filters.startDate)
      .lte('created_at', filters.endDate)
  }
  if (filters.limit) {
    query = query.limit(filters.limit)
  }
  const { data, error } = await query
  if (error) {
    throw new Error('Failed to fetch audit logs')
  }
  return data
}
// Log an audit event
export async function createAuditLog(params: {
  userId: string
  salonId?: string
  action: string
  entityType: string
  entityId?: string
  changes?: Record<string, unknown>
  metadata?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
}) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('audit_logs')
    .insert({
      user_id: params.userId,
      salon_id: params.salonId,
      action: params.action,
      entity_type: params.entityType,
      entity_id: params.entityId,
      changes: params.changes,
      metadata: params.metadata,
      ip_address: params.ipAddress,
      user_agent: params.userAgent,
      created_at: new Date().toISOString(),
    })
    .select()
    .single()
  if (error) {
    // Don't throw - audit logging should not break the app
    return null
  }
  return data
}
// Get audit log statistics
export async function getAuditStats(salonId?: string, days: number = 30) {
  const supabase = await createClient()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  let query = supabase
    .from('audit_logs')
    .select('action, entity_type, created_at')
    .gte('created_at', startDate.toISOString())
  if (salonId) {
    query = query.eq('salon_id', salonId)
  }
  const { data, error } = await query
  if (error) {
    throw new Error('Failed to fetch audit statistics')
  }
  // Calculate statistics
  const stats = {
    totalEvents: data.length,
    byAction: {} as Record<string, number>,
    byEntity: {} as Record<string, number>,
    byDay: {} as Record<string, number>,
    recentActivity: [] as unknown[],
  }
  data.forEach(log => {
    // Count by action
    stats.byAction[log.action] = (stats.byAction[log.action] || 0) + 1
    // Count by entity
    stats.byEntity[log.entity_type] = (stats.byEntity[log.entity_type] || 0) + 1
    // Count by day
    const day = new Date(log.created_at).toISOString().split('T')[0]
    stats.byDay[day] = (stats.byDay[day] || 0) + 1
  })
  // Get recent activity (last 10 events)
  stats.recentActivity = data.slice(0, 10)
  return stats
}
// Search audit logs
export async function searchAuditLogs(searchTerm: string, salonId?: string) {
  const supabase = await createClient()
  let query = supabase
    .from('audit_logs')
    .select(`
      *,
      profiles (
        id,
        email,
        full_name
      )
    `)
    .or(`action.ilike.%${searchTerm}%,entity_type.ilike.%${searchTerm}%,entity_id.ilike.%${searchTerm}%`)
    .order('created_at', { ascending: false })
    .limit(100)
  if (salonId) {
    query = query.eq('salon_id', salonId)
  }
  const { data, error } = await query
  if (error) {
    throw new Error('Failed to search audit logs')
  }
  return data
}
// Export audit logs
export async function exportAuditLogs(filters: AuditLogFilters = {}) {
  const logs = await getAuditLogs({ ...filters, limit: 10000 })
  // Format for CSV export
  const headers = [
    'Date/Time',
    'User',
    'Action',
    'Entity Type',
    'Entity ID',
    'IP Address',
    'Changes'
  ]
  const rows = logs.map(log => [
    new Date(log.created_at).toLocaleString(),
    log.profiles?.full_name || log.profiles?.email || log.user_id,
    log.action,
    log.entity_type,
    log.entity_id || '',
    log.ip_address || '',
    log.changes ? JSON.stringify(log.changes) : ''
  ])
  return {
    headers,
    rows,
    count: logs.length
  }
}
// Common audit actions
export const AUDIT_ACTIONS = {
  // Authentication
  LOGIN: 'login',
  LOGOUT: 'logout',
  REGISTER: 'register',
  PASSWORD_RESET: 'password_reset',
  // CRUD operations
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  // Specific actions
  APPROVE: 'approve',
  REJECT: 'reject',
  CANCEL: 'cancel',
  COMPLETE: 'complete',
  // System actions
  EXPORT: 'export',
  IMPORT: 'import',
  BACKUP: 'backup',
  RESTORE: 'restore',
  // Security actions
  PERMISSION_CHANGE: 'permission_change',
  ROLE_CHANGE: 'role_change',
  ACCESS_DENIED: 'access_denied',
  SUSPICIOUS_ACTIVITY: 'suspicious_activity',
}
// Common entity types
export const ENTITY_TYPES = {
  USER: 'user',
  SALON: 'salon',
  APPOINTMENT: 'appointment',
  SERVICE: 'service',
  STAFF: 'staff',
  CUSTOMER: 'customer',
  PAYMENT: 'payment',
  REVIEW: 'review',
  NOTIFICATION: 'notification',
  SETTINGS: 'settings',
  REPORT: 'report',
  CAMPAIGN: 'campaign',
}