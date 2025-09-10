'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useEffect, useState, useCallback } from 'react'
import { GrowthData, TimeRange } from './user-growth-types'
import { fetchGrowthData } from './user-growth-service'
import { UserGrowthStats } from './user-growth-stats'
import { UserGrowthDetails } from './user-growth-details'

export function UserGrowth() {
  const [data, setData] = useState<GrowthData>({
    newUsers: 0,
    totalUsers: 0,
    growthRate: 0,
    churnRate: 0,
    usersByRole: [],
    monthlyGrowth: [],
    retentionCohorts: []
  })
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<TimeRange>('month')

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const growthData = await fetchGrowthData(timeRange)
      setData(growthData)
    } finally {
      setLoading(false)
    }
  }, [timeRange])

  useEffect(() => {
    loadData()
  }, [loadData])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Growth</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            Loading growth data...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <UserGrowthStats data={data} timeRange={timeRange} />
      <UserGrowthDetails 
        data={data} 
        timeRange={timeRange} 
        onTimeRangeChange={setTimeRange}
      />
    </div>
  )
}