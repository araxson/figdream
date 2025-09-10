'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Clock, CheckCircle, XCircle } from 'lucide-react'
import { useEffect, useCallback, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'
import { formatTime, formatDuration } from '@/lib/utils/format'

type Appointment = Database['public']['Tables']['appointments']['Row']

export function TodaySchedule() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchTodayAppointments = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get staff profile
      const { data: staffProfile } = await supabase
        .from('staff_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!staffProfile) return

      // Get today's appointments
      const today = new Date().toISOString().split('T')[0]
      
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('staff_id', staffProfile.id)
        .eq('appointment_date', today)
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
    fetchTodayAppointments()
  }, [fetchTodayAppointments])

  const getStatusIcon = (status: Database['public']['Enums']['appointment_status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  async function updateAppointmentStatus(id: string, status: Database['public']['Enums']['appointment_status']) {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ 
          status,
          ...(status === 'completed' ? { completed_at: new Date().toISOString() } : {})
        })
        .eq('id', id)

      if (error) throw error
      await fetchTodayAppointments()
    } catch (error) {
      console.error('Error updating appointment:', error)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s Schedule</CardTitle>
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
        <div className="flex items-center justify-between">
          <CardTitle>Today&apos;s Schedule</CardTitle>
          <Badge variant="outline">{appointments.length} Appointments</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {appointments.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No appointments scheduled for today
            </p>
          ) : (
            appointments.map((apt) => {
              const serviceName = 'Service'
              const duration = apt.total_duration || 30
              const customerName = 'Customer'
              
              return (
                <div key={apt.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(apt.status)}
                      <span className="text-sm font-medium w-20">
                        {formatTime(apt.start_time)}
                      </span>
                    </div>
                    <Avatar>
                      <AvatarImage src="" />
                      <AvatarFallback>
                        {customerName.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{customerName}</p>
                      <p className="text-sm text-muted-foreground">
                        {serviceName} • {formatDuration(duration)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {(apt.status === 'pending' || apt.status === 'confirmed') && (
                      <>
                        <Button size="sm" variant="outline">Reschedule</Button>
                        <Button 
                          size="sm"
                          onClick={() => updateAppointmentStatus(apt.id, 'in_progress')}
                        >
                          Start
                        </Button>
                      </>
                    )}
                    {apt.status === 'in_progress' && (
                      <Button 
                        size="sm"
                        onClick={() => updateAppointmentStatus(apt.id, 'completed')}
                      >
                        Complete
                      </Button>
                    )}
                    {apt.status === 'completed' && (
                      <Badge variant="default">Done</Badge>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}