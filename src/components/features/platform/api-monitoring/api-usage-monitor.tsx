'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertTriangle } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { UsageStats, TimeRange } from '@/types/features/api-usage-types'
import { fetchAPIUsage } from '@/lib/api/services/api-usage-service'
import { APIUsageStats } from './api-usage-stats'
import { APIUsageEndpoints } from './api-usage-endpoints'
import { APIUsageHourly } from './api-usage-hourly'

export function APIUsageMonitor() {
  const [stats, setStats] = useState<UsageStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<TimeRange>('day')

  const loadData = useCallback(async () => {
    setLoading(true)
    const { stats: statsData } = await fetchAPIUsage(timeRange)
    setStats(statsData)
    setLoading(false)
  }, [timeRange])

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [loadData])

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>API Usage Monitor</CardTitle>
            <CardDescription>Real-time API performance and usage metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64">
              Loading API usage data...
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!stats) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load API usage data. Please try again later.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">API Usage Monitor</h2>
          <p className="text-muted-foreground">Real-time API performance and usage metrics</p>
        </div>
        <Tabs value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
          <TabsList>
            <TabsTrigger value="hour">Last Hour</TabsTrigger>
            <TabsTrigger value="day">Last 24 Hours</TabsTrigger>
            <TabsTrigger value="week">Last Week</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <APIUsageStats stats={stats} />

      {stats.errorCount > 10 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            High error rate detected: {stats.errorCount} errors in the selected time period.
            Please investigate the failing endpoints.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <APIUsageEndpoints stats={stats} />
        <APIUsageHourly stats={stats} />
      </div>
    </div>
  )
}