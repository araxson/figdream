'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { default as RevenueChart } from '@/components/salon-owner/analytics/revenue-chart'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/database/supabase/client'
import { Skeleton } from '@/components/ui'
import { TrendingUp, TrendingDown } from 'lucide-react'
interface RevenueSectionProps {
  salonId: string
}
export function RevenueSection({ salonId }: RevenueSectionProps) {
  const [loading, setLoading] = useState(true)
  const [revenueData, setRevenueData] = useState<{
    current: number
    previous: number
    growth: number
    chartData: Array<{ name: string; value: number }>
  }>({
    current: 0,
    previous: 0,
    growth: 0,
    chartData: []
  })
  useEffect(() => {
    async function fetchRevenue() {
      const supabase = createClient()
      // Get current month boundaries
      const now = new Date()
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
      // Fetch current and previous month data
      const [currentMonthData, previousMonthData] = await Promise.all([
        supabase
          .from('appointments')
          .select('total_amount, created_at, status')
          .eq('salon_id', salonId)
          .eq('status', 'completed')
          .gte('created_at', currentMonthStart.toISOString())
          .order('created_at', { ascending: true }),
        supabase
          .from('appointments')
          .select('total_amount, created_at, status')
          .eq('salon_id', salonId)
          .eq('status', 'completed')
          .gte('created_at', previousMonthStart.toISOString())
          .lte('created_at', previousMonthEnd.toISOString())
      ])
      const currentMonthTotal = currentMonthData.data?.reduce((sum, apt) => sum + (apt.total_amount || 0), 0) || 0
      const previousMonthTotal = previousMonthData.data?.reduce((sum, apt) => sum + (apt.total_amount || 0), 0) || 0
      // Calculate actual growth percentage
      const growth = previousMonthTotal > 0 
        ? ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100
        : currentMonthTotal > 0 ? 100 : 0
      // Group current month data by day for chart
      const chartData = currentMonthData.data?.reduce((acc: Array<{ date: string; revenue: number }>, apt) => {
        const date = new Date(apt.created_at).toLocaleDateString()
        const existing = acc.find(d => d.date === date)
        if (existing) {
          existing.revenue += apt.total_amount || 0
        } else {
          acc.push({ date, revenue: apt.total_amount || 0 })
        }
        return acc
      }, []) || []
      setRevenueData({
        current: currentMonthTotal,
        previous: previousMonthTotal,
        growth: Math.round(growth * 10) / 10, // Round to 1 decimal place
        chartData
      })
      setLoading(false)
    }
    fetchRevenue()
  }, [salonId])
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
          <CardDescription>Monthly revenue trends and analytics</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    )
  }
  const isPositiveGrowth = revenueData.growth >= 0
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Monthly revenue trends and analytics</CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Current Month</p>
              <p className="text-2xl font-bold">${revenueData.current.toFixed(2)}</p>
            </div>
            <div className={`flex items-center gap-1 ${isPositiveGrowth ? 'text-green-600' : 'text-red-600'}`}>
              {isPositiveGrowth ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              <span className="text-sm font-medium">{Math.abs(revenueData.growth)}%</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <RevenueChart data={revenueData.chartData} />
      </CardContent>
    </Card>
  )
}