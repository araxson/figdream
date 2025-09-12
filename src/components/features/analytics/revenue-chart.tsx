'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Bar, BarChart, Line, LineChart, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, DollarSign, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RevenueData {
  month: string
  revenue: number
  bookings: number
}

export function RevenueChart() {
  const [revenueData, setRevenueData] = useState<RevenueData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRevenueData() {
      try {
        const response = await fetch('/api/admin/analytics/revenue-chart')
        if (!response.ok) return

        const data = await response.json()
        setRevenueData(data)
      } catch (error) {
        console.error('Error fetching revenue data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRevenueData()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className={cn("h-6 w-32")} />
          <Skeleton className={cn("h-4 w-48")} />
        </CardHeader>
        <CardContent>
          <Skeleton className={cn("h-64 w-full")} />
        </CardContent>
      </Card>
    )
  }

  const chartData = revenueData.map(item => ({
    month: item.month.slice(0, 3),
    revenue: item.revenue,
    bookings: item.bookings,
  }))

  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0)
  const totalBookings = revenueData.reduce((sum, item) => sum + item.bookings, 0)
  const avgRevenue = totalRevenue / (revenueData.length || 1)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Analytics</CardTitle>
        <CardDescription>Monthly revenue and booking trends</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="revenue" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="revenue">
            <ChartContainer
              config={{
                revenue: {
                  label: "Revenue",
                  color: "hsl(var(--primary))",
                },
              }}
              className="h-[250px] w-full"
            >
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
            <div className="mt-4 flex flex-col gap-2 text-sm">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  Total Revenue: ${totalRevenue.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                <span>
                  Average: ${avgRevenue.toLocaleString()}/month
                </span>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="bookings">
            <ChartContainer
              config={{
                bookings: {
                  label: "Bookings",
                  color: "hsl(var(--secondary))",
                },
              }}
              className="h-[250px] w-full"
            >
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="bookings" 
                  stroke="var(--color-bookings)" 
                  strokeWidth={2}
                  dot={{ fill: "var(--color-bookings)", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "var(--color-bookings)", strokeWidth: 2 }}
                />
              </LineChart>
            </ChartContainer>
            <div className="mt-4 flex flex-col gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  Total Bookings: {totalBookings.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                <span>
                  Average: {Math.round(totalBookings / (revenueData.length || 1))} bookings/month
                </span>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}