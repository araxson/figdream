'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { AppointmentsTabs } from './appointments-tabs'
import {
  Calendar,
  Clock,
  MapPin,
  User,
  DollarSign,
  MoreHorizontal,
  Eye,
  Edit,
  X,
  MessageSquare,
  Star,
  RefreshCw,
  CalendarX,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/database/supabase/client'
import type { Database } from '@/types/database.types'

type Appointment = Database['public']['Tables']['appointments']['Row'] & {
  services: Database['public']['Tables']['services']['Row'] | null
  staff_profiles: Database['public']['Tables']['staff_profiles']['Row'] | null
  salons: Database['public']['Tables']['salons']['Row'] | null
}

export function AppointmentsList() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAppointments()
  }, [])

  async function fetchAppointments() {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setError('Please sign in to view your appointments')
        return
      }

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          services (
            id,
            name,
            description,
            price,
            duration_minutes
          ),
          staff_profiles (
            id,
            full_name,
            title,
            avatar_url
          ),
          salons (
            id,
            name,
            address_line_1,
            phone
          )
        `)
        .eq('customer_id', user.id)
        .order('appointment_date', { ascending: false })

      if (error) {
        setError('Failed to load appointments')
        return
      }

      setAppointments(data || [])
    } catch (_err) {
      setError('Failed to load appointments')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Animated skeleton loader */}
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-36" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-28" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="rounded-full bg-destructive/10 p-3 mb-4">
            <X className="h-6 w-6 text-destructive" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Unable to load appointments</h3>
          <p className="text-sm text-muted-foreground text-center mb-4">{error}</p>
          <Button 
            variant="outline" 
            onClick={fetchAppointments}
            className="mt-2"
            size="sm"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }
  const now = new Date()
  const categorizedAppointments = {
    upcoming: appointments.filter(apt => 
      new Date(apt.appointment_date) >= now && 
      apt.status !== 'cancelled'
    ).sort((a, b) => 
      new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime()
    ),
    past: appointments.filter(apt => 
      new Date(apt.appointment_date) < now || 
      apt.status === 'completed'
    ).sort((a, b) => 
      new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime()
    ),
    cancelled: appointments.filter(apt => 
      apt.status === 'cancelled'
    ).sort((a, b) => 
      new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime()
    ),
  }
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'no_show':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }
  const renderAppointmentCard = (appointment: Appointment) => {
    const isPast = new Date(appointment.appointment_date) < now
    const statusIcon = {
      confirmed: <CheckCircle2 className="h-3 w-3" />,
      pending: <AlertCircle className="h-3 w-3" />,
      completed: <CheckCircle2 className="h-3 w-3" />,
      cancelled: <X className="h-3 w-3" />,
      no_show: <CalendarX className="h-3 w-3" />,
    }[appointment.status]

    return (
      <Card 
        key={appointment.id} 
        className={`mb-4 transition-all duration-200 hover:shadow-md ${
          isPast ? 'opacity-75' : ''
        }`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <CardTitle className="text-lg font-semibold">
                {appointment.services?.name || 'Service'}
              </CardTitle>
              <CardDescription className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {appointment.salons?.name || 'Salon'}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                className={`${getStatusColor(appointment.status)} flex items-center gap-1`}
                variant="secondary"
              >
                {statusIcon}
                <span className="capitalize">
                  {appointment.status.replace('_', ' ')}
                </span>
              </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/appointments/${appointment.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Link>
                </DropdownMenuItem>
                {appointment.status === 'confirmed' && (
                  <>
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Reschedule
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </DropdownMenuItem>
                  </>
                )}
                {appointment.status === 'completed' && (
                  <DropdownMenuItem asChild>
                    <Link href={`/reviews/new?appointment=${appointment.id}`}>
                      <Star className="mr-2 h-4 w-4" />
                      Leave Review
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Add Note
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{format(new Date(appointment.appointment_date), 'MMMM d, yyyy')}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              {appointment.start_time} - {appointment.end_time}
              {appointment.total_duration && ` (${appointment.total_duration} min)`}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="h-4 w-4 flex-shrink-0" />
            <span>
              {appointment.staff_profiles?.full_name || appointment.staff_profiles?.title || 'Staff Member'}
              {appointment.staff_profiles?.title && (
                <span className="text-xs ml-1">• {appointment.staff_profiles.title}</span>
              )}
            </span>
          </div>
          {false && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="truncate">Location</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            <span>${appointment.total_amount?.toFixed(2) || '0.00'}</span>
          </div>
        </div>
        {appointment.notes && (
          <div className="mt-3 p-3 bg-muted rounded-md">
            <p className="text-sm">{appointment.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
  }
  return (
    <AppointmentsTabs
      categorizedAppointments={categorizedAppointments}
      renderAppointmentCard={renderAppointmentCard}
    />
  )
}