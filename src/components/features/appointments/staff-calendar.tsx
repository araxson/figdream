'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'

type Appointment = Database['public']['Tables']['appointments']['Row']

export function AppointmentCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchAppointments = useCallback(async (selectedDate: Date) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const dateStr = selectedDate.toISOString().split('T')[0]
      const { data } = await supabase
        .from('appointments')
        .select('*')
        .eq('staff_id', user.id)
        .eq('appointment_date', dateStr)
        .order('start_time')

      if (data) setAppointments(data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    if (date) {
      fetchAppointments(date)
    }
  }, [date, fetchAppointments])

  return (
    <div className="grid gap-4 md:grid-cols-2">
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
            Appointments for {date?.toLocaleDateString()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[350px]">
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : appointments.length === 0 ? (
              <p className="text-muted-foreground">No appointments</p>
            ) : (
              <div className="space-y-2">
                {appointments.map((apt) => (
                  <div key={apt.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{apt.start_time} - {apt.end_time}</p>
                        <p className="text-sm text-muted-foreground">
                          Customer: {apt.customer_id}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Service: Service
                        </p>
                      </div>
                      <Badge variant={apt.status === 'confirmed' ? 'default' : 'secondary'}>
                        {apt.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}