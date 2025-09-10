'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, DollarSign, Users, Clock } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils/format'

export function StatsCards() {
  const [stats, setStats] = useState({
    todayAppointments: 0,
    weekRevenue: 0,
    newCustomers: 0,
    avgServiceTime: 0
  })
  const [, setLoading] = useState(true)
  const supabase = createClient()

  const fetchStats = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: salon } = await supabase
        .from('salons')
        .select('id')
        .eq('created_by', user.id)
        .single()

      if (!salon) return

      const today = new Date().toISOString().split('T')[0]
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

      // Today's appointments
      const { count: appointmentCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('salon_id', salon.id)
        .eq('appointment_date', today)

      // Week revenue from completed appointments
      const { data: completedAppointments } = await supabase
        .from('appointments')
        .select('computed_total_price')
        .eq('salon_id', salon.id)
        .eq('status', 'completed')
        .gte('completed_at', weekAgo)

      const weekRevenue = completedAppointments?.reduce((sum, a) => sum + (a.computed_total_price || 0), 0) || 0

      // New customers this week (unique customers with first appointment)
      const { data: newCustomerAppointments } = await supabase
        .from('appointments')
        .select('customer_id')
        .eq('salon_id', salon.id)
        .gte('created_at', weekAgo)
      
      const uniqueNewCustomers = new Set(newCustomerAppointments?.map(a => a.customer_id) || [])
      const newCustomerCount = uniqueNewCustomers.size

      // Average service time
      const { data: services } = await supabase
        .from('services')
        .select('duration_minutes')
        .eq('salon_id', salon.id)

      const avgTime = services?.length 
        ? services.reduce((sum, s) => sum + s.duration_minutes, 0) / services.length
        : 0

      setStats({
        todayAppointments: appointmentCount || 0,
        weekRevenue,
        newCustomers: newCustomerCount || 0,
        avgServiceTime: avgTime
      })
    } catch {
      // Error handled silently
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const cards = [
    {
      title: "Today's Appointments",
      value: stats.todayAppointments.toString(),
      icon: Calendar,
      description: "Scheduled for today"
    },
    {
      title: "Week Revenue",
      value: formatCurrency(stats.weekRevenue),
      icon: DollarSign,
      description: "Last 7 days"
    },
    {
      title: "New Customers",
      value: stats.newCustomers.toString(),
      icon: Users,
      description: "This week"
    },
    {
      title: "Avg Service Time",
      value: `${Math.round(stats.avgServiceTime)} min`,
      icon: Clock,
      description: "Per appointment"
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}