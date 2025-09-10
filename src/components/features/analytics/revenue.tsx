'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Bar, BarChart, XAxis, YAxis } from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'
import { createClient } from '@/lib/supabase/client'
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns'

interface RevenueData {
  month: string
  revenue: number
  bookings: number
}

export function RevenueChart() {
  const [revenueData, setRevenueData] = useState<RevenueData[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchRevenueData() {
      try {
        const months: RevenueData[] = []
        
        // Fetch last 6 months of data
        for (let i = 5; i >= 0; i--) {
          const date = subMonths(new Date(), i)
          const monthStart = startOfMonth(date)
          const monthEnd = endOfMonth(date)
          
          // Fetch revenue data from appointments
          const { data: appointments, error } = await supabase
            .from('appointments')
            .select('computed_total_price, status')
            .gte('start_time', monthStart.toISOString())
            .lte('start_time', monthEnd.toISOString())
            .eq('status', 'completed')
          
          if (error) throw error
          
          const revenue = appointments?.reduce((sum, apt) => sum + (apt.computed_total_price || 0), 0) || 0
          const bookings = appointments?.length || 0
          
          months.push({
            month: format(date, 'MMM'),
            revenue,
            bookings
          })
        }
        
        setRevenueData(months)
      } catch (error) {
        console.error('Error fetching revenue data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRevenueData()
  }, [supabase])

  const chartConfig = {
    revenue: {
      label: 'Revenue',
      color: 'hsl(var(--primary))',
    },
    bookings: {
      label: 'Bookings', 
      color: 'hsl(var(--primary))',
    },
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Overview</CardTitle>
        <CardDescription>Platform revenue and booking trends</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="revenue" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
          </TabsList>
          <TabsContent value="revenue" className="space-y-4">
            <ChartContainer config={chartConfig}>
              <BarChart data={revenueData}>
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value) => [`$${(value as number).toLocaleString()}`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
              </BarChart>
            </ChartContainer>
          </TabsContent>
          <TabsContent value="bookings" className="space-y-4">
            <ChartContainer config={chartConfig}>
              <BarChart data={revenueData}>
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value) => [value, 'Bookings']}
                />
                <Bar dataKey="bookings" fill="var(--color-bookings)" radius={4} />
              </BarChart>
            </ChartContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}