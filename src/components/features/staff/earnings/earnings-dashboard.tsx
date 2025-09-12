'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useState, useEffect, useCallback } from 'react'
import { StaffEarning, EarningsStats, TimeRange } from '@/types/features/earnings-types'
import { fetchStaffEarnings } from '@/lib/api/services/earnings-service'
import { EarningsStatsCards } from './earnings-stats'
import { EarningsTable } from './earnings-table'
import { PerformanceMetrics } from './earnings-performance'

const Bar = () => (
  <div className="h-64 flex items-center justify-center text-muted-foreground">
    Chart will be displayed here
  </div>
)

const Doughnut = () => (
  <div className="h-64 flex items-center justify-center text-muted-foreground">
    Chart will be displayed here
  </div>
)

export function StaffEarningsDashboard() {
  const [earnings, setEarnings] = useState<StaffEarning[]>([])
  const [stats, setStats] = useState<EarningsStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<TimeRange>('month')

  const loadEarnings = useCallback(async () => {
    setLoading(true)
    try {
      const { earnings: earningsData, stats: statsData } = await fetchStaffEarnings(timeRange)
      setEarnings(earningsData)
      setStats(statsData)
    } finally {
      setLoading(false)
    }
  }, [timeRange])

  useEffect(() => {
    loadEarnings()
  }, [loadEarnings])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Earnings Dashboard</CardTitle>
          <CardDescription>Track your income and performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            Loading earnings data...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <EarningsStatsCards stats={stats} />

      <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
        <TabsList>
          <TabsTrigger value="week">Week</TabsTrigger>
          <TabsTrigger value="month">Month</TabsTrigger>
          <TabsTrigger value="year">Year</TabsTrigger>
        </TabsList>

        <TabsContent value={timeRange} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Earnings Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <Bar />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Payment Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <Doughnut />
              </CardContent>
            </Card>
          </div>

          <EarningsTable earnings={earnings} />
        </TabsContent>
      </Tabs>

      <PerformanceMetrics stats={stats} />
    </div>
  )
}