'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { DollarSign, Calendar, TrendingUp, Users, ArrowUp, ArrowDown } from 'lucide-react'
import { AnalyticsControls } from './analytics-controls'
import { RevenueDashboard } from './revenue-dashboard'
import { AppointmentAnalytics } from './appointment-analytics'
import { CustomerInsights } from './customer-insights'
import { ServicePerformance } from './service-performance'
import type { SalonAnalyticsProps, MetricCardProps } from './types'

// Mock data - replace with actual API data
const revenueData = [
  { month: 'Jan', revenue: 15000, bookings: 180, avgTicket: 83 },
  { month: 'Feb', revenue: 18000, bookings: 210, avgTicket: 86 },
  { month: 'Mar', revenue: 22000, bookings: 250, avgTicket: 88 },
  { month: 'Apr', revenue: 20000, bookings: 230, avgTicket: 87 },
  { month: 'May', revenue: 25000, bookings: 280, avgTicket: 89 },
  { month: 'Jun', revenue: 28000, bookings: 310, avgTicket: 90 }
]

const servicePerformance = [
  { name: 'Haircut', bookings: 450, revenue: 22500, growth: 12 },
  { name: 'Color', bookings: 280, revenue: 42000, growth: 8 },
  { name: 'Spa', bookings: 120, revenue: 30000, growth: 15 },
  { name: 'Nails', bookings: 200, revenue: 10000, growth: -5 },
  { name: 'Makeup', bookings: 90, revenue: 13500, growth: 20 }
]

const customerSegments = [
  { name: 'New', value: 25, count: 150 },
  { name: 'Regular', value: 45, count: 270 },
  { name: 'VIP', value: 20, count: 120 },
  { name: 'Inactive', value: 10, count: 60 }
]

const hourlyBookings = Array.from({ length: 12 }, (_, i) => ({
  hour: `${i + 9}:00`,
  bookings: Math.floor(Math.random() * 10) + 2
}))

function MetricCard({ title, value, change, changeType, icon: Icon, prefix = '', suffix = '' }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {prefix}{value}{suffix}
        </div>
        {change !== undefined && (
          <div className={`flex items-center text-xs mt-1 ${
            changeType === 'positive' ? 'text-green-600' :
            changeType === 'negative' ? 'text-red-600' :
            'text-muted-foreground'
          }`}>
            {changeType === 'positive' ? (
              <ArrowUp className="h-3 w-3 mr-1" />
            ) : changeType === 'negative' ? (
              <ArrowDown className="h-3 w-3 mr-1" />
            ) : null}
            {change}% from last period
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function SalonAnalytics({ salonId }: SalonAnalyticsProps) {
  const [timeRange, setTimeRange] = useState('month')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    setTimeout(() => setLoading(false), 1500)
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1000)
  }

  const handleExport = () => {
    // TODO: Implement export functionality
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-3 w-32 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <AnalyticsControls
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onExport={handleExport}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Revenue"
          value="28,000"
          prefix="$"
          change={12}
          changeType="positive"
          icon={DollarSign}
        />
        <MetricCard
          title="Total Bookings"
          value="310"
          change={8}
          changeType="positive"
          icon={Calendar}
        />
        <MetricCard
          title="Average Ticket"
          value="90"
          prefix="$"
          change={3}
          changeType="positive"
          icon={TrendingUp}
        />
        <MetricCard
          title="Customer Retention"
          value="78"
          suffix="%"
          change={-2}
          changeType="negative"
          icon={Users}
        />
      </div>

      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue">
          <RevenueDashboard revenueData={revenueData} servicePerformance={servicePerformance} />
        </TabsContent>

        <TabsContent value="bookings">
          <AppointmentAnalytics hourlyBookings={hourlyBookings} />
        </TabsContent>

        <TabsContent value="customers">
          <CustomerInsights customerSegments={customerSegments} />
        </TabsContent>

        <TabsContent value="services">
          <ServicePerformance servicePerformance={servicePerformance} />
        </TabsContent>
      </Tabs>
    </div>
  )
}