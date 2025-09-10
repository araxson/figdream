'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'
import { formatTime } from '@/lib/utils/format'

type Appointment = Database['public']['Tables']['appointments']['Row'] & {
  customers: Database['public']['Tables']['customers']['Row']
  appointment_services: Array<{
    services: Database['public']['Tables']['services']['Row']
  }>
  staff_profiles: {
    profiles: Database['public']['Tables']['profiles']['Row']
  }
}

interface AppointmentsCalendarProps {
  filters?: {
    status: string
    staffId: string
    serviceId: string
    dateRange: string
  }
}

export function AppointmentsCalendar({ }: AppointmentsCalendarProps) {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  
  const fetchAppointments = useCallback(async (selectedDate: Date) => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get salon owned by user
      const { data: salon } = await supabase
        .from('salons')
        .select('id')
        .eq('created_by', user.id)
        .single()

      if (!salon) return

      const dateStr = selectedDate.toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          customers(*),
          appointment_services(
            services(*)
          ),
          staff_profiles(
            profiles(*)
          )
        `)
        .eq('salon_id', salon.id)
        .eq('appointment_date', dateStr)
        .order('start_time')

      if (error) throw error
      setAppointments(data as unknown as Appointment[] || [])
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    if (date) {
      fetchAppointments(date)
    }
  }, [date, fetchAppointments])
  
  const getStatusColor = (status: Database['public']['Enums']['appointment_status']) => {
    switch (status) {
      case 'confirmed': return 'default'
      case 'pending': return 'secondary'
      case 'completed': return 'outline'
      case 'cancelled': return 'destructive'
      default: return 'secondary'
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
          />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>
            Appointments for {date?.toDateString()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              Loading appointments...
            </div>
          ) : appointments.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No appointments scheduled for this date
            </p>
          ) : (
            <div className="space-y-3">
              {appointments.map((apt) => {
                const customerName = `${apt.customers?.first_name || ''} ${apt.customers?.last_name || ''}`.trim() || 
                                   apt.customers?.email || 'Customer'
                const serviceName = apt.appointment_services?.[0]?.services?.name || 'Service'
                const staffName = apt.staff_profiles?.profiles?.full_name || 
                                 apt.staff_profiles?.profiles?.email || 'Staff'
                
                return (
                  <div key={apt.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{customerName}</p>
                      <p className="text-sm text-muted-foreground">
                        {serviceName} with {staffName}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{formatTime(apt.start_time)}</Badge>
                      <Badge variant={getStatusColor(apt.status)}>
                        {apt.status}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}