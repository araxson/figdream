'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useEffect, useCallback, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils/format'

type ServiceData = {
  name: string
  bookings: number
  revenue: number
  percentage: number
}

export function TopServices() {
  const [services, setServices] = useState<ServiceData[]>([])
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

      // Get appointment services from last 30 days
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data: appointmentServices } = await supabase
        .from('appointment_services')
        .select(`
          services(id, name, price),
          appointments!inner(
            appointment_date,
            status,
            salon_id
          )
        `)
        .eq('appointments.salon_id', salon.id)
        .eq('appointments.status', 'completed')
        .gte('appointments.appointment_date', thirtyDaysAgo.toISOString().split('T')[0])

      if (appointmentServices) {
        // Group by service
        const serviceStats = appointmentServices.reduce((acc, item) => {
          if (item.services) {
            const serviceId = item.services.id
            if (!acc[serviceId]) {
              acc[serviceId] = {
                name: item.services.name,
                bookings: 0,
                revenue: 0
              }
            }
            acc[serviceId].bookings++
            acc[serviceId].revenue += item.services.price || 0
          }
          return acc
        }, {} as Record<string, { name: string; bookings: number; revenue: number }>)

        // Sort by bookings and take top 5
        const sortedServices = Object.values(serviceStats)
          .sort((a, b) => b.bookings - a.bookings)
          .slice(0, 5)

        const maxBookings = Math.max(...sortedServices.map(s => s.bookings), 1)

        const formattedServices = sortedServices.map(service => ({
          ...service,
          percentage: (service.bookings / maxBookings) * 100
        }))

        setServices(formattedServices)
      }
    } catch (error) {
      console.error('Error fetching top services:', error)
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
        <CardDescription>Most popular services by bookings (last 30 days)</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            Loading services data...
          </div>
        ) : services.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            No service data available
          </div>
        ) : (
          <div className="space-y-4">
            {services.map((service) => (
              <div key={service.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{service.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {service.bookings} bookings • {formatCurrency(service.revenue)}
                  </p>
                </div>
                <Progress value={service.percentage} className="h-2" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}