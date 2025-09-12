'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Skeleton } from '@/components/ui/skeleton'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'
import { formatTime } from '@/lib/utils/format'

type Appointment = Database['public']['Tables']['appointments']['Row'] & {
  customers?: Database['public']['Tables']['customers']['Row']
  salons?: Database['public']['Tables']['salons']['Row']
  appointment_services?: Array<{
    services: Database['public']['Tables']['services']['Row']
  }>
  staff_profiles?: {
    profiles: Database['public']['Tables']['profiles']['Row']
  }
}

interface AppointmentCalendarProps {
  userRole: 'super_admin' | 'salon_owner' | 'salon_manager' | 'staff' | 'customer'
  salonId?: string
  staffId?: string
  customerId?: string
}

export function AppointmentCalendar({
  userRole,
  salonId,
  staffId,
  customerId
}: AppointmentCalendarProps) {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  
  const fetchAppointments = useCallback(async (selectedDate: Date) => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let query = supabase
        .from('appointments')
        .select(`
          *,
          customers(*),
          salons(*),
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

      const dateStr = selectedDate.toISOString().split('T')[0]
      query = query.eq('appointment_date', dateStr).order('start_time')

      const { data, error } = await query

      if (error) throw error
      setAppointments(data as unknown as Appointment[] || [])
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase, userRole, salonId, staffId, customerId])

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
      case 'in_progress': return 'default'
      case 'no_show': return 'destructive'
      default: return 'secondary'
    }
  }

  const canViewCustomerInfo = ['super_admin', 'salon_owner', 'staff'].includes(userRole)

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
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[150px]" />
                    <Skeleton className="h-3 w-[200px]" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-[60px]" />
                    <Skeleton className="h-5 w-[80px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : appointments.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No appointments scheduled for this date
            </p>
          ) : (
            <div className="space-y-3">
              {appointments.map((apt) => {
                // Role-based display logic
                let primaryName = ''
                let secondaryInfo = ''

                if (userRole === 'customer') {
                  // Customer sees salon and staff info
                  primaryName = apt.salons?.name || 'Salon'
                  const staffName = apt.staff_profiles?.profiles?.full_name || 'Staff'
                  const serviceName = apt.appointment_services?.[0]?.services?.name || 'Service'
                  secondaryInfo = `${serviceName} with ${staffName}`
                } else if (canViewCustomerInfo) {
                  // Staff/Owner/Admin see customer info
                  primaryName = apt.customers
                    ? `${apt.customers.first_name || ''} ${apt.customers.last_name || ''}`.trim() || apt.customers.email || 'Customer'
                    : 'Customer'
                  const serviceName = apt.appointment_services?.[0]?.services?.name || 'Service'
                  const staffName = apt.staff_profiles?.profiles?.full_name || apt.staff_profiles?.profiles?.email || 'Staff'
                  secondaryInfo = `${serviceName} with ${staffName}`
                }
                
                return (
                  <div key={apt.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{primaryName}</p>
                      <p className="text-sm text-muted-foreground">
                        {secondaryInfo}
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