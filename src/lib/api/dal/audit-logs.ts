import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { Database, Json } from '@/types/database.types';
import { requireRole } from './auth';

export type AuditLogDTO = {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
};

/**
 * Get audit logs (admin only)
 */
export const getAuditLogs = cache(async (filters?: {
  user_id?: string;
  entity_type?: string;
  action?: string;
  start_date?: string;
  end_date?: string;
}): Promise<AuditLogDTO[]> => {
  await requireRole(['super_admin']);
  
  const supabase = await createClient();
  
  let query = supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);
  
  if (filters?.user_id) {
    query = query.eq('user_id', filters.user_id);
  }
  
  if (filters?.entity_type) {
    query = query.eq('entity_type', filters.entity_type);
  }
  
  if (filters?.action) {
    query = query.eq('action', filters.action);
  }
  
  if (filters?.start_date) {
    query = query.gte('created_at', filters.start_date);
  }
  
  if (filters?.end_date) {
    query = query.lte('created_at', filters.end_date);
  }
  
  const { data, error } = await query;
  
  if (error || !data) return [];
  
  return data.map(log => ({
    id: log.id,
    user_id: log.user_id,
    action: log.action,
    entity_type: log.entity_type,
    entity_id: log.entity_id,
    old_data: log.old_data as Record<string, unknown> | null,
    new_data: log.new_data as Record<string, unknown> | null,
    ip_address: log.ip_address as string | null,
    user_agent: log.user_agent,
    created_at: log.created_at,
  }));
});

/**
 * Get salon audit logs (owner only)
 */
export const getSalonAuditLogs = cache(async (salonId: string): Promise<AuditLogDTO[]> => {
  await requireRole(['salon_owner', 'super_admin']);
  
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('salon_id', salonId)
    .order('created_at', { ascending: false })
    .limit(100);
  
  if (error || !data) return [];
  
  return data.map(log => ({
    id: log.id,
    user_id: log.user_id,
    action: log.action,
    entity_type: log.entity_type,
    entity_id: log.entity_id,
    old_data: log.old_data as Record<string, unknown> | null,
    new_data: log.new_data as Record<string, unknown> | null,
    ip_address: log.ip_address as string | null,
    user_agent: log.user_agent,
    created_at: log.created_at,
  }));
});

/**
 * Log audit event (internal use only)
 */
export const logAuditEvent = async (event: {
  action: string;
  entity_type: string;
  entity_id?: string;
  old_data?: Record<string, unknown>;
  new_data?: Record<string, unknown>;
  salon_id?: string;
}): Promise<void> => {
  const session = await requireRole(['salon_owner', 'staff', 'super_admin']);
  
  const supabase = await createClient();
  
  // Get user's IP and user agent from headers (if available)
  const ip_address = null; // Would need to get from request headers
  const user_agent = null; // Would need to get from request headers
  
  const auditLogEntry: Database['public']['Tables']['audit_logs']['Insert'] = {
    user_id: session.user.id,
    action: event.action,
    entity_type: event.entity_type,
    entity_id: event.entity_id || null,
    old_data: event.old_data as Json || null,
    new_data: event.new_data as Json || null,
    salon_id: event.salon_id || null,
    ip_address,
    user_agent,
  };
  
  await supabase.from('audit_logs').insert(auditLogEntry);
};