'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, CreditCard, TrendingUp, Users } from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils/format'

interface PlatformStats {
  totalSalons: number
  totalUsers: number
  totalRevenue: number
  monthlyGrowth: number
  activeSubscriptions: number
  revenueGrowth: number
}

export function PlatformStats() {
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

   
  const fetchPlatformStats = useCallback(async () => {
    try {
      // Fetch salon count
      const { count: salonCount } = await supabase
        .from('salons')
        .select('*', { count: 'exact', head: true })

      // Fetch user count
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      // Fetch active subscriptions
      const { data: subscriptions } = await supabase
        .from('platform_subscriptions')
        .select('*')
        .eq('status', 'active')

      // Calculate revenue (from platform subscriptions)
      const currentMonth = new Date()
      const lastMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
      
      const { data: currentMonthRevenue } = await supabase
        .from('platform_subscriptions')
        .select('amount')
        .gte('created_at', currentMonth.toISOString().slice(0, 7) + '-01')

      const { data: lastMonthRevenue } = await supabase
        .from('platform_subscriptions')
        .select('amount')
        .gte('created_at', lastMonth.toISOString().slice(0, 7) + '-01')
        .lt('created_at', currentMonth.toISOString().slice(0, 7) + '-01')

      const currentRevenue = currentMonthRevenue?.reduce((sum, sub) => sum + (sub.amount || 0), 0) || 0
      const lastRevenue = lastMonthRevenue?.reduce((sum, sub) => sum + (sub.amount || 0), 0) || 0
      const revenueGrowth = lastRevenue > 0 ? ((currentRevenue - lastRevenue) / lastRevenue) * 100 : 0

      // Calculate user growth
      const { count: newUsersThisMonth } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', currentMonth.toISOString().slice(0, 7) + '-01')

      const { count: newUsersLastMonth } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', lastMonth.toISOString().slice(0, 7) + '-01')
        .lt('created_at', currentMonth.toISOString().slice(0, 7) + '-01')

      const userGrowth = (newUsersLastMonth || 0) > 0
        ? (((newUsersThisMonth || 0) - (newUsersLastMonth || 0)) / (newUsersLastMonth || 1)) * 100
        : 0

      setStats({
        totalSalons: salonCount || 0,
        totalUsers: userCount || 0,
        totalRevenue: currentRevenue,
        monthlyGrowth: userGrowth,
        activeSubscriptions: subscriptions?.length || 0,
        revenueGrowth: revenueGrowth
      })
    } catch (error) {
      console.error('Error fetching platform stats:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchPlatformStats()
  }, [fetchPlatformStats])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-20" />
              <Skeleton className="h-3 w-32 mt-1" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Salons</CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.totalSalons || 0}</div>
          <p className="text-xs text-muted-foreground">
            {stats?.activeSubscriptions || 0} active subscriptions
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
          <p className="text-xs text-muted-foreground">
            {(stats?.monthlyGrowth || 0) > 0 ? '+' : ''}{(stats?.monthlyGrowth || 0).toFixed(1)}% this month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats?.totalRevenue || 0)}</div>
          <p className="text-xs text-muted-foreground">
            {(stats?.revenueGrowth || 0) > 0 ? '+' : ''}{(stats?.revenueGrowth || 0).toFixed(1)}% from last month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {(stats?.monthlyGrowth || 0) > 0 ? '+' : ''}{(stats?.monthlyGrowth || 0).toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">
            Monthly user growth
          </p>
        </CardContent>
      </Card>
    </div>
  )
}