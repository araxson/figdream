'use server';

import { createClient } from '@/lib/database/supabase/server';
import type { Database } from '@/types/database.types';

type ApiUsage = Database['public']['Tables']['api_usage']['Row'];
type ApiUsageInsert = Database['public']['Tables']['api_usage']['Insert'];
type ApiUsageUpdate = Database['public']['Tables']['api_usage']['Update'];

export interface ApiUsageStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  requestsPerMinute: number;
  topEndpoints: Array<{
    endpoint: string;
    count: number;
    averageResponseTime: number;
  }>;
  errorRate: number;
}

/**
 * Track an API request
 */
export async function trackApiRequest(
  endpoint: string,
  method: string,
  userId?: string,
  responseTime?: number,
  statusCode?: number,
  errorMessage?: string
): Promise<void> {
  const supabase = await createClient();
  
  const usageData: ApiUsageInsert = {
    endpoint,
    method,
    user_id: userId || null,
    response_time_ms: responseTime || null,
    status_code: statusCode || null,
    error_message: errorMessage || null,
    created_at: new Date().toISOString()
  };
  
  const { error } = await supabase
    .from('api_usage')
    .insert(usageData);
    
  if (error) {
    console.error('Failed to track API usage:', error);
    // Don't throw here - we don't want tracking failures to break the app
  }
}

/**
 * Get API usage statistics for a time period
 */
export async function getApiUsageStats(
  startDate: Date,
  endDate: Date,
  userId?: string
): Promise<ApiUsageStats> {
  const supabase = await createClient();
  
  let query = supabase
    .from('api_usage')
    .select('*')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString());
    
  if (userId) {
    query = query.eq('user_id', userId);
  }
  
  const { data, error } = await query;
  
  if (error || !data) {
    console.error('Failed to get API usage stats:', error);
    return {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      requestsPerMinute: 0,
      topEndpoints: [],
      errorRate: 0
    };
  }
  
  // Calculate statistics
  const totalRequests = data.length;
  const successfulRequests = data.filter(r => r.status_code && r.status_code < 400).length;
  const failedRequests = totalRequests - successfulRequests;
  
  const totalResponseTime = data.reduce((sum, r) => sum + (r.response_time_ms || 0), 0);
  const averageResponseTime = totalRequests > 0 ? totalResponseTime / totalRequests : 0;
  
  const timeDiffMinutes = (endDate.getTime() - startDate.getTime()) / (1000 * 60);
  const requestsPerMinute = timeDiffMinutes > 0 ? totalRequests / timeDiffMinutes : 0;
  
  // Calculate top endpoints
  const endpointMap = new Map<string, { count: number; totalTime: number }>();
  data.forEach(r => {
    const key = r.endpoint;
    const existing = endpointMap.get(key) || { count: 0, totalTime: 0 };
    endpointMap.set(key, {
      count: existing.count + 1,
      totalTime: existing.totalTime + (r.response_time_ms || 0)
    });
  });
  
  const topEndpoints = Array.from(endpointMap.entries())
    .map(([endpoint, stats]) => ({
      endpoint,
      count: stats.count,
      averageResponseTime: stats.count > 0 ? stats.totalTime / stats.count : 0
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  
  const errorRate = totalRequests > 0 ? (failedRequests / totalRequests) * 100 : 0;
  
  return {
    totalRequests,
    successfulRequests,
    failedRequests,
    averageResponseTime,
    requestsPerMinute,
    topEndpoints,
    errorRate
  };
}

/**
 * Get recent API usage for monitoring
 */
export async function getRecentApiUsage(
  limit: number = 100,
  userId?: string
): Promise<ApiUsage[]> {
  const supabase = await createClient();
  
  let query = supabase
    .from('api_usage')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
    
  if (userId) {
    query = query.eq('user_id', userId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Failed to get recent API usage:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Check rate limit for a user/endpoint
 */
export async function checkRateLimit(
  userId: string,
  endpoint: string,
  maxRequests: number = 100,
  windowMinutes: number = 1
): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  const supabase = await createClient();
  
  const windowStart = new Date();
  windowStart.setMinutes(windowStart.getMinutes() - windowMinutes);
  
  const { count, error } = await supabase
    .from('api_usage')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('endpoint', endpoint)
    .gte('created_at', windowStart.toISOString());
    
  if (error) {
    console.error('Failed to check rate limit:', error);
    // Allow request if we can't check rate limit
    return {
      allowed: true,
      remaining: maxRequests,
      resetAt: new Date(Date.now() + windowMinutes * 60 * 1000)
    };
  }
  
  const requestCount = count || 0;
  const allowed = requestCount < maxRequests;
  const remaining = Math.max(0, maxRequests - requestCount);
  const resetAt = new Date(windowStart.getTime() + windowMinutes * 60 * 1000);
  
  return { allowed, remaining, resetAt };
}

/**
 * Clean up old API usage records (for maintenance)
 */
export async function cleanupOldApiUsage(daysToKeep: number = 30): Promise<void> {
  const supabase = await createClient();
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  const { error } = await supabase
    .from('api_usage')
    .delete()
    .lt('created_at', cutoffDate.toISOString());
    
  if (error) {
    console.error('Failed to cleanup old API usage records:', error);
    throw new Error('Failed to cleanup API usage records');
  }
}

/**
 * Get API usage by endpoint
 */
export async function getApiUsageByEndpoint(
  endpoint: string,
  startDate: Date,
  endDate: Date
): Promise<ApiUsage[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('api_usage')
    .select('*')
    .eq('endpoint', endpoint)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Failed to get API usage by endpoint:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Get user's API usage summary
 */
export async function getUserApiSummary(
  userId: string,
  days: number = 7
): Promise<{
  totalRequests: number;
  averageRequestsPerDay: number;
  mostUsedEndpoints: string[];
  lastRequestAt: Date | null;
}> {
  const supabase = await createClient();
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const { data, error } = await supabase
    .from('api_usage')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: false });
    
  if (error || !data) {
    console.error('Failed to get user API summary:', error);
    return {
      totalRequests: 0,
      averageRequestsPerDay: 0,
      mostUsedEndpoints: [],
      lastRequestAt: null
    };
  }
  
  const totalRequests = data.length;
  const averageRequestsPerDay = totalRequests / days;
  
  // Get most used endpoints
  const endpointCounts = new Map<string, number>();
  data.forEach(r => {
    const count = endpointCounts.get(r.endpoint) || 0;
    endpointCounts.set(r.endpoint, count + 1);
  });
  
  const mostUsedEndpoints = Array.from(endpointCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([endpoint]) => endpoint);
    
  const lastRequestAt = data.length > 0 ? new Date(data[0].created_at!) : null;
  
  return {
    totalRequests,
    averageRequestsPerDay,
    mostUsedEndpoints,
    lastRequestAt
  };
}