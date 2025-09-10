import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { verifySession } from './auth';


export type ErrorLogDTO = {
  id: string;
  user_id: string | null;
  error_type: string;
  error_message: string;
  error_stack: string | null;
  endpoint: string | null;
  method: string | null;
  status_code: number | null;
  salon_id: string | null;
  created_at: string;
};

/**
 * Log error event
 */
export const logError = async (error: {
  error_type: string;
  error_message: string;
  error_stack?: string;
  endpoint?: string;
  method?: string;
  salon_id?: string;
}): Promise<void> => {
  const session = await verifySession();
  
  const supabase = await createClient();
  
  await supabase.from('error_logs').insert({
    user_id: session?.user.id || null,
    error_type: error.error_type,
    error_message: error.error_message,
    error_stack: error.error_stack || null,
    endpoint: error.endpoint || null,
    method: error.method || null,
    salon_id: error.salon_id || null,
  });
};

/**
 * Get error logs (admin only)
 */
export const getErrorLogs = cache(async (filters?: {
  severity?: string;
  resolved?: boolean;
  start_date?: string;
  end_date?: string;
}): Promise<ErrorLogDTO[]> => {
  const session = await verifySession();
  if (!session || session.user.role !== 'super_admin') return [];
  
  const supabase = await createClient();
  
  let query = supabase
    .from('error_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);
  
  if (filters?.severity) {
    query = query.eq('severity', filters.severity);
  }
  
  if (filters?.resolved !== undefined) {
    query = query.eq('resolved', filters.resolved);
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
    error_type: log.error_type,
    error_message: log.error_message,
    error_stack: log.error_stack,
    endpoint: log.endpoint,
    method: log.method,
    status_code: log.status_code,
    salon_id: log.salon_id,
    created_at: log.created_at,
  }));
});

/**
 * Delete error log (admin only)
 */
export const deleteErrorLog = async (errorId: string): Promise<boolean> => {
  const session = await verifySession();
  if (!session || session.user.role !== 'super_admin') return false;
  
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('error_logs')
    .delete()
    .eq('id', errorId);
  
  return !error;
};

/**
 * Get error summary statistics
 */
export const getErrorStats = cache(async (): Promise<{
  total: number;
  unresolved: number;
  critical: number;
  byType: Record<string, number>;
}> => {
  const session = await verifySession();
  if (!session || session.user.role !== 'super_admin') {
    return { total: 0, unresolved: 0, critical: 0, byType: {} };
  }
  
  const supabase = await createClient();
  
  // Get total count
  const { count: total } = await supabase
    .from('error_logs')
    .select('*', { count: 'exact', head: true });
  
  // Get unresolved count
  const { count: unresolved } = await supabase
    .from('error_logs')
    .select('*', { count: 'exact', head: true })
    .eq('resolved', false);
  
  // Get critical count
  const { count: critical } = await supabase
    .from('error_logs')
    .select('*', { count: 'exact', head: true })
    .eq('severity', 'critical')
    .eq('resolved', false);
  
  // Get counts by type
  const { data: errors } = await supabase
    .from('error_logs')
    .select('error_type')
    .eq('resolved', false);
  
  const byType: Record<string, number> = {};
  if (errors) {
    errors.forEach(err => {
      byType[err.error_type] = (byType[err.error_type] || 0) + 1;
    });
  }
  
  return {
    total: total || 0,
    unresolved: unresolved || 0,
    critical: critical || 0,
    byType,
  };
});