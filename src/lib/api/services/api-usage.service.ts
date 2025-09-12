
import { APIUsage, UsageStats, TimeRange } from '@/types/features/api-usage-types'

export async function fetchAPIUsage(timeRange: TimeRange): Promise<{ usage: APIUsage[], stats: UsageStats | null }> {
  try {
    const response = await fetch('/api/platform/api-usage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ timeRange }),
    })

    if (!response.ok) {
      throw new Error('Failed to fetch API usage data')
    }

    const data = await response.json()
    
    if (!data.usage) {
      return { usage: [], stats: null }
    }

    const stats = calculateStats(data.usage)
    return { usage: data.usage, stats }
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