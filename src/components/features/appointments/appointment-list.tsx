'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Calendar, Clock, MapPin, User, MoreHorizontal, Eye, Edit, X, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'
import { formatDate, formatTime, formatCurrency, formatDuration } from '@/lib/utils/format'

type Appointment = Database['public']['Tables']['appointments']['Row'] & {
  salons?: Database['public']['Tables']['salons']['Row']
  customers?: Database['public']['Tables']['customers']['Row']
  appointment_services?: Array<{
    services: Database['public']['Tables']['services']['Row']
  }>
  staff_profiles?: {
    profiles: Database['public']['Tables']['profiles']['Row']
  }
}

interface AppointmentListProps {
  userRole: 'super_admin' | 'salon_owner' | 'salon_manager' | 'staff' | 'customer'
  view?: 'upcoming' | 'past' | 'today' | 'all'
  displayMode?: 'card' | 'table'
  salonId?: string
  staffId?: string
  customerId?: string
  limit?: number
}

export function AppointmentList({
  userRole,
  view = 'upcoming',
  displayMode = 'card',
  salonId,
  staffId,
  customerId,
  limit
}: AppointmentListProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchAppointments = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let query = supabase
        .from('appointments')
        .select(`
          *,
          salons(*),
          customers(*),
          appointment_services(
            services(*)
          ),
          staff_profiles(
            profiles(*)
          )
        `)

      // Apply role-based filtering
      if (userRole === 'customer') {
        const { data: customer } = await supabase
          .from('customers')
          .select('id')
          .eq('auth_user_id', user.id)
          .single()
        if (customer) {
          query = query.eq('customer_id', customer.id)
        }
      } else if (userRole === 'staff') {
        query = query.eq('staff_id', user.id)
      } else if (userRole === 'salon_owner') {
        if (salonId) {
          query = query.eq('salon_id', salonId)
        } else {
          // Get salon owned by user
          const { data: salon } = await supabase
            .from('salons')
            .select('id')
            .eq('created_by', user.id)
            .single()
          if (salon) {
            query = query.eq('salon_id', salon.id)
          }
        }
      }
      // super_admin sees all appointments

      // Apply view-based date filtering
      const today = new Date().toISOString().split('T')[0]
      if (view === 'today') {
        query = query.eq('appointment_date', today)
      } else if (view === 'upcoming') {
        query = query.gte('appointment_date', today)
      } else if (view === 'past') {
        query = query.lt('appointment_date', today)
      }

      // Apply specific filters
      if (salonId && userRole === 'super_admin') {
        query = query.eq('salon_id', salonId)
      }
      if (staffId) {
        query = query.eq('staff_id', staffId)
      }
      if (customerId) {
        query = query.eq('customer_id', customerId)
      }

      query = query.order('appointment_date').order('start_time')

      if (limit) {
        query = query.limit(limit)
      }

      const { data, error } = await query

      if (error) throw error
      setAppointments(data as unknown as Appointment[] || [])
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching appointments:', error)
      }
    } finally {
      setLoading(false)
    }
  }, [supabase, userRole, view, salonId, staffId, customerId, limit])

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
      case 'in_progress':
        return <Badge variant="default">In Progress</Badge>
      case 'no_show':
        return <Badge variant="destructive">No Show</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const canEdit = ['super_admin', 'salon_owner', 'staff'].includes(userRole)
  const canViewCustomerInfo = ['super_admin', 'salon_owner', 'staff'].includes(userRole)
  const canViewFinancials = ['super_admin', 'salon_owner'].includes(userRole)

  const getTitle = () => {
    if (view === 'today') return "Today's Appointments"
    if (view === 'upcoming') return "Upcoming Appointments"
    if (view === 'past') return "Past Appointments"
    return "All Appointments"
  }

  const getEmptyMessage = () => {
    if (view === 'today') return "No appointments scheduled for today"
    if (view === 'upcoming') return "No upcoming appointments"
    if (view === 'past') return "No past appointments"
    return "No appointments found"
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{getTitle()}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (appointments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{getTitle()}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            {getEmptyMessage()}
            {userRole === 'customer' && view === 'upcoming' && (
              <p className="mt-2">Book your next appointment to get started!</p>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (displayMode === 'table') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{getTitle()}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                {canViewCustomerInfo && <TableHead>Customer</TableHead>}
                {userRole === 'customer' && <TableHead>Salon</TableHead>}
                {userRole === 'customer' && <TableHead>Staff</TableHead>}
                <TableHead>Service</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                {canViewFinancials && <TableHead>Price</TableHead>}
                {canEdit && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((apt) => {
                const customerName = apt.customers
                  ? `${apt.customers.first_name || ''} ${apt.customers.last_name || ''}`.trim() || apt.customers.email
                  : 'Customer'
                const serviceName = apt.appointment_services?.[0]?.services?.name || 'Service'
                const staffName = apt.staff_profiles?.profiles?.full_name || 
                                 apt.staff_profiles?.profiles?.email || 'Staff'
                
                // Calculate duration
                const [startH, startM] = apt.start_time.split(':').map(Number)
                const [endH, endM] = apt.end_time.split(':').map(Number)
                const durationMinutes = (endH * 60 + endM) - (startH * 60 + startM)
                
                return (
                  <TableRow key={apt.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{formatDate(apt.appointment_date)}</div>
                        <div className="text-sm text-muted-foreground">{formatTime(apt.start_time)}</div>
                      </div>
                    </TableCell>
                    {canViewCustomerInfo && <TableCell>{customerName}</TableCell>}
                    {userRole === 'customer' && <TableCell>{apt.salons?.name}</TableCell>}
                    {userRole === 'customer' && <TableCell>{staffName}</TableCell>}
                    <TableCell>{serviceName}</TableCell>
                    <TableCell>{formatDuration(durationMinutes)}</TableCell>
                    <TableCell>{getStatusBadge(apt.status)}</TableCell>
                    {canViewFinancials && <TableCell>{formatCurrency(apt.computed_total_price || 0)}</TableCell>}
                    {canEdit && (
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            {apt.status === 'pending' && (
                              <DropdownMenuItem>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Confirm
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="text-destructive">
                              <X className="mr-2 h-4 w-4" />
                              Cancel
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    )
  }

  // Card display mode
  return (
    <Card>
      <CardHeader>
        <CardTitle>{getTitle()}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  {userRole === 'customer' && appointment.salons && (
                    <>
                      <h3 className="font-semibold">{appointment.salons.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3" />
                        {appointment.salons.address}
                      </div>
                    </>
                  )}
                  {canViewCustomerInfo && appointment.customers && (
                    <h3 className="font-semibold">
                      {`${appointment.customers.first_name || ''} ${appointment.customers.last_name || ''}`.trim() || appointment.customers.email}
                    </h3>
                  )}
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
                  <span>
                    {userRole === 'customer' 
                      ? appointment.staff_profiles?.profiles?.full_name || 'Staff'
                      : `${appointment.customers?.first_name || ''} ${appointment.customers?.last_name || ''}`.trim() || 'Customer'
                    }
                  </span>
                </div>
                {canViewFinancials && (
                  <div className="text-sm font-semibold">
                    {formatCurrency(appointment.computed_total_price || 0)}
                  </div>
                )}
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

              {canEdit && appointment.status === 'confirmed' && view === 'upcoming' && (
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
      </CardContent>
    </Card>
  )
}