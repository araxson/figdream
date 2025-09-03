'use server'
import { createClient } from '@/lib/database/supabase/server'
import type { Database } from '@/types/database.types'
type RateLimit = Database['public']['Tables']['rate_limits']['Row']
type _RateLimitInsert = Database['public']['Tables']['rate_limits']['Insert']
type _RateLimitUpdate = Database['public']['Tables']['rate_limits']['Update']
/**
 * Check if a user or IP has exceeded rate limits for an endpoint
 */
export async function checkRateLimit(params: {
  endpoint: string
  userId?: string | null
  ipAddress?: string | null
  limit?: number
  windowMinutes?: number
}): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  const { 
    endpoint, 
    userId, 
    ipAddress, 
    limit = 100, 
    windowMinutes = 15 
  } = params
  const supabase = await createClient()
  // Calculate window start time
  const windowStart = new Date()
  windowStart.setMinutes(windowStart.getMinutes() - windowMinutes)
  try {
    // Get current request count for this endpoint/user/IP combination
    let query = supabase
      .from('rate_limits')
      .select('*')
      .eq('endpoint', endpoint)
      .gte('window_start', windowStart.toISOString())
    if (userId) {
      query = query.eq('user_id', userId)
    } else if (ipAddress) {
      query = query.eq('ip_address', ipAddress)
    }
    const { data: limits, error } = await query
    if (error) {
      // On error, allow the request but log it
      return { 
        allowed: true, 
        remaining: limit, 
        resetAt: new Date(Date.now() + windowMinutes * 60 * 1000) 
      }
    }
    // Calculate total requests in window
    const totalRequests = limits?.reduce((sum, l) => sum + (l.request_count || 0), 0) || 0
    const allowed = totalRequests < limit
    const remaining = Math.max(0, limit - totalRequests)
    const resetAt = new Date(windowStart.getTime() + windowMinutes * 60 * 1000)
    return { allowed, remaining, resetAt }
  } catch (_error) {
    // On error, allow the request but log it
    return { 
      allowed: true, 
      remaining: limit, 
      resetAt: new Date(Date.now() + windowMinutes * 60 * 1000) 
    }
  }
}
/**
 * Record a rate limit hit for tracking
 */
export async function recordRateLimitHit(params: {
  endpoint: string
  userId?: string | null
  ipAddress?: string | null
}): Promise<{ success: boolean; error?: string }> {
  const { endpoint, userId, ipAddress } = params
  const supabase = await createClient()
  try {
    // Find or create rate limit record for this window
    const windowStart = new Date()
    windowStart.setMinutes(Math.floor(windowStart.getMinutes() / 15) * 15) // Round to 15-minute window
    windowStart.setSeconds(0)
    windowStart.setMilliseconds(0)
    // Check if record exists
    let query = supabase
      .from('rate_limits')
      .select('*')
      .eq('endpoint', endpoint)
      .eq('window_start', windowStart.toISOString())
    if (userId) {
      query = query.eq('user_id', userId)
    } else if (ipAddress) {
      query = query.eq('ip_address', ipAddress)
    }
    const { data: existing, error: selectError } = await query.single()
    if (selectError && selectError.code !== 'PGRST116') { // PGRST116 = no rows found
      throw selectError
    }
    if (existing) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('rate_limits')
        .update({ 
          request_count: (existing.request_count || 0) + 1 
        })
        .eq('id', existing.id)
      if (updateError) throw updateError
    } else {
      // Create new record
      const { error: insertError } = await supabase
        .from('rate_limits')
        .insert({
          endpoint,
          user_id: userId,
          ip_address: ipAddress,
          request_count: 1,
          window_start: windowStart.toISOString()
        })
      if (insertError) throw insertError
    }
    return { success: true }
  } catch (_error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to record rate limit'
    return { success: false, error: errorMessage }
  }
}
/**
 * Clean up old rate limit records (older than 24 hours)
 */
export async function cleanupOldRateLimits(): Promise<{ 
  success: boolean
  deleted?: number
  error?: string 
}> {
  const supabase = await createClient()
  try {
    const cutoffDate = new Date()
    cutoffDate.setHours(cutoffDate.getHours() - 24)
    const { data, error } = await supabase
      .from('rate_limits')
      .delete()
      .lt('window_start', cutoffDate.toISOString())
      .select('id')
    if (error) throw error
    return { 
      success: true, 
      deleted: data?.length || 0 
    }
  } catch (_error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to cleanup rate limits'
    return { success: false, error: errorMessage }
  }
}
/**
 * Get rate limit statistics for monitoring
 */
export async function getRateLimitStats(params?: {
  endpoint?: string
  userId?: string
  hours?: number
}): Promise<{
  data: {
    totalRequests: number
    uniqueUsers: number
    uniqueIPs: number
    topEndpoints: Array<{ endpoint: string; count: number }>
    recentViolations: RateLimit[]
  } | null
  error?: string
}> {
  const { endpoint, userId, hours = 24 } = params || {}
  const supabase = await createClient()
  try {
    const since = new Date()
    since.setHours(since.getHours() - hours)
    let query = supabase
      .from('rate_limits')
      .select('*')
      .gte('created_at', since.toISOString())
    if (endpoint) {
      query = query.eq('endpoint', endpoint)
    }
    if (userId) {
      query = query.eq('user_id', userId)
    }
    const { data: limits, error } = await query
    if (error) throw error
    // Calculate statistics
    const totalRequests = limits?.reduce((sum, l) => sum + (l.request_count || 0), 0) || 0
    const uniqueUsers = new Set(limits?.filter(l => l.user_id).map(l => l.user_id)).size
    const uniqueIPs = new Set(limits?.filter(l => l.ip_address).map(l => l.ip_address)).size
    // Group by endpoint for top endpoints
    const endpointCounts: Record<string, number> = {}
    limits?.forEach(l => {
      endpointCounts[l.endpoint] = (endpointCounts[l.endpoint] || 0) + (l.request_count || 0)
    })
    const topEndpoints = Object.entries(endpointCounts)
      .map(([endpoint, count]) => ({ endpoint, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
    // Get recent high-rate violations (>50 requests in window)
    const recentViolations = limits?.filter(l => (l.request_count || 0) > 50) || []
    return {
      data: {
        totalRequests,
        uniqueUsers,
        uniqueIPs,
        topEndpoints,
        recentViolations
      }
    }
  } catch (_error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to get rate limit stats'
    return { data: null, error: errorMessage }
  }
}
/**
 * Reset rate limits for a specific user (admin action)
 */
export async function resetUserRateLimits(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  try {
    const { error } = await supabase
      .from('rate_limits')
      .delete()
      .eq('user_id', userId)
    if (error) throw error
    return { success: true }
  } catch (_error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to reset rate limits'
    return { success: false, error: errorMessage }
  }
}