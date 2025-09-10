'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { useEffect, useCallback, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'
import { formatCurrency } from '@/lib/utils/format'

type Service = Database['public']['Tables']['services']['Row']
type ServiceCategory = Database['public']['Tables']['service_categories']['Row']

type ServiceWithStats = Service & {
  service_categories: ServiceCategory | null
  bookingCount: number
  revenue: number
  priceChange: number
}

export function ServicePricing() {
  const [services, setServices] = useState<ServiceWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchServicePricing = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: salon } = await supabase
        .from('salons')
        .select('id')
        .eq('created_by', user.id)
        .single()

      if (!salon) return

      // Fetch services with categories
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select(`
          *,
          service_categories(*)
        `)
        .eq('salon_id', salon.id)
        .order('price', { ascending: false })

      if (servicesError) throw servicesError

      // Fetch appointment statistics for each service
      const servicesWithStats = await Promise.all((servicesData || []).map(async (service) => {
        // Get booking count
        const { count: bookingCount } = await supabase
          .from('appointment_services')
          .select('*', { count: 'exact', head: true })
          .eq('service_id', service.id)

        // Get revenue
        const { data: appointmentData } = await supabase
          .from('appointment_services')
          .select(`
            appointments!inner(
              computed_total_price,
              status
            )
          `)
          .eq('service_id', service.id)

        const revenue = appointmentData?.reduce((sum, item) => {
          if (item.appointments?.status === 'completed') {
            return sum + (item.appointments?.computed_total_price || 0)
          }
          return sum
        }, 0) || 0

        // Simulate price change for demo
        const priceChange = Math.random() > 0.5 ? Math.random() * 20 - 10 : 0

        return {
          ...service,
          bookingCount: bookingCount || 0,
          revenue,
          priceChange
        }
      }))

      setServices(servicesWithStats)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching service pricing:', error)
      }
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchServicePricing()
  }, [fetchServicePricing])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Service Pricing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            Loading pricing data...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pricing Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Average Price</p>
              <p className="text-2xl font-bold">
                {formatCurrency(
                  services.reduce((sum, s) => sum + s.price, 0) / (services.length || 1)
                )}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold">
                {formatCurrency(services.reduce((sum, s) => sum + s.revenue, 0))}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Most Popular Service</p>
              <p className="text-2xl font-bold">
                {services.sort((a, b) => b.bookingCount - a.bookingCount)[0]?.name || 'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Service Pricing Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {services.map((service) => (
              <div key={service.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold">{service.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {service.service_categories?.name || 'Uncategorized'}
                    </p>
                    <div className="flex gap-4 mt-2">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Bookings: </span>
                        <span className="font-medium">{service.bookingCount}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Revenue: </span>
                        <span className="font-medium">{formatCurrency(service.revenue)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <div className="text-2xl font-bold">{formatCurrency(service.price)}</div>
                    {service.priceChange !== 0 && (
                      <div className="flex items-center gap-1 justify-end">
                        {service.priceChange > 0 ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                        <span className={service.priceChange > 0 ? 'text-green-600' : 'text-red-600'}>
                          {Math.abs(service.priceChange).toFixed(1)}%
                        </span>
                      </div>
                    )}
                    <Button size="sm" variant="outline">
                      Update Price
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}