'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DollarSign, TrendingUp, Clock, Users } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils/format'

interface TipStats {
  todayTips: number
  weeklyTips: number
  monthlyTips: number
  averageTip: number
  tippingCustomers: number
  totalCustomers: number
}

export function TipsOverview() {
  const [stats, setStats] = useState<TipStats>({
    todayTips: 0,
    weeklyTips: 0,
    monthlyTips: 0,
    averageTip: 0,
    tippingCustomers: 0,
    totalCustomers: 0
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchTipStats = useCallback(async () => {
    try {
      // Get current user/staff
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: staffProfile } = await supabase
        .from('staff_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!staffProfile) return

      // Calculate tip statistics
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      const monthStart = new Date()
      monthStart.setDate(1)

      // Simulate tip data (in real app, fetch from tips table)
      setStats({
        todayTips: 125.50,
        weeklyTips: 430.75,
        monthlyTips: 1850.25,
        averageTip: 18.50,
        tippingCustomers: 15,
        totalCustomers: 22
      })
    } catch (error) {
      console.error('Error fetching tip stats:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchTipStats()
  }, [fetchTipStats])

  const tippingRate = stats.totalCustomers > 0 
    ? Math.round((stats.tippingCustomers / stats.totalCustomers) * 100)
    : 0

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-8 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Tips</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.todayTips)}</div>
            <Badge variant="secondary" className="mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12% vs yesterday
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.weeklyTips)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {stats.tippingCustomers} appointments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.monthlyTips)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {tippingRate}% of customers tipped
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Tip</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.averageTip)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Per tipping customer
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <Button variant="outline" className="justify-start">
              <DollarSign className="h-4 w-4 mr-2" />
              Record Cash Tip
            </Button>
            <Button variant="outline" className="justify-start">
              <Clock className="h-4 w-4 mr-2" />
              View Tip History
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}