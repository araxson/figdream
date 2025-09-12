import { Database } from '@/types/database.types'

export type APIUsage = Database['public']['Tables']['api_usage']['Row']

export interface UsageStats {
  totalRequests: number
  successRate: number
  averageLatency: number
  errorCount: number
  topEndpoints: Array<{
    endpoint: string
    count: number
    avgLatency: number
  }>
  hourlyUsage: Array<{
    hour: string
    requests: number
    errors: number
  }>
}

export type TimeRange = 'hour' | 'day' | 'week'