'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'
import { formatCurrency } from '@/lib/utils/format'

type Service = Database['public']['Tables']['services']['Row']

interface AppointmentService {
  service_id: string
  // Add other properties if they exist
}

interface ServiceStats {
  service: Service
  bookingCount: number
  revenue: number
  percentage: number
}

export function TopServices() {
  const [topServices, setTopServices] = useState<ServiceStats[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchTopServices = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: salon } = await supabase
        .from('salons')
        .select('id')
        .eq('created_by', user.id)
        .single()

      if (!salon) return

      // Get services
      const { data: services } = await supabase
        .from('services')
        .select('*')
        .eq('salon_id', salon.id)

      if (!services) return

      // Get appointments for last 30 days
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      
      const { data: appointments } = await supabase
        .from('appointments')
        .select('services, computed_total_price')
        .eq('salon_id', salon.id)
        .gte('created_at', thirtyDaysAgo.toISOString())

      if (!appointments) return

      // Calculate stats
      const serviceStats: Record<string, { count: number; revenue: number }> = {}
      let totalBookings = 0

      appointments.forEach(apt => {
        // Parse services JSON if it exists
        const servicesArray = apt.services as AppointmentService[] | null
        if (servicesArray && Array.isArray(servicesArray)) {
          servicesArray.forEach(service => {
            if (service.service_id) {
              if (!serviceStats[service.service_id]) {
                serviceStats[service.service_id] = { count: 0, revenue: 0 }
              }
              serviceStats[service.service_id].count++
              serviceStats[service.service_id].revenue += (apt.computed_total_price || 0) / servicesArray.length
              totalBookings++
            }
          })
        }
      })

      // Create top services list
      const stats: ServiceStats[] = services
        .map(service => ({
          service,
          bookingCount: serviceStats[service.id]?.count || 0,
          revenue: serviceStats[service.id]?.revenue || 0,
          percentage: totalBookings > 0 
            ? ((serviceStats[service.id]?.count || 0) / totalBookings) * 100
            : 0
        }))
        .sort((a, b) => b.bookingCount - a.bookingCount)
        .slice(0, 5)

      setTopServices(stats)
    } catch {
      // Error handled silently
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchTopServices()
  }, [fetchTopServices])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Services</CardTitle>
        <CardDescription>Most popular services this month</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : topServices.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            No service data available
          </p>
        ) : (
          <div className="space-y-4">
            {topServices.map((stat, index) => (
              <div key={stat.service.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{index + 1}.</span>
                    <span className="text-sm">{stat.service.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {stat.bookingCount} bookings
                  </span>
                </div>
                <Progress value={stat.percentage} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{stat.percentage.toFixed(1)}% of total</span>
                  <span>{formatCurrency(stat.revenue)} revenue</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}