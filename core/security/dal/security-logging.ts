import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

export type SecurityEventType =
  | 'auth_success'
  | 'auth_failure'
  | 'permission_denied'
  | 'data_access'
  | 'data_modification'
  | 'suspicious_activity'
  | 'rate_limit_exceeded'
  | 'invalid_input'
  | 'system_error';

export interface SecurityEvent {
  event_type: SecurityEventType;
  user_id?: string;
  resource?: string;
  action?: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Log a security event to the audit_logs table
 * This function is designed to never throw - failures are logged to console
 */
export async function logSecurityEvent(event: SecurityEvent): Promise<void> {
  try {
    const supabase = await createClient();

    // Get additional context
    const timestamp = new Date().toISOString();

    // Insert into audit_logs table
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        user_id: event.user_id,
        action: `${event.event_type}:${event.action || 'unknown'}`,
        entity_type: event.resource || 'system',
        entity_id: event.details?.entity_id || null,
        changes: event.details || {},
        ip_address: event.ip_address,
        user_agent: event.user_agent,
        created_at: timestamp
      });

    if (error) {
      console.error('[Security] Failed to log event:', error);

      // For critical events, try alternative logging
      if (event.severity === 'critical') {
        console.error('[CRITICAL SECURITY EVENT]', JSON.stringify(event));
      }
    }

    // Alert security team for critical events
    if (event.severity === 'critical' || event.event_type === 'suspicious_activity') {
      await notifySecurityTeam(event);
    }
  } catch (error) {
    // Never throw from security logging - just console log
    console.error('[Security] Logging system error:', error);
  }
}

/**
 * Notify security team of critical events
 */
async function notifySecurityTeam(event: SecurityEvent): Promise<void> {
  try {
    // In production, this would send to Slack, PagerDuty, etc.
    console.warn('[Security Alert]', {
      type: event.event_type,
      severity: event.severity,
      resource: event.resource,
      user: event.user_id,
      timestamp: new Date().toISOString()
    });

    // Could also create a notification in the system
    const supabase = await createClient();
    await supabase.from('notifications').insert({
      user_id: event.user_id,
      type: 'security_alert',
      title: `Security Alert: ${event.event_type}`,
      message: `A security event has been detected in ${event.resource}`,
      severity: event.severity || 'high',
      data: event.details
    });
  } catch (error) {
    console.error('[Security] Failed to notify team:', error);
  }
}

/**
 * Log authentication attempts
 */
export async function logAuthAttempt(
  success: boolean,
  userId?: string,
  email?: string,
  method?: string
): Promise<void> {
  await logSecurityEvent({
    event_type: success ? 'auth_success' : 'auth_failure',
    user_id: userId,
    action: method || 'login',
    details: { email, method },
    severity: success ? 'low' : 'medium'
  });
}

/**
 * Log data access events
 */
export async function logDataAccess(
  userId: string,
  resource: string,
  action: 'read' | 'write' | 'delete',
  entityId?: string
): Promise<void> {
  await logSecurityEvent({
    event_type: 'data_access',
    user_id: userId,
    resource,
    action,
    details: { entity_id: entityId },
    severity: 'low'
  });
}

/**
 * Log permission violations
 */
export async function logPermissionDenied(
  userId: string,
  resource: string,
  attemptedAction: string
): Promise<void> {
  await logSecurityEvent({
    event_type: 'permission_denied',
    user_id: userId,
    resource,
    action: attemptedAction,
    severity: 'medium'
  });
}

/**
 * Log suspicious activities
 */
export async function logSuspiciousActivity(
  userId?: string,
  activity: string,
  details?: Record<string, any>
): Promise<void> {
  await logSecurityEvent({
    event_type: 'suspicious_activity',
    user_id: userId,
    action: activity,
    details,
    severity: 'high'
  });
}

/**
 * Get security events for monitoring
 */
export async function getSecurityEvents(
  filters: {
    userId?: string;
    eventType?: SecurityEventType;
    startDate?: string;
    endDate?: string;
    severity?: string;
  } = {}
): Promise<any[]> {
  const supabase = await createClient();

  // Verify admin access
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin' && profile?.role !== 'super_admin') {
    await logPermissionDenied(user.id, 'security_events', 'read');
    throw new Error("Forbidden: Admin access required");
  }

  // Build query
  let query = supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (filters.userId) {
    query = query.eq('user_id', filters.userId);
  }

  if (filters.eventType) {
    query = query.ilike('action', `${filters.eventType}:%`);
  }

  if (filters.startDate) {
    query = query.gte('created_at', filters.startDate);
  }

  if (filters.endDate) {
    query = query.lte('created_at', filters.endDate);
  }

  const { data, error } = await query;

  if (error) throw error;

  return data || [];
}