'use client'

import { lazy, Suspense, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CalendarIcon, RefreshCw } from 'lucide-react'
import {
  ChartWithSuspense,
  TableWithSuspense,
  StatsWithSuspense,
  ChartSkeleton,
  TableSkeleton,
  StatsSkeleton
} from '@/core/performance/components/suspense-boundaries'
import { markPerformance, observeWebVitals, reportMetrics } from '@/core/performance/utils/metrics'
import { cache } from '@/core/performance/utils/cache'
import type { DashboardMetrics, RevenueChartData, StaffPerformance } from '../types'

// Lazy load heavy components
const MetricsCards = lazy(() => import('./metrics-cards').then(m => ({ default: m.MetricsCards })))
const RevenueChart = lazy(() => import('./revenue-chart').then(m => ({ default: m.RevenueChart })))
const TodayAppointments = lazy(() => import('./today-appointments').then(m => ({ default: m.TodayAppointments })))
const StaffPerformanceTable = lazy(() => import('./staff-performance').then(m => ({ default: m.StaffPerformanceTable })))
const QuickActions = lazy(() => import('./quick-actions').then(m => ({ default: m.QuickActions })))

interface DashboardOptimizedProps {
  salonId: string
  initialMetrics?: DashboardMetrics | null
  initialRevenue?: RevenueChartData[]
  initialAppointments?: any[]
  initialStaff?: StaffPerformance[]
}

export function DashboardOptimized({
  salonId,
  initialMetrics,
  initialRevenue = [],
  initialAppointments = [],
  initialStaff = []
}: DashboardOptimizedProps) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(initialMetrics || null)
  const [revenueData, setRevenueData] = useState<RevenueChartData[]>(initialRevenue)
  const [appointments, setAppointments] = useState(initialAppointments)
  const [staffData, setStaffData] = useState<StaffPerformance[]>(initialStaff)
  const [loading, setLoading] = useState(!initialMetrics)
  const [refreshing, setRefreshing] = useState(false)
  const [dateRange, setDateRange] = useState('30')

  // Track performance metrics
  useEffect(() => {
    markPerformance('dashboard-mount')

    // Observe Core Web Vitals
    const metrics: any[] = []
    observeWebVitals((metric) => {
      metrics.push(metric)
      console.log('Performance metric:', metric)

      // Report metrics when we have all vitals
      if (metrics.length >= 3) {
        reportMetrics(metrics)
      }
    })

    // Prefetch data for common navigation paths
    const prefetchData = async () => {
      // Prefetch appointments for next tab
      await cache.prefetch(
        `/api/appointments?salon_id=${salonId}`,
        async () => {
          const res = await fetch(`/api/appointments?salon_id=${salonId}`)
          return res.json()
        },
        { ttl: 5 * 60 * 1000 }
      )

      // Prefetch staff data
      await cache.prefetch(
        `/api/staff?salon_id=${salonId}`,
        async () => {
          const res = await fetch(`/api/staff?salon_id=${salonId}`)
          return res.json()
        },
        { ttl: 10 * 60 * 1000 }
      )
    }

    // Start prefetching after initial render
    const timer = setTimeout(prefetchData, 1000)

    return () => {
      clearTimeout(timer)
      markPerformance('dashboard-unmount')
    }
  }, [salonId])

  const handleRefresh = async () => {
    setRefreshing(true)
    markPerformance('refresh-start')

    try {
      // Invalidate cache and fetch fresh data
      cache.invalidate(new RegExp(`^/api/.*salon_id=${salonId}`))

      // Fetch all data in parallel
      const [metricsRes, revenueRes, appointmentsRes, staffRes] = await Promise.all([
        fetch(`/api/dashboard/metrics?salon_id=${salonId}&range=${dateRange}`),
        fetch(`/api/dashboard/revenue?salon_id=${salonId}&range=${dateRange}`),
        fetch(`/api/dashboard/appointments?salon_id=${salonId}`),
        fetch(`/api/dashboard/staff?salon_id=${salonId}`)
      ])

      const [newMetrics, newRevenue, newAppointments, newStaff] = await Promise.all([
        metricsRes.json(),
        revenueRes.json(),
        appointmentsRes.json(),
        staffRes.json()
      ])

      setMetrics(newMetrics)
      setRevenueData(newRevenue)
      setAppointments(newAppointments)
      setStaffData(newStaff)

      markPerformance('refresh-end')
    } catch (error) {
      console.error('Failed to refresh dashboard:', error)
    } finally {
      setRefreshing(false)
    }
  }

  const handleDateRangeChange = async (value: string) => {
    setDateRange(value)
    markPerformance('date-range-change')

    // Use cached data fetching
    const data = await cache.fetch(
      `/api/dashboard/revenue?salon_id=${salonId}&range=${value}`,
      async () => {
        const res = await fetch(`/api/dashboard/revenue?salon_id=${salonId}&range=${value}`)
        return res.json()
      },
      { ttl: 5 * 60 * 1000, staleWhileRevalidate: 60 * 1000 }
    )

    setRevenueData(data)
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

      {/* Metrics Cards with Suspense */}
      <StatsWithSuspense>
        <MetricsCards metrics={metrics} loading={loading} />
      </StatsWithSuspense>

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
              <ChartWithSuspense>
                <RevenueChart data={revenueData} loading={loading} />
              </ChartWithSuspense>
            </div>
            <div className="col-span-3 space-y-4">
              <Suspense fallback={<TableSkeleton rows={3} columns={3} />}>
                <TodayAppointments appointments={appointments} loading={loading} />
              </Suspense>
              <Suspense fallback={<StatsSkeleton cards={2} />}>
                <QuickActions salonId={salonId} />
              </Suspense>
            </div>
          </div>
          <TableWithSuspense>
            <StaffPerformanceTable staff={staffData} loading={loading} />
          </TableWithSuspense>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <ChartWithSuspense>
            <RevenueChart data={revenueData} loading={loading} />
          </ChartWithSuspense>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Additional analytics components will be lazy loaded on demand */}
          </div>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-4">
          <TableWithSuspense>
            <TodayAppointments appointments={appointments} loading={loading} />
          </TableWithSuspense>
        </TabsContent>

        <TabsContent value="staff" className="space-y-4">
          <TableWithSuspense>
            <StaffPerformanceTable staff={staffData} loading={loading} />
          </TableWithSuspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}

import { useState } from 'react'