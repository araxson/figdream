'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Eye, Edit, X, CheckCircle } from 'lucide-react'
import { formatTime, formatCurrency, formatDuration } from '@/lib/utils/format'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'

type Appointment = Database['public']['Tables']['appointments']['Row'] & {
  customers: Database['public']['Tables']['customers']['Row']
  appointment_services: Array<{
    services: Database['public']['Tables']['services']['Row']
  }>
  staff_profiles: {
    profiles: Database['public']['Tables']['profiles']['Row']
  }
}

interface AppointmentsListProps {
  filters?: {
    status: string
    staffId: string
    serviceId: string
    dateRange: string
  }
}

export function AppointmentsList({ }: AppointmentsListProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchAppointments = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get salon owned by user
      const { data: salon } = await supabase
        .from('salons')
        .select('id')
        .eq('created_by', user.id)
        .single()

      if (!salon) return

      const today = new Date().toISOString().split('T')[0]

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
        .eq('appointment_date', today)
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
    fetchAppointments()
  }, [fetchAppointments])

  const getStatusBadge = (status: Database['public']['Enums']['appointment_status']) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="default">{status}</Badge>
      case 'pending':
        return <Badge variant="secondary">{status}</Badge>
      case 'cancelled':
        return <Badge variant="destructive">{status}</Badge>
      case 'completed':
        return <Badge variant="outline">{status}</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s Appointments</CardTitle>
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
        <CardTitle>Today&apos;s Appointments</CardTitle>
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No appointments scheduled for today
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Staff</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((apt) => {
                const customerName = `${apt.customers?.first_name || ''} ${apt.customers?.last_name || ''}`.trim() || 
                                   apt.customers?.email || 'Customer'
                const serviceName = apt.appointment_services?.[0]?.services?.name || 'Service'
                const staffName = apt.staff_profiles?.profiles?.full_name || 
                                 apt.staff_profiles?.profiles?.email || 'Staff'
                
                // Calculate duration
                const [startH, startM] = apt.start_time.split(':').map(Number)
                const [endH, endM] = apt.end_time.split(':').map(Number)
                const durationMinutes = (endH * 60 + endM) - (startH * 60 + startM)
                
                return (
                  <TableRow key={apt.id}>
                    <TableCell className="font-medium">{formatTime(apt.start_time)}</TableCell>
                    <TableCell>{customerName}</TableCell>
                    <TableCell>{serviceName}</TableCell>
                    <TableCell>{staffName}</TableCell>
                    <TableCell>{formatDuration(durationMinutes)}</TableCell>
                    <TableCell>{getStatusBadge(apt.status)}</TableCell>
                    <TableCell>{formatCurrency(apt.computed_total_price || 0)}</TableCell>
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
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}