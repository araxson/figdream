'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'

interface Appointment {
  id: string
  date: string
  time: string
  customer: string
  service: string
}

interface ServiceData {
  name: string | null
}

export function UpcomingAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchAppointments() {
      try {
        const { data: session } = await supabase.auth.getSession()
        if (!session?.session?.user) return

        const { data, error } = await supabase
          .from('appointments')
          .select(`
            id,
            start_time,
            customer_id
          `)
          .eq('staff_id', session.session.user.id)
          .gte('start_time', new Date().toISOString())
          .order('start_time', { ascending: true })
          .limit(5)

        if (error) throw error

        // Fetch customer details and services for each appointment
        const formattedAppointments = await Promise.all(
          (data || []).map(async (apt) => {
            // Fetch customer details
            let customerName = 'Unknown'
            if (apt.customer_id) {
              const { data: customerData } = await supabase
                .from('customers')
                .select('first_name, last_name')
                .eq('id', apt.customer_id)
                .single()
              
              if (customerData) {
                customerName = `${customerData.first_name || ''} ${customerData.last_name || ''}`.trim() || 'Unknown'
              }
            }
            
            // Fetch appointment services
            const { data: servicesData } = await supabase
              .from('appointment_services')
              .select('services (name)')
              .eq('appointment_id', apt.id)
              .limit(1)
              .single()
            
            const serviceName = (servicesData?.services as ServiceData | null)?.name || 'Unknown Service'
            
            return {
              id: apt.id,
              date: format(new Date(apt.start_time), 'MMM d'),
              time: format(new Date(apt.start_time), 'h:mm a'),
              customer: customerName,
              service: serviceName
            }
          })
        )

        setAppointments(formattedAppointments)
      } catch (error) {
        console.error('Error fetching appointments:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [supabase])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Appointments</CardTitle>
        <CardDescription>Your next scheduled appointments</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : appointments.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">No upcoming appointments</p>
        ) : (
          <div className="space-y-3">
            {appointments.map((apt) => (
              <div key={apt.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="text-sm font-medium">{apt.customer}</p>
                  <p className="text-sm text-muted-foreground">{apt.service}</p>
                </div>
                <div className="text-right">
                  <Badge variant="outline">{apt.date}</Badge>
                  <p className="text-sm text-muted-foreground mt-1">{apt.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}