'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, MapPin, User } from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'
import { formatDate, formatTime, formatCurrency } from '@/lib/utils/format'

type Appointment = Database['public']['Tables']['appointments']['Row'] & {
  salons: Database['public']['Tables']['salons']['Row']
  appointment_services: Array<{
    services: Database['public']['Tables']['services']['Row']
  }>
  staff_profiles: {
    profiles: Database['public']['Tables']['profiles']['Row']
  }
}

export function AppointmentsList() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchAppointments = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get customer record
      const { data: customer } = await supabase
        .from('customers')
        .select('id')
        .eq('auth_user_id', user.id)
        .single()

      if (!customer) return

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          salons(*),
          appointment_services(
            services(*)
          ),
          staff_profiles(
            profiles(*)
          )
        `)
        .eq('customer_id', customer.id)
        .gte('appointment_date', new Date().toISOString().split('T')[0])
        .order('appointment_date')
        .order('start_time')

      if (error) throw error
      setAppointments(data || [])
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching appointments:', error)
      }
    } finally {
      setLoading(false)
    }
  }, [supabase])
   
  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  const getStatusBadge = (status: Database['public']['Enums']['appointment_status']) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="default">Confirmed</Badge>
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>
      case 'completed':
        return <Badge variant="outline">Completed</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Appointments</CardTitle>
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
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No upcoming appointments. Book your next appointment to get started!
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{appointment.salons?.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <MapPin className="h-3 w-3" />
                      {appointment.salons?.address}
                    </div>
                  </div>
                  {getStatusBadge(appointment.status)}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(appointment.appointment_date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{formatTime(appointment.start_time)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{appointment.staff_profiles?.profiles?.full_name || 'Staff'}</span>
                  </div>
                  <div className="text-sm font-semibold">
                    {formatCurrency(appointment.computed_total_price || 0)}
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <p className="text-sm font-medium mb-1">Services:</p>
                  <div className="flex flex-wrap gap-2">
                    {appointment.appointment_services?.map((as, index) => (
                      <Badge key={index} variant="secondary">
                        {as.services?.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                {appointment.status === 'confirmed' && (
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      Reschedule
                    </Button>
                    <Button size="sm" variant="destructive" className="flex-1">
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}