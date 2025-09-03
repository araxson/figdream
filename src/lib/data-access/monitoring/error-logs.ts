'use server';

import { createClient } from '@/lib/database/supabase/server';
import type { Database } from '@/types/database.types';

export type ErrorLog = Database['public']['Tables']['error_logs']['Row'];
type ErrorLogInsert = Database['public']['Tables']['error_logs']['Insert'];

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ErrorCategory = 'database' | 'api' | 'auth' | 'payment' | 'ui' | 'system' | 'business_logic' | 'third_party';

export interface ErrorContext {
  userId?: string;
  salonId?: string;
  url?: string;
  method?: string;
  userAgent?: string;
  ip?: string;
  requestId?: string;
  sessionId?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface ErrorStats {
  totalErrors: number;
  errorsBySeverity: Record<ErrorSeverity, number>;
  errorsByCategory: Record<ErrorCategory, number>;
  recentErrors: ErrorLog[];
  topErrors: Array<{
    message: string;
    count: number;
    lastOccurred: Date;
  }>;
  errorRate: number;
}

/**
 * Log an error to the database
 */
export async function logError(
  message: string,
  category: ErrorCategory,
  _severity: ErrorSeverity = 'medium',
  context?: ErrorContext,
  stackTrace?: string
): Promise<void> {
  try {
    const supabase = await createClient();
    
    const errorData: ErrorLogInsert = {
      error_message: message.slice(0, 500), // Truncate to avoid DB errors
      error_type: category,
      error_stack: stackTrace?.slice(0, 5000) || null,
      user_id: context?.userId || null,
      salon_id: context?.salonId || null,
      endpoint: context?.url || null,
      method: context?.method || null,
      user_agent: context?.userAgent || null,
      ip_address: context?.ip || null,
      request_body: context ? { context } : null,
      created_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('error_logs')
      .insert(errorData);

    if (error) {
      // Log to console if DB logging fails
    }
  } catch (_err) {
    // Fail silently to prevent error logging from breaking the app
  }
}

/**
 * Get error statistics for monitoring
 */
export async function getErrorStats(
  startDate: Date,
  endDate: Date,
  category?: ErrorCategory
): Promise<ErrorStats> {
  const supabase = await createClient();
  
  let query = supabase
    .from('error_logs')
    .select('*')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString());
  
  if (category) {
    query = query.like('error_type', `%${category}%`);
  }
  
  const { data, error } = await query;
  
  if (error || !data) {
    return {
      totalErrors: 0,
      errorsBySeverity: {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0
      },
      errorsByCategory: {
        database: 0,
        api: 0,
        auth: 0,
        payment: 0,
        ui: 0,
        system: 0,
        business_logic: 0,
        third_party: 0
      },
      recentErrors: [],
      topErrors: [],
      errorRate: 0
    };
  }
  
  // Calculate statistics
  const totalErrors = data.length;
  
  // Since severity isn't in the table, we'll categorize based on error_type
  const errorsBySeverity = data.reduce((acc, err) => {
    // Map error types to severities
    let severity: ErrorSeverity = 'medium';
    if (err.error_type.includes('critical') || err.error_type.includes('fatal')) {
      severity = 'critical';
    } else if (err.error_type.includes('auth') || err.error_type.includes('payment')) {
      severity = 'high';
    } else if (err.error_type.includes('warning')) {
      severity = 'low';
    }
    acc[severity] = (acc[severity] || 0) + 1;
    return acc;
  }, {} as Record<ErrorSeverity, number>);
  
  const errorsByCategory = data.reduce((acc, err) => {
    // Map error_type to category
    let cat: ErrorCategory = 'system';
    if (err.error_type.includes('database')) cat = 'database';
    else if (err.error_type.includes('api')) cat = 'api';
    else if (err.error_type.includes('auth')) cat = 'auth';
    else if (err.error_type.includes('payment')) cat = 'payment';
    else if (err.error_type.includes('ui')) cat = 'ui';
    else if (err.error_type.includes('business')) cat = 'business_logic';
    else if (err.error_type.includes('third')) cat = 'third_party';
    
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<ErrorCategory, number>);
  
  // Get recent errors
  const recentErrors = data
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10);
  
  // Calculate top errors
  const errorMessageCounts = new Map<string, { count: number; lastOccurred: Date }>();
  data.forEach(err => {
    const existing = errorMessageCounts.get(err.error_message) || { count: 0, lastOccurred: new Date(0) };
    errorMessageCounts.set(err.error_message, {
      count: existing.count + 1,
      lastOccurred: new Date(err.created_at) > existing.lastOccurred 
        ? new Date(err.created_at) 
        : existing.lastOccurred
    });
  });
  
  const topErrors = Array.from(errorMessageCounts.entries())
    .map(([message, stats]) => ({
      message,
      count: stats.count,
      lastOccurred: stats.lastOccurred
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  
  const timeDiffHours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
  const errorRate = timeDiffHours > 0 ? totalErrors / timeDiffHours : 0;
  
  return {
    totalErrors,
    errorsBySeverity: {
      low: errorsBySeverity.low || 0,
      medium: errorsBySeverity.medium || 0,
      high: errorsBySeverity.high || 0,
      critical: errorsBySeverity.critical || 0
    },
    errorsByCategory: {
      database: errorsByCategory.database || 0,
      api: errorsByCategory.api || 0,
      auth: errorsByCategory.auth || 0,
      payment: errorsByCategory.payment || 0,
      ui: errorsByCategory.ui || 0,
      system: errorsByCategory.system || 0,
      business_logic: errorsByCategory.business_logic || 0,
      third_party: errorsByCategory.third_party || 0
    },
    recentErrors,
    topErrors,
    errorRate
  };
}

/**
 * Get error logs with optional filters
 */
export async function getErrorLogs(
  filters?: {
    severity?: ErrorSeverity;
    category?: ErrorCategory;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }
): Promise<ErrorLog[]> {
  const supabase = await createClient();
  
  let query = supabase.from('error_logs').select('*');
  
  // Filter by error_type since we don't have severity/category columns
  if (filters?.category) {
    query = query.like('error_type', `%${filters.category}%`);
  }
  if (filters?.startDate) {
    query = query.gte('created_at', filters.startDate.toISOString());
  }
  if (filters?.endDate) {
    query = query.lte('created_at', filters.endDate.toISOString());
  }
  
  query = query.order('created_at', { ascending: false });
  
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  
  const { data, error } = await query;
  
  if (error) {
    return [];
  }
  
  return data || [];
}

/**
 * Get unresolved critical errors
 */
export async function getCriticalErrors(limit: number = 50): Promise<ErrorLog[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('error_logs')
    .select('*')
    .or('error_type.ilike.%critical%,error_type.ilike.%fatal%')
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) {
    return [];
  }
  
  return data || [];
}

/**
 * Mark an error as resolved (deletes it since table doesn't have resolved column)
 */
export async function resolveError(
  errorId: string,
  _resolution?: string
): Promise<void> {
  // Since the error_logs table doesn't have resolved/resolution columns,
  // we'll just delete the error or you could add these columns to the table
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('error_logs')
    .delete()
    .eq('id', errorId);
  
  if (error) {
    throw new Error('Failed to resolve error');
  }
}

/**
 * Get errors by user
 */
export async function getUserErrors(
  userId: string,
  limit: number = 50
): Promise<ErrorLog[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('error_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) {
    return [];
  }
  
  return data || [];
}

/**
 * Bulk resolve errors
 */
export async function bulkResolveErrors(
  errorIds: string[],
  _resolution?: string
): Promise<void> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('error_logs')
    .delete()
    .in('id', errorIds);
  
  if (error) {
    throw new Error('Failed to resolve errors');
  }
}

/**
 * Clean up old errors
 */
export async function cleanupOldErrors(daysToKeep: number = 90): Promise<void> {
  const supabase = await createClient();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  const { error } = await supabase
    .from('error_logs')
    .delete()
    .lt('created_at', cutoffDate.toISOString());
  
  if (error) {
    throw new Error('Failed to cleanup error logs');
  }
}

/**
 * Global error handler for Next.js
 */
export async function handleError(
  error: Error,
  category: ErrorCategory,
  context?: ErrorContext
): Promise<void> {
  // Determine severity based on error type
  let severity: ErrorSeverity = 'medium';
  
  if (error.message.toLowerCase().includes('critical') || 
      error.message.toLowerCase().includes('fatal')) {
    severity = 'critical';
  } else if (error.message.toLowerCase().includes('auth') || 
             error.message.toLowerCase().includes('payment')) {
    severity = 'high';
  }
  
  await logError(
    error.message,
    category,
    severity,
    context,
    error.stack
  );
}

/**
 * React Error Boundary logger
 */
export async function logReactError(
  error: Error,
  errorInfo: { componentStack: string }
): Promise<void> {
  await logError(
    error.message,
    'ui',
    'high',
    {
      componentStack: errorInfo.componentStack
    },
    error.stack
  );
}