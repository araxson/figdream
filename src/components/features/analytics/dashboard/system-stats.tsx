'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building, Users, Calendar, DollarSign } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils/format'

export function SystemStats() {
  const [stats, setStats] = useState({
    totalSalons: 0,
    totalUsers: 0,
    totalAppointments: 0,
    totalRevenue: 0
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchSystemStats = useCallback(async () => {
    try {
      // Get salon count
      const { count: salonCount } = await supabase
        .from('salons')
        .select('*', { count: 'exact', head: true })

      // Get user count
      const { count: userCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })

      // Get appointment count for this month
      const monthStart = new Date()
      monthStart.setDate(1)
      monthStart.setHours(0, 0, 0, 0)
      
      const { count: appointmentCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', monthStart.toISOString())

      // Get total revenue for this month
      const { data: completedAppointments } = await supabase
        .from('appointments')
        .select('computed_total_price')
        .eq('status', 'completed')
        .gte('completed_at', monthStart.toISOString())

      const totalRevenue = completedAppointments?.reduce((sum, a) => sum + (a.computed_total_price || 0), 0) || 0

      setStats({
        totalSalons: salonCount || 0,
        totalUsers: userCount || 0,
        totalAppointments: appointmentCount || 0,
        totalRevenue
      })
    } catch {
      // Error handled silently
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchSystemStats()
  }, [fetchSystemStats])

  const cards = [
    {
      title: 'Total Salons',
      value: stats.totalSalons.toLocaleString(),
      icon: Building,
      description: 'Active salons'
    },
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      description: 'Registered users'
    },
    {
      title: 'Monthly Appointments',
      value: stats.totalAppointments.toLocaleString(),
      icon: Calendar,
      description: 'This month'
    },
    {
      title: 'Monthly Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      description: 'Platform revenue'
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
              <div className="text-2xl font-bold">
                {loading ? '...' : card.value}
              </div>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}