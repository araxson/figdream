'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, Star, MessageSquare } from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'
import { formatDate, formatTime, formatCurrency } from '@/lib/utils/format'

type Appointment = Database['public']['Tables']['appointments']['Row'] & {
  salons: Database['public']['Tables']['salons']['Row']
  appointment_services: Array<{
    services: Database['public']['Tables']['services']['Row']
  }>
  staff_profiles: Database['public']['Tables']['staff_profiles']['Row'] & {
    profiles: {
      first_name: string | null
      last_name: string | null
    }
  }
  reviews: Array<Database['public']['Tables']['reviews']['Row']>
}

export function AppointmentHistory() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchHistory = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: customer } = await supabase
        .from('customers')
        .select('id')
        .eq('auth_user_id', user.id)
        .single()

      if (!customer) return

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          salons(*),
          appointment_services(
            services(*)
          ),
          staff_profiles(
            *,
            profiles(
              first_name,
              last_name
            )
          ),
          reviews(*)
        `)
        .eq('customer_id', customer.id)
        .eq('status', 'completed')
        .order('appointment_date', { ascending: false })
        .limit(20)

      if (error) throw error
      setAppointments(data || [])
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching history:', error)
      }
    } finally {
      setLoading(false)
    }
  }, [supabase])
   
  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Appointment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            Loading history...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appointment History</CardTitle>
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No appointment history yet.
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => {
              const hasReview = appointment.reviews && appointment.reviews.length > 0
              
              return (
                <div key={appointment.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{appointment.salons?.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(appointment.appointment_date)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(appointment.start_time)}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline">Completed</Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Services:</span>
                      <span className="font-medium">
                        {appointment.appointment_services?.map(as => as.services?.name).join(', ')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Staff:</span>
                      <span className="font-medium">
                        {appointment.staff_profiles?.profiles?.first_name} {appointment.staff_profiles?.profiles?.last_name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total:</span>
                      <span className="font-semibold">
                        {formatCurrency(appointment.computed_total_price || 0)}
                      </span>
                    </div>
                  </div>

                  {hasReview ? (
                    <div className="pt-2 border-t">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                        <span className="text-sm">
                          You rated this {appointment.reviews[0].rating}/5
                        </span>
                      </div>
                      {appointment.reviews[0].comment && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {appointment.reviews[0].comment}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="flex gap-2 pt-2 border-t">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Star className="h-4 w-4 mr-2" />
                        Leave Review
                      </Button>
                      <Button size="sm" className="flex-1">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Book Again
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}