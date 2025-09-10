'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, UserCheck, TrendingUp, DollarSign, Calendar, Star } from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'


export function CustomerMetrics() {
  const [metrics, setMetrics] = useState({
    totalCustomers: 0,
    newThisMonth: 0,
    activeCustomers: 0,
    averageLifetimeValue: 0,
    retentionRate: 0,
    averageRating: 0
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchMetrics = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: salon } = await supabase
        .from('salons')
        .select('id')
        .eq('created_by', user.id)
        .single()

      if (!salon) return

      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())

      // Total customers (unique customers who have appointments)
      const { data: allAppointments } = await supabase
        .from('appointments')
        .select('customer_id')
        .eq('salon_id', salon.id)
      
      const uniqueCustomers = new Set(allAppointments?.map(a => a.customer_id) || [])
      const totalCustomers = uniqueCustomers.size

      // New customers this month (customers with first appointment this month)
      const { data: newCustomerAppointments } = await supabase
        .from('appointments')
        .select('customer_id')
        .eq('salon_id', salon.id)
        .gte('created_at', startOfMonth.toISOString())
      
      const uniqueNewCustomers = new Set(newCustomerAppointments?.map(a => a.customer_id) || [])
      const newThisMonth = uniqueNewCustomers.size

      // Active customers (visited in last 3 months)
      const { data: activeCustomersData } = await supabase
        .from('appointments')
        .select('customer_id')
        .eq('salon_id', salon.id)
        .gte('appointment_date', threeMonthsAgo.toISOString())
        .eq('status', 'completed')

      const uniqueActiveCustomers = new Set(activeCustomersData?.map(a => a.customer_id) || [])
      const activeCustomers = uniqueActiveCustomers.size

      // Average lifetime value from completed appointments
      const { data: completedAppointments } = await supabase
        .from('appointments')
        .select('computed_total_price, customer_id')
        .eq('salon_id', salon.id)
        .eq('status', 'completed')

      const customerTotals = completedAppointments?.reduce((acc, appointment) => {
        if (appointment.customer_id) {
          acc[appointment.customer_id] = (acc[appointment.customer_id] || 0) + (appointment.computed_total_price || 0)
        }
        return acc
      }, {} as Record<string, number>) || {}

      const averageLifetimeValue = Object.values(customerTotals).length > 0
        ? Object.values(customerTotals).reduce((sum, val) => sum + val, 0) / Object.values(customerTotals).length
        : 0

      // Retention rate
      const retentionRate = totalCustomers ? (activeCustomers / totalCustomers) * 100 : 0

      // Average rating
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('rating')
        .eq('salon_id', salon.id)

      const averageRating = reviewsData?.length
        ? reviewsData.reduce((sum, r) => sum + r.rating, 0) / reviewsData.length
        : 0

      setMetrics({
        totalCustomers: totalCustomers || 0,
        newThisMonth: newThisMonth || 0,
        activeCustomers,
        averageLifetimeValue,
        retentionRate,
        averageRating
      })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching customer metrics:', error)
      }
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchMetrics()
  }, [fetchMetrics])

  const metricsCards = [
    {
      title: 'Total Customers',
      value: metrics.totalCustomers.toLocaleString(),
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'New This Month',
      value: metrics.newThisMonth.toLocaleString(),
      icon: UserCheck,
      color: 'text-green-600'
    },
    {
      title: 'Active Customers',
      value: metrics.activeCustomers.toLocaleString(),
      icon: TrendingUp,
      color: 'text-purple-600'
    },
    {
      title: 'Avg. Lifetime Value',
      value: `$${metrics.averageLifetimeValue.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-orange-600'
    },
    {
      title: 'Retention Rate',
      value: `${metrics.retentionRate.toFixed(1)}%`,
      icon: Calendar,
      color: 'text-indigo-600'
    },
    {
      title: 'Avg. Rating',
      value: metrics.averageRating.toFixed(1),
      icon: Star,
      color: 'text-yellow-600'
    }
  ]

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-32"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {metricsCards.map((metric) => (
        <Card key={metric.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
            <metric.icon className={`h-4 w-4 ${metric.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}