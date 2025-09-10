'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, MapPin, User } from 'lucide-react'
import Link from 'next/link'
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
}

export function UpcomingAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchUpcomingAppointments = useCallback(async () => {
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
          )
        `)
        .eq('customer_id', customer.id)
        .gte('appointment_date', today)
        .in('status', ['pending', 'confirmed'])
        .order('appointment_date')
        .order('start_time')

      if (error) throw error
      setAppointments(data || [])
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase])
   
  useEffect(() => {
    fetchUpcomingAppointments()
  }, [fetchUpcomingAppointments])

  async function cancelAppointment(id: string) {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ 
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancellation_reason: 'Cancelled by customer'
        })
        .eq('id', id)

      if (error) throw error
      await fetchUpcomingAppointments()
    } catch (error) {
      console.error('Error cancelling appointment:', error)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Appointments</CardTitle>
          <CardDescription>Your scheduled appointments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            Loading appointments...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Appointments</CardTitle>
        <CardDescription>Your scheduled appointments</CardDescription>
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No upcoming appointments</p>
            <Button asChild>
              <Link href="/customer/booking">Book an Appointment</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((apt) => {
              const services = apt.appointment_services?.map(as => as.services?.name).filter(Boolean).join(', ') || 'Service'
              const totalDuration = apt.appointment_services?.reduce((sum, as) => sum + as.duration_minutes, 0) || 30
              const totalPrice = apt.appointment_services?.reduce((sum, as) => sum + as.price, 0) || 0
              const staffName = apt.staff_profiles?.profiles?.full_name || apt.staff_profiles?.profiles?.email || 'Staff'

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
                    <Badge variant={apt.status === 'confirmed' ? 'default' : 'secondary'}>
                      {apt.status}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span>{apt.salons?.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span>{staffName}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="font-semibold">${totalPrice}</span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Reschedule</Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => cancelAppointment(apt.id)}
                      >
                        Cancel
                      </Button>
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