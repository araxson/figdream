'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, DollarSign, Star, TrendingUp } from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'
import { Database } from '@/types/database.types'
import { formatDate, formatCurrency } from '@/lib/utils/format'
import { toast } from '@/hooks/use-toast'

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
    memberSince: new Date().toISOString(),
    lastVisit: null
  })
  const [recentVisits, setRecentVisits] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/customers/data?type=history')
      if (!response.ok) throw new Error('Failed to fetch history')
      
      const data = await response.json()
      const appointments = data.appointments || []
      
      // Filter completed appointments
      const completedAppointments = appointments.filter((apt: Appointment) => 
        apt.status === 'completed'
      )

      // Calculate stats
      const totalSpent = completedAppointments.reduce((sum: number, apt: Appointment) => 
        sum + (apt.computed_total_price || 0), 0
      )

      // Find favorite service
      const serviceCount: Record<string, number> = {}
      completedAppointments.forEach((apt: Appointment) => {
        apt.appointment_services?.forEach((as) => {
          if (as.services?.name) {
            serviceCount[as.services.name] = (serviceCount[as.services.name] || 0) + 1
          }
        })
      })
      const favoriteService = Object.entries(serviceCount)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || null

      // Find favorite staff  
      const staffCount: Record<string, number> = {}
      completedAppointments.forEach((apt: Appointment) => {
        if (apt.staff_profiles?.profiles?.first_name) {
          const fullName = `${apt.staff_profiles.profiles.first_name} ${apt.staff_profiles.profiles.last_name || ''}`.trim()
          staffCount[fullName] = (staffCount[fullName] || 0) + 1
        }
      })
      const favoriteStaff = Object.entries(staffCount)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || null

      setStats({
        totalAppointments: completedAppointments.length,
        totalSpent,
        favoriteService,
        favoriteStaff,
        memberSince: appointments[0]?.created_at || new Date().toISOString(),
        lastVisit: completedAppointments[0]?.appointment_date || null
      })

      setRecentVisits(completedAppointments.slice(0, 5))
    } catch (error) {
      console.error('Error fetching history:', error)
      toast({
        title: 'Error',
        description: 'Failed to load appointment history',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }, [])

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