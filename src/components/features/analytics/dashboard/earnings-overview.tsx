'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { DollarSign, TrendingUp, Award, Clock } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils/format'


interface EarningsData {
  todayEarnings: number
  weekEarnings: number
  monthEarnings: number
  todayTips: number
  appointmentsCompleted: number
  averageServiceValue: number
  commissionRate: number
  targetProgress: number
}

export function EarningsOverview() {
  const [earnings, setEarnings] = useState<EarningsData>({
    todayEarnings: 0,
    weekEarnings: 0,
    monthEarnings: 0,
    todayTips: 0,
    appointmentsCompleted: 0,
    averageServiceValue: 0,
    commissionRate: 50,
    targetProgress: 0
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchEarnings = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: staffProfile } = await supabase
        .from('staff_profiles')
        .select('id, commission_rate')
        .eq('user_id', user.id)
        .single()

      if (!staffProfile) return

      const today = new Date().toISOString().split('T')[0]
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

      // Get staff earnings (which includes tips)
      const { data: earnings } = await supabase
        .from('staff_earnings')
        .select('service_amount, tip_amount, total_earnings, service_date')
        .eq('staff_id', user.id)
        .gte('service_date', monthAgo)

      // Calculate earnings
      let todayEarnings = 0
      let weekEarnings = 0
      let monthEarnings = 0
      let todayTips = 0
      let appointmentsCompleted = 0

      earnings?.forEach(earning => {
        const amount = earning.total_earnings || 0
        monthEarnings += amount
        appointmentsCompleted++

        if (earning.service_date >= weekAgo.split('T')[0]) {
          weekEarnings += amount
        }
        if (earning.service_date === today) {
          todayEarnings += amount
          todayTips += earning.tip_amount || 0
        }
      })

      const averageServiceValue = appointmentsCompleted > 0 
        ? monthEarnings / appointmentsCompleted 
        : 0

      // Simple target progress (assuming $5000 monthly target)
      const monthlyTarget = 5000
      const targetProgress = Math.min((monthEarnings / monthlyTarget) * 100, 100)

      setEarnings({
        todayEarnings: todayEarnings + todayTips,
        weekEarnings,
        monthEarnings,
        todayTips,
        appointmentsCompleted,
        averageServiceValue,
        commissionRate: staffProfile?.commission_rate || 0,
        targetProgress
      })
    } catch {
      // Error handled silently
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchEarnings()
  }, [fetchEarnings])

  const cards = [
    {
      title: "Today's Earnings",
      value: formatCurrency(earnings.todayEarnings),
      icon: DollarSign,
      description: `Including ${formatCurrency(earnings.todayTips)} in tips`
    },
    {
      title: "This Week",
      value: formatCurrency(earnings.weekEarnings),
      icon: TrendingUp,
      description: "Last 7 days"
    },
    {
      title: "This Month",
      value: formatCurrency(earnings.monthEarnings),
      icon: Award,
      description: `${earnings.appointmentsCompleted} appointments`
    },
    {
      title: "Average Service",
      value: formatCurrency(earnings.averageServiceValue),
      icon: Clock,
      description: `At ${earnings.commissionRate}% commission`
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Earnings Overview</CardTitle>
        <CardDescription>Your earnings and performance metrics</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              {cards.map((card, index) => {
                const Icon = card.icon
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{card.title}</span>
                    </div>
                    <p className="text-2xl font-bold">{card.value}</p>
                    <p className="text-xs text-muted-foreground">{card.description}</p>
                  </div>
                )
              })}
            </div>
            
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Monthly Target Progress</span>
                <span className="font-medium">{earnings.targetProgress.toFixed(0)}%</span>
              </div>
              <Progress value={earnings.targetProgress} />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}