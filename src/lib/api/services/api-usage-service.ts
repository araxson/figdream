import { createClient } from '@/lib/supabase/client'
import { APIUsage, UsageStats, TimeRange } from '@/types/features/api-usage-types'

export async function fetchAPIUsage(timeRange: TimeRange): Promise<{ usage: APIUsage[], stats: UsageStats | null }> {
  const supabase = createClient()
  
  try {
    const now = new Date()
    let startTime = new Date()
    
    switch (timeRange) {
      case 'hour':
        startTime = new Date(now.getTime() - 60 * 60 * 1000)
        break
      case 'day':
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case 'week':
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
    }

    const { data: usageData } = await supabase
      .from('api_usage')
      .select('*')
      .gte('created_at', startTime.toISOString())
      .order('created_at', { ascending: false })

    if (!usageData) {
      return { usage: [], stats: null }
    }

    const stats = calculateStats(usageData)
    return { usage: usageData, stats }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching API usage:', error)
    }
    return { usage: [], stats: null }
  }
}

function calculateStats(usage: APIUsage[]): UsageStats {
  const totalRequests = usage.length
  const successCount = usage.filter(u => u.status_code && u.status_code < 400).length
  const errorCount = totalRequests - successCount
  const successRate = totalRequests > 0 ? (successCount / totalRequests) * 100 : 0
  
  const totalLatency = usage.reduce((sum, u) => sum + (u.response_time_ms || 0), 0)
  const averageLatency = totalRequests > 0 ? totalLatency / totalRequests : 0

  const endpointMap = new Map<string, { count: number; totalLatency: number }>()
  usage.forEach(u => {
    const current = endpointMap.get(u.endpoint) || { count: 0, totalLatency: 0 }
    endpointMap.set(u.endpoint, {
      count: current.count + 1,
      totalLatency: current.totalLatency + (u.response_time_ms || 0)
    })
  })

  const topEndpoints = Array.from(endpointMap.entries())
    .map(([endpoint, data]) => ({
      endpoint,
      count: data.count,
      avgLatency: data.totalLatency / data.count
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  const hourlyMap = new Map<string, { requests: number; errors: number }>()
  usage.forEach(u => {
    const hour = new Date(u.created_at).getHours().toString().padStart(2, '0') + ':00'
    const current = hourlyMap.get(hour) || { requests: 0, errors: 0 }
    hourlyMap.set(hour, {
      requests: current.requests + 1,
      errors: current.errors + (u.status_code && u.status_code >= 400 ? 1 : 0)
    })
  })

  const hourlyUsage = Array.from(hourlyMap.entries())
    .map(([hour, data]) => ({ hour, ...data }))
    .sort((a, b) => a.hour.localeCompare(b.hour))

  return {
    totalRequests,
    successRate,
    averageLatency,
    errorCount,
    topEndpoints,
    hourlyUsage
  }
}