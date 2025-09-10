'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'
import { formatTime } from '@/lib/utils/format'

type Appointment = Database['public']['Tables']['appointments']['Row']
type Customer = Database['public']['Tables']['customers']['Row']
type Service = Database['public']['Tables']['services']['Row']

interface AppointmentWithRelations extends Appointment {
  customer: Customer | null
  service: Service | null
}

export function TodaySchedule() {
  const [appointments, setAppointments] = useState<AppointmentWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchTodaySchedule = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: staffProfile } = await supabase
        .from('staff_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!staffProfile) return

      const today = new Date().toISOString().split('T')[0]

      const { data } = await supabase
        .from('appointments')
        .select('*')
        .eq('staff_id', staffProfile.id)
        .eq('appointment_date', today)
        .order('start_time')

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
    fetchTodaySchedule()
  }, [fetchTodaySchedule])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500'
      case 'pending': return 'bg-yellow-500'
      case 'in_progress': return 'bg-blue-500'
      case 'completed': return 'bg-gray-500'
      default: return 'bg-gray-300'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today&apos;s Schedule</CardTitle>
        <CardDescription>{new Date().toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : appointments.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No appointments scheduled for today
          </p>
        ) : (
          <div className="space-y-3">
            {appointments.map((appointment) => (
              <div 
                key={appointment.id}
                className="flex items-start gap-3 p-3 rounded-lg border bg-card"
              >
                <div className={`w-1 h-full ${getStatusColor(appointment.status)} rounded`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">
                      {formatTime(appointment.start_time)}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {appointment.total_duration || 30} min
                    </Badge>
                  </div>
                  <p className="text-sm font-medium">
                    Customer
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Service
                  </p>
                  {appointment.notes && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Note: {appointment.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}