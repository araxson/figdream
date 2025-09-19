'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Clock, User, Scissors, Calendar } from 'lucide-react'
import { format } from 'date-fns'

interface Appointment {
  id: string
  start_time: string
  end_time: string
  status: string
  customer: {
    id: string
    full_name: string
    email: string
  }
  staff: {
    id: string
    profiles: {
      full_name: string
    }
  }
  appointment_services: Array<{
    services: {
      name: string
    }
  }>
}

interface TodayAppointmentsProps {
  appointments: Appointment[]
  loading?: boolean
}

export function TodayAppointments({ appointments, loading }: TodayAppointmentsProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Today's Appointments</CardTitle>
          <CardDescription>Scheduled appointments for today</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-muted animate-pulse rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                <div className="h-3 w-24 bg-muted animate-pulse rounded" />
              </div>
              <div className="h-6 w-16 bg-muted animate-pulse rounded" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500'
      case 'pending':
        return 'bg-yellow-500'
      case 'cancelled':
        return 'bg-red-500'
      case 'completed':
        return 'bg-blue-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (appointments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Today's Appointments</CardTitle>
          <CardDescription>Scheduled appointments for today</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p>No appointments scheduled for today</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today's Appointments</CardTitle>
        <CardDescription>
          {appointments.length} appointment{appointments.length !== 1 ? 's' : ''} scheduled
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {appointments.slice(0, 5).map((appointment) => (
          <div key={appointment.id} className="flex items-center space-x-4">
            <Avatar>
              <AvatarFallback>
                {getInitials(appointment.customer?.full_name || 'Guest')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">
                {appointment.customer?.full_name || 'Guest Customer'}
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {format(new Date(appointment.start_time), 'h:mm a')}
                </div>
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {appointment.staff?.profiles?.full_name || 'Unassigned'}
                </div>
                {appointment.appointment_services?.[0] && (
                  <div className="flex items-center gap-1">
                    <Scissors className="h-3 w-3" />
                    {appointment.appointment_services[0].services.name}
                  </div>
                )}
              </div>
            </div>
            <Badge variant="secondary" className={`${getStatusColor(appointment.status)} text-white`}>
              {appointment.status}
            </Badge>
          </div>
        ))}
        {appointments.length > 5 && (
          <p className="text-sm text-center text-muted-foreground">
            +{appointments.length - 5} more appointments
          </p>
        )}
      </CardContent>
    </Card>
  )
}