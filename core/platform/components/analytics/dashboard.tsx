'use client'

import { useEffect, useState } from 'react'
import { MetricsCards } from './metrics-cards'
import { RevenueChart } from './revenue-chart'
import { TodayAppointments } from './today-appointments'
import { StaffPerformanceTable } from './staff-performance'
import { QuickActions } from './quick-actions'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CalendarIcon, RefreshCw } from 'lucide-react'
import type { DashboardMetrics, RevenueChartData, StaffPerformance } from '../../types'

interface DashboardProps {
  salonId: string
  initialMetrics?: DashboardMetrics | null
  initialRevenue?: RevenueChartData[]
  initialAppointments?: any[]
  initialStaff?: StaffPerformance[]
}

export function Dashboard({
  salonId,
  initialMetrics,
  initialRevenue = [],
  initialAppointments = [],
  initialStaff = []
}: DashboardProps) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(initialMetrics || null)
  const [revenueData, setRevenueData] = useState<RevenueChartData[]>(initialRevenue)
  const [appointments, setAppointments] = useState(initialAppointments)
  const [staffData, setStaffData] = useState<StaffPerformance[]>(initialStaff)
  const [loading, setLoading] = useState(!initialMetrics)
  const [refreshing, setRefreshing] = useState(false)
  const [dateRange, setDateRange] = useState('30')

  const handleRefresh = async () => {
    setRefreshing(true)
    // Fetch fresh data here
    setTimeout(() => setRefreshing(false), 1000)
  }

  const handleDateRangeChange = (value: string) => {
    setDateRange(value)
    // Refetch data based on new date range
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your salon's performance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={dateRange} onValueChange={handleDateRangeChange}>
            <SelectTrigger className="w-[180px]">
              <CalendarIcon className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 3 months</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <MetricsCards metrics={metrics} loading={loading} />

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <div className="col-span-4">
              <RevenueChart data={revenueData} loading={loading} />
            </div>
            <div className="col-span-3 space-y-4">
              <TodayAppointments appointments={appointments} loading={loading} />
              <QuickActions salonId={salonId} />
            </div>
          </div>
          <StaffPerformanceTable staff={staffData} loading={loading} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <RevenueChart data={revenueData} loading={loading} />
          <div className="grid gap-4 md:grid-cols-2">
            {/* Add more analytics components */}
          </div>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-4">
          <TodayAppointments appointments={appointments} loading={loading} />
          {/* Add appointment calendar or list */}
        </TabsContent>

        <TabsContent value="staff" className="space-y-4">
          <StaffPerformanceTable staff={staffData} loading={loading} />
          {/* Add staff schedule and management */}
        </TabsContent>
      </Tabs>
    </div>
  )
}