'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { Bar, BarChart, XAxis, YAxis } from 'recharts'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

type BookingData = {
  date: string
  count: number
}

export function BookingChart() {
  const [data, setData] = useState<BookingData[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchBookingData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: salon } = await supabase
        .from('salons')
        .select('id')
        .eq('created_by', user.id)
        .single()

      if (!salon) return

      // Get last 30 days of booking data
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data: appointments } = await supabase
        .from('appointments')
        .select('appointment_date')
        .eq('salon_id', salon.id)
        .gte('appointment_date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('appointment_date')

      if (appointments) {
        // Group by date
        const bookingsByDate = appointments.reduce((acc, apt) => {
          const date = apt.appointment_date
          if (!acc[date]) acc[date] = 0
          acc[date]++
          return acc
        }, {} as Record<string, number>)

        // Fill in missing dates with 0
        const chartData: BookingData[] = []
        for (let i = 0; i < 30; i++) {
          const date = new Date()
          date.setDate(date.getDate() - (29 - i))
          const dateStr = date.toISOString().split('T')[0]
          chartData.push({
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            count: bookingsByDate[dateStr] || 0
          })
        }

        setData(chartData)
      }
    } catch (error) {
      console.error('Error fetching booking data:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchBookingData()
  }, [fetchBookingData])

  const chartConfig = {
    count: {
      label: 'Bookings',
      color: 'hsl(var(--primary))',
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bookings</CardTitle>
        <CardDescription>Daily booking trends (last 30 days)</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-[250px] w-full" />
            <div className="flex justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            No booking data available
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[250px]">
            <BarChart data={data}>
              <XAxis 
                dataKey="date"
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis tick={{ fontSize: 12 }} />
              <ChartTooltip
                content={<ChartTooltipContent />}
                formatter={(value) => [value, 'Bookings']}
              />
              <Bar 
                dataKey="count" 
                fill="var(--color-count)" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}