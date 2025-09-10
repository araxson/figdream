'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'
import { formatDate, formatTime } from '@/lib/utils/format'

type Appointment = Database['public']['Tables']['appointments']['Row']
type Customer = Database['public']['Tables']['customers']['Row']
type Service = Database['public']['Tables']['services']['Row']

interface AppointmentWithRelations extends Appointment {
  customer: Customer | null
  service: Service | null
}

export function UpcomingAppointments() {
  const [appointments, setAppointments] = useState<AppointmentWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchUpcomingAppointments = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: staffProfile } = await supabase
        .from('staff_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!staffProfile) return

      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)

      const { data } = await supabase
        .from('appointments')
        .select('*')
        .eq('staff_id', staffProfile.id)
        .gte('appointment_date', tomorrow.toISOString().split('T')[0])
        .in('status', ['confirmed', 'pending'])
        .order('appointment_date')
        .order('start_time')
        .limit(5)

      // Map the data to include null customer and service
      const appointmentsWithRelations = (data || []).map(apt => ({
        ...apt,
        customer: null,
        service: null
      }))

      setAppointments(appointmentsWithRelations)
    } catch {
      // Error handled silently
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchUpcomingAppointments()
  }, [fetchUpcomingAppointments])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Appointments</CardTitle>
        <CardDescription>Your next scheduled appointments</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : appointments.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No upcoming appointments
          </p>
        ) : (
          <div className="space-y-3">
            {appointments.map((appointment) => (
              <div 
                key={appointment.id}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    Customer
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Service
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(appointment.appointment_date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTime(appointment.start_time)}
                    </span>
                  </div>
                </div>
                <Badge variant={appointment.status === 'confirmed' ? 'default' : 'secondary'}>
                  {appointment.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}