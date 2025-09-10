'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DollarSign, TrendingUp, Users } from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils/format'

type RevenueData = {
  totalRevenue: number
  monthlyRevenue: number
  averageTransactionValue: number
  topSalons: Array<{
    salon_id: string
    salon_name: string
    revenue: number
    transaction_count: number
  }>
  revenueByMonth: Array<{
    month: string
    revenue: number
  }>
}

export function RevenueAnalytics() {
  const [data, setData] = useState<RevenueData>({
    totalRevenue: 0,
    monthlyRevenue: 0,
    averageTransactionValue: 0,
    topSalons: [],
    revenueByMonth: []
  })
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('month')
  const supabase = createClient()

  const fetchRevenueData = useCallback(async () => {
    try {
      // Calculate date ranges
      const now = new Date()
      const startDate = timeRange === 'month'
        ? new Date(now.getFullYear(), now.getMonth(), 1)
        : timeRange === 'quarter'
        ? new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
        : new Date(now.getFullYear(), 0, 1)

      // Fetch all completed appointments with revenue
      const { data: payments } = await supabase
        .from('appointments')
        .select(`
          id,
          computed_total_price,
          completed_at,
          salon_id,
          salons(name)
        `)
        .eq('status', 'completed')
        .not('computed_total_price', 'is', null)
        .gte('completed_at', startDate.toISOString())

      if (!payments) return

      // Calculate total revenue
      const totalRevenue = payments.reduce((sum, p) => sum + (p.computed_total_price || 0), 0)

      // Calculate monthly revenue
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const monthlyPayments = payments.filter(p => 
        p.completed_at && new Date(p.completed_at) >= thisMonth
      )
      const monthlyRevenue = monthlyPayments.reduce((sum, p) => sum + (p.computed_total_price || 0), 0)

      // Calculate average transaction value
      const averageTransactionValue = payments.length > 0 
        ? totalRevenue / payments.length 
        : 0

      // Calculate top salons
      const salonRevenue: Record<string, { name: string; revenue: number; count: number }> = {}
      payments.forEach((payment) => {
        const salonId = payment.salon_id
        const salonName = payment.salons?.name || 'Unknown'
        if (salonId) {
          if (!salonRevenue[salonId]) {
            salonRevenue[salonId] = { name: salonName, revenue: 0, count: 0 }
          }
          salonRevenue[salonId].revenue += payment.computed_total_price || 0
          salonRevenue[salonId].count++
        }
      })

      const topSalons = Object.entries(salonRevenue)
        .map(([salon_id, data]) => ({
          salon_id,
          salon_name: data.name,
          revenue: data.revenue,
          transaction_count: data.count
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)

      // Calculate revenue by month
      const revenueByMonth: Record<string, number> = {}
      payments.forEach((payment) => {
        if (payment.completed_at) {
          const month = new Date(payment.completed_at).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short' 
          })
          revenueByMonth[month] = (revenueByMonth[month] || 0) + (payment.computed_total_price || 0)
        }
      })

      setData({
        totalRevenue,
        monthlyRevenue,
        averageTransactionValue,
        topSalons,
        revenueByMonth: Object.entries(revenueByMonth).map(([month, revenue]) => ({
          month,
          revenue
        }))
      })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching revenue data:', error)
      }
    } finally {
      setLoading(false)
    }
  }, [timeRange, supabase])

  useEffect(() => {
    fetchRevenueData()
  }, [fetchRevenueData])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revenue Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            Loading revenue data...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              {timeRange === 'month' ? 'This month' : timeRange === 'quarter' ? 'This quarter' : 'This year'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.monthlyRevenue)}</div>
            <p className="text-xs text-muted-foreground">Current month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Transaction</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data.averageTransactionValue)}
            </div>
            <p className="text-xs text-muted-foreground">Per appointment</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Revenue Breakdown</CardTitle>
            <Tabs value={timeRange} onValueChange={setTimeRange}>
              <TabsList>
                <TabsTrigger value="month">Month</TabsTrigger>
                <TabsTrigger value="quarter">Quarter</TabsTrigger>
                <TabsTrigger value="year">Year</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-3">Top Performing Salons</h3>
              <div className="space-y-2">
                {data.topSalons.map((salon, index) => (
                  <div key={salon.salon_id} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{salon.salon_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {salon.transaction_count} transactions
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(salon.revenue)}</p>
                      <p className="text-xs text-muted-foreground">
                        {((salon.revenue / data.totalRevenue) * 100).toFixed(1)}% of total
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {data.revenueByMonth.length > 0 && (
              <div>
                <h3 className="font-medium mb-3">Monthly Trend</h3>
                <div className="space-y-2">
                  {data.revenueByMonth.map((month) => (
                    <div key={month.month} className="flex items-center justify-between">
                      <span className="text-sm">{month.month}</span>
                      <span className="font-medium">{formatCurrency(month.revenue)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}