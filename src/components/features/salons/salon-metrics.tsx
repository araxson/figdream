'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  
  
  Users,
  Calendar,
  
  Star
} from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils/format'

type SalonMetric = {
  salon_id: string
  salon_name: string
  total_appointments: number
  total_revenue: number
  total_customers: number
  average_rating: number
  staff_count: number
  service_count: number
  completion_rate: number
  growth_rate: number
}

export function SalonMetrics() {
  const [metrics, setMetrics] = useState<SalonMetric[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'revenue' | 'appointments' | 'rating'>('revenue')
  const supabase = createClient()

  const fetchMetrics = useCallback(async () => {
    try {
      // Fetch all salons
      const { data: salons } = await supabase
        .from('salons')
        .select('*')
        .eq('is_active', true)

      if (!salons) return

      // Fetch metrics for each salon
      const metricsData: SalonMetric[] = await Promise.all(
        salons.map(async (salon) => {
          // Fetch appointments
          const { count: appointmentCount } = await supabase
            .from('appointments')
            .select('*', { count: 'exact', head: true })
            .eq('salon_id', salon.id)

          // Fetch completed appointments for completion rate
          const { count: completedCount } = await supabase
            .from('appointments')
            .select('*', { count: 'exact', head: true })
            .eq('salon_id', salon.id)
            .eq('status', 'completed')

          // Fetch revenue from completed appointments
          const { data: completedAppointments } = await supabase
            .from('appointments')
            .select('computed_total_price')
            .eq('salon_id', salon.id)
            .eq('status', 'completed')

          const totalRevenue = completedAppointments?.reduce((sum, a) => sum + (a.computed_total_price || 0), 0) || 0

          // Fetch customers
          const { data: customers } = await supabase
            .from('appointments')
            .select('customer_id')
            .eq('salon_id', salon.id)

          const uniqueCustomers = new Set(customers?.map(c => c.customer_id)).size

          // Fetch reviews
          const { data: reviews } = await supabase
            .from('reviews')
            .select('rating')
            .eq('salon_id', salon.id)

          const avgRating = reviews && reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0

          // Fetch staff count
          const { count: staffCount } = await supabase
            .from('staff_profiles')
            .select('*', { count: 'exact', head: true })
            .eq('salon_id', salon.id)
            .eq('is_active', true)

          // Fetch service count
          const { count: serviceCount } = await supabase
            .from('services')
            .select('*', { count: 'exact', head: true })
            .eq('salon_id', salon.id)
            .eq('is_active', true)

          // Calculate completion rate
          const completionRate = appointmentCount && appointmentCount > 0
            ? ((completedCount || 0) / appointmentCount) * 100
            : 0

          // Calculate growth rate (compare this month vs last month)
          const currentDate = new Date()
          const lastMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
          const thisMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
          
          const { count: lastMonthAppointments } = await supabase
            .from('appointments')
            .select('*', { count: 'exact', head: true })
            .eq('salon_id', salon.id)
            .gte('created_at', lastMonthStart.toISOString())
            .lt('created_at', thisMonthStart.toISOString())
          
          const { count: thisMonthAppointments } = await supabase
            .from('appointments')
            .select('*', { count: 'exact', head: true })
            .eq('salon_id', salon.id)
            .gte('created_at', thisMonthStart.toISOString())
          
          const growthRate = lastMonthAppointments && lastMonthAppointments > 0
            ? ((thisMonthAppointments || 0) - lastMonthAppointments) / lastMonthAppointments * 100
            : 0

          return {
            salon_id: salon.id,
            salon_name: salon.name,
            total_appointments: appointmentCount || 0,
            total_revenue: totalRevenue,
            total_customers: uniqueCustomers,
            average_rating: avgRating,
            staff_count: staffCount || 0,
            service_count: serviceCount || 0,
            completion_rate: completionRate,
            growth_rate: growthRate
          }
        })
      )

      // Sort metrics
      const sorted = [...metricsData].sort((a, b) => {
        if (sortBy === 'revenue') return b.total_revenue - a.total_revenue
        if (sortBy === 'appointments') return b.total_appointments - a.total_appointments
        if (sortBy === 'rating') return b.average_rating - a.average_rating
        return 0
      })

      setMetrics(sorted)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching salon metrics:', error)
      }
    } finally {
      setLoading(false)
    }
  }, [supabase, sortBy])

  useEffect(() => {
    fetchMetrics()
  }, [fetchMetrics])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Salon Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            Loading salon metrics...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Salon Performance Metrics</CardTitle>
          <div className="flex gap-2">
            <Badge 
              variant={sortBy === 'revenue' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setSortBy('revenue')}
            >
              Revenue
            </Badge>
            <Badge 
              variant={sortBy === 'appointments' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setSortBy('appointments')}
            >
              Appointments
            </Badge>
            <Badge 
              variant={sortBy === 'rating' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setSortBy('rating')}
            >
              Rating
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {metrics.map((metric, index) => (
            <div key={metric.salon_id} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-sm font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-medium">{metric.salon_name}</h3>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {metric.staff_count} staff
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {metric.service_count} services
                      </span>
                    </div>
                  </div>
                </div>
                <Badge variant={metric.growth_rate > 0 ? 'default' : 'destructive'}>
                  {metric.growth_rate > 0 ? '+' : ''}{metric.growth_rate.toFixed(1)}%
                </Badge>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Revenue</p>
                  <p className="font-semibold">{formatCurrency(metric.total_revenue)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Appointments</p>
                  <p className="font-semibold">{metric.total_appointments}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Customers</p>
                  <p className="font-semibold">{metric.total_customers}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Rating</p>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                    <span className="font-semibold">{metric.average_rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Completion Rate</span>
                  <span className="font-medium">{metric.completion_rate.toFixed(0)}%</span>
                </div>
                <Progress value={metric.completion_rate} className="h-2" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}