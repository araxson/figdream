'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { Area, AreaChart, XAxis, YAxis } from 'recharts'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils/format'

type RevenueData = {
  month: string
  revenue: number
}

export function RevenueChart() {
  const [data, setData] = useState<RevenueData[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchRevenueData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: salon } = await supabase
        .from('salons')
        .select('id')
        .eq('created_by', user.id)
        .single()

      if (!salon) return

      // Get last 6 months of revenue data
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

      const { data: appointments } = await supabase
        .from('appointments')
        .select('appointment_date, computed_total_price')
        .eq('salon_id', salon.id)
        .eq('status', 'completed')
        .gte('appointment_date', sixMonthsAgo.toISOString().split('T')[0])

      if (appointments) {
        // Group by month
        const revenueByMonth = appointments.reduce((acc, apt) => {
          const month = new Date(apt.appointment_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
          if (!acc[month]) acc[month] = 0
          acc[month] += apt.computed_total_price || 0
          return acc
        }, {} as Record<string, number>)

        const chartData = Object.entries(revenueByMonth)
          .map(([month, revenue]) => ({ month, revenue }))
          .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())

        setData(chartData)
      }
    } catch (error) {
      console.error('Error fetching revenue data:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchRevenueData()
  }, [fetchRevenueData])

  const chartConfig = {
    revenue: {
      label: 'Revenue',
      color: 'hsl(var(--primary))',
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue</CardTitle>
        <CardDescription>Monthly revenue over time</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-[250px] w-full" />
            <div className="flex justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            No revenue data available
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[250px]">
            <AreaChart data={data}>
              <XAxis 
                dataKey="month"
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
                formatter={(value) => [formatCurrency(value as number), 'Revenue']}
              />
              <Area
                dataKey="revenue"
                fill="var(--color-revenue)"
                stroke="var(--color-revenue)"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}