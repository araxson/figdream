'use server';
import { createClient } from '@/lib/database/supabase/server';
import type { Database } from '@/types/database.types';
type ErrorLog = Database['public']['Tables']['error_logs']['Row'];
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
  severity: ErrorSeverity = 'medium',
  context?: ErrorContext,
  stackTrace?: string
): Promise<void> {
  try {
    const supabase = await createClient();
    const errorData: ErrorLogInsert = {
      message: message.slice(0, 500), // Truncate to avoid DB errors
      category,
      severity,
      context: context || {},
      stack_trace: stackTrace?.slice(0, 5000) || null,
      user_id: context?.userId || null,
      url: context?.url || null,
      created_at: new Date().toISOString(),
      resolved: false
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
    query = query.eq('category', category);
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
  const errorsBySeverity = data.reduce((acc, err) => {
    const severity = err.severity as ErrorSeverity;
    acc[severity] = (acc[severity] || 0) + 1;
    return acc;
  }, {} as Record<ErrorSeverity, number>);
  const errorsByCategory = data.reduce((acc, err) => {
    const cat = err.category as ErrorCategory;
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<ErrorCategory, number>);
  // Get recent errors
  const recentErrors = data
    .sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime())
    .slice(0, 10);
  // Calculate top errors
  const errorMessageCounts = new Map<string, { count: number; lastOccurred: Date }>();
  data.forEach(err => {
    const existing = errorMessageCounts.get(err.message) || { count: 0, lastOccurred: new Date(0) };
    errorMessageCounts.set(err.message, {
      count: existing.count + 1,
      lastOccurred: new Date(err.created_at!) > existing.lastOccurred 
        ? new Date(err.created_at!) 
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
 * Get unresolved critical errors
 */
export async function getCriticalErrors(limit: number = 50): Promise<ErrorLog[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('error_logs')
    .select('*')
    .eq('severity', 'critical')
    .eq('resolved', false)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    return [];
  }
  return data || [];
}
/**
 * Mark an error as resolved
 */
export async function resolveError(
  errorId: string,
  resolution?: string
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('error_logs')
    .update({
      resolved: true,
      resolved_at: new Date().toISOString(),
      resolution: resolution || null
    })
    .eq('id', errorId);
  if (error) {
    throw new Error('Failed to mark error as resolved');
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
  resolution?: string
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('error_logs')
    .update({
      resolved: true,
      resolved_at: new Date().toISOString(),
      resolution: resolution || null
    })
    .in('id', errorIds);
  if (error) {
    throw new Error('Failed to resolve errors');
  }
}
/**
 * Clean up old resolved errors
 */
export async function cleanupOldErrors(daysToKeep: number = 90): Promise<void> {
  const supabase = await createClient();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  const { error } = await supabase
    .from('error_logs')
    .delete()
    .eq('resolved', true)
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