'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, DollarSign, Star, TrendingUp } from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'
import { formatDate, formatCurrency } from '@/lib/utils/format'

type CustomerStats = {
  totalAppointments: number
  totalSpent: number
  favoriteService: string | null
  favoriteStaff: string | null
  memberSince: string
  lastVisit: string | null
}

type Appointment = Database['public']['Tables']['appointments']['Row'] & {
  salons?: {
    name: string
  }
  staff_profiles?: {
    profiles?: {
      first_name: string | null
      last_name: string | null
    }
  }
  appointment_services?: Array<{
    services?: {
      name: string
      price: number
    }
  }>
}

export function ProfileHistory() {
  const [stats, setStats] = useState<CustomerStats>({
    totalAppointments: 0,
    totalSpent: 0,
    favoriteService: null,
    favoriteStaff: null,
    memberSince: '',
    lastVisit: null
  })
  const [recentVisits, setRecentVisits] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchHistory = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: customer } = await supabase
        .from('customers')
        .select('id, created_at')
        .eq('auth_user_id', user.id)
        .single()

      if (!customer) return

      // Fetch all appointments
      const { data: appointments } = await supabase
        .from('appointments')
        .select(`
          *,
          salons(name),
          appointment_services(
            services(name, price)
          ),
          staff_profiles(
            profiles(
              first_name,
              last_name
            )
          )
        `)
        .eq('customer_id', customer.id)
        .eq('status', 'completed')
        .order('appointment_date', { ascending: false })

      if (!appointments) return

      // Calculate stats
      const totalSpent = appointments.reduce((sum, apt) => 
        sum + (apt.computed_total_price || 0), 0
      )

      // Find favorite service
      const serviceCount: Record<string, number> = {}
      appointments.forEach(apt => {
        apt.appointment_services?.forEach((as) => {
          const serviceName = as.services?.name
          if (serviceName) {
            serviceCount[serviceName] = (serviceCount[serviceName] || 0) + 1
          }
        })
      })
      const favoriteService = Object.entries(serviceCount)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || null

      // Find favorite staff
      const staffCount: Record<string, number> = {}
      appointments.forEach(apt => {
        const staffName = apt.staff_profiles?.profiles 
          ? `${apt.staff_profiles.profiles.first_name} ${apt.staff_profiles.profiles.last_name}`
          : null
        if (staffName) {
          staffCount[staffName] = (staffCount[staffName] || 0) + 1
        }
      })
      const favoriteStaff = Object.entries(staffCount)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || null

      setStats({
        totalAppointments: appointments.length,
        totalSpent,
        favoriteService,
        favoriteStaff,
        memberSince: customer.created_at,
        lastVisit: appointments[0]?.appointment_date || null
      })

      setRecentVisits(appointments.slice(0, 5))
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
        <CardContent className="py-12 text-center">
          Loading history...
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAppointments}</div>
            {stats.lastVisit && (
              <p className="text-xs text-muted-foreground">
                Last visit: {formatDate(stats.lastVisit)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalSpent)}</div>
            <p className="text-xs text-muted-foreground">
              Avg: {formatCurrency(stats.totalAppointments > 0 ? stats.totalSpent / stats.totalAppointments : 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Favorite Service</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {stats.favoriteService || 'N/A'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Member Since</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {formatDate(stats.memberSince)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Visits</CardTitle>
        </CardHeader>
        <CardContent>
          {recentVisits.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No visits yet. Book your first appointment!
            </p>
          ) : (
            <div className="space-y-3">
              {recentVisits.map((visit) => (
                <div key={visit.id} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div>
                    <p className="font-medium">{visit.salons?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(visit.appointment_date)} at {visit.start_time}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {visit.appointment_services?.map((as) => as.services?.name).join(', ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(visit.computed_total_price || 0)}</p>
                    <p className="text-xs text-muted-foreground">
                      with {visit.staff_profiles?.profiles?.first_name} {visit.staff_profiles?.profiles?.last_name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}