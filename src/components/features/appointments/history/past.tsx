'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, MapPin, Star } from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'
import { formatDate, formatTime, formatDuration } from '@/lib/utils/format'

type Appointment = Database['public']['Tables']['appointments']['Row'] & {
  salons: Database['public']['Tables']['salons']['Row']
  staff_profiles: Database['public']['Tables']['staff_profiles']['Row'] & {
    profiles: Database['public']['Tables']['profiles']['Row']
  }
  appointment_services: Array<{
    services: Database['public']['Tables']['services']['Row']
    duration_minutes: number
    price: number
  }>
  reviews?: Array<{
    rating: number
    comment: string | null
  }>
}

export function PastAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchPastAppointments = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get customer profile
      const { data: customer } = await supabase
        .from('customers')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!customer) return

      const today = new Date().toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          salons(*),
          staff_profiles(
            *,
            profiles(*)
          ),
          appointment_services(
            duration_minutes,
            price,
            services(*)
          ),
          reviews(
            rating,
            comment
          )
        `)
        .eq('customer_id', customer.id)
        .or(`appointment_date.lt.${today},status.in.(completed,cancelled,no_show)`)
        .order('appointment_date', { ascending: false })
        .order('start_time', { ascending: false })
        .limit(10)

      if (error) throw error
      setAppointments(data || [])
    } catch (error) {
      console.error('Error fetching past appointments:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase])
   
  useEffect(() => {
    fetchPastAppointments()
  }, [fetchPastAppointments])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Past Appointments</CardTitle>
          <CardDescription>Your appointment history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            Loading history...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Past Appointments</CardTitle>
        <CardDescription>Your appointment history</CardDescription>
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">
            No past appointments
          </p>
        ) : (
          <div className="space-y-4">
            {appointments.map((apt) => {
              const services = apt.appointment_services?.map(as => as.services?.name).filter(Boolean).join(', ') || 'Service'
              const totalDuration = apt.appointment_services?.reduce((sum, as) => sum + as.duration_minutes, 0) || 30
              const totalPrice = apt.appointment_services?.reduce((sum, as) => sum + as.price, 0) || 0
              const staffName = apt.staff_profiles?.profiles?.full_name || apt.staff_profiles?.profiles?.email || 'Staff'
              const hasReview = apt.reviews && apt.reviews.length > 0

              return (
                <div key={apt.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="font-semibold">{services}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(apt.appointment_date)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatTime(apt.start_time)}</span>
                        </div>
                        <span>{formatDuration(totalDuration)}</span>
                      </div>
                    </div>
                    <Badge 
                      variant={
                        apt.status === 'completed' ? 'default' : 
                        apt.status === 'cancelled' ? 'destructive' : 
                        'secondary'
                      }
                    >
                      {apt.status}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span>{apt.salons?.name}</span>
                    </div>
                    <span className="text-muted-foreground">with {staffName}</span>
                  </div>

                  {hasReview && (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-3 w-3 ${i < apt.reviews![0].rating ? 'fill-current text-yellow-500' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <span className="text-muted-foreground">You rated this appointment</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="font-semibold">${totalPrice}</span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Book Again</Button>
                      {!hasReview && apt.status === 'completed' && (
                        <Button variant="outline" size="sm">
                          <Star className="mr-2 h-3 w-3" />
                          Review
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}