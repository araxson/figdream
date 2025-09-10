'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'
import { formatDate } from '@/lib/utils/format'

type Appointment = Database['public']['Tables']['appointments']['Row']
// These types are kept for documentation and potential future use
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type Customer = Database['public']['Tables']['customers']['Row']
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type Service = Database['public']['Tables']['services']['Row']
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type StaffProfile = Database['public']['Tables']['staff_profiles']['Row']

interface AppointmentWithRelations extends Appointment {
  customer_profile?: {
    first_name: string | null
    last_name: string | null
    email: string
  }
  appointment_services?: Array<{
    services?: {
      name: string
      price: number
    }
  }>
  staff_profiles?: {
    profiles?: {
      first_name: string | null
      last_name: string | null
    }
  }
}

export function RecentAppointments() {
  const [appointments, setAppointments] = useState<AppointmentWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchAppointments = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: salon } = await supabase
        .from('salons')
        .select('id')
        .eq('created_by', user.id)
        .single()

      if (!salon) return

      const { data } = await supabase
        .from('appointments')
        .select(`
          *,
          customer_profile:profiles!customer_id(first_name, last_name, email),
          appointment_services(services(name, price)),
          staff_profiles(profiles(first_name, last_name))
        `)
        .eq('salon_id', salon.id)
        .order('created_at', { ascending: false })
        .limit(5)

      setAppointments((data as unknown as AppointmentWithRelations[]) || [])
    } catch {
      // Error handled silently
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="default">Confirmed</Badge>
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>
      case 'completed':
        return <Badge variant="outline">Completed</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Appointments</CardTitle>
        <CardDescription>Latest bookings in your salon</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : appointments.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            No recent appointments
          </p>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center gap-4">
                <Avatar>
                  <AvatarFallback>
                    {appointment.customer_profile?.first_name?.[0]}
                    {appointment.customer_profile?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">
                    {appointment.customer_profile?.first_name} {appointment.customer_profile?.last_name}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{appointment.appointment_services?.[0]?.services?.name || 'Service'}</span>
                    <span>•</span>
                    <span>{formatDate(appointment.appointment_date)}</span>
                    <span>{appointment.start_time}</span>
                  </div>
                </div>
                {getStatusBadge(appointment.status)}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}