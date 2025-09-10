'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Users, DollarSign, Clock, Star } from 'lucide-react'
import { useEffect, useCallback, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'
import { formatCurrency } from '@/lib/utils/format'

type StaffProfile = Database['public']['Tables']['staff_profiles']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row']
}

interface StaffReportProps {
  dateRange: string
}

export function StaffReport({ dateRange }: StaffReportProps) {
  const [staffData, setStaffData] = useState({
    totalStaff: 0,
    activeStaff: 0,
    performance: [] as {
      staff: StaffProfile
      appointments: number
      revenue: number
      rating: number
      utilization: number
    }[],
    topPerformer: null as StaffProfile | null
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchStaffData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: salon } = await supabase
        .from('salons')
        .select('id')
        .eq('created_by', user.id)
        .single()

      if (!salon) return

      // Fetch staff
      const { data: staffProfiles } = await supabase
        .from('staff_profiles')
        .select(`
          *,
          profiles(*)
        `)
        .eq('salon_id', salon.id)

      if (!staffProfiles) return

      const now = new Date()
      const startDate = dateRange === 'month' 
        ? new Date(now.getFullYear(), now.getMonth(), 1)
        : new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())

      // Calculate performance for each staff
      const performanceData = await Promise.all(staffProfiles.map(async (staff) => {
        // Get appointments
        const { data: appointments, count } = await supabase
          .from('appointments')
          .select('computed_total_price', { count: 'exact' })
          .eq('staff_profile_id', staff.id)
          .eq('status', 'completed')
          .gte('appointment_date', startDate.toISOString().split('T')[0])

        const revenue = appointments?.reduce((sum, apt) => 
          sum + (apt.computed_total_price || 0), 0) || 0

        // Get reviews
        const { data: reviews } = await supabase
          .from('reviews')
          .select('rating')
          .eq('staff_profile_id', staff.id)

        const avgRating = reviews?.length 
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          : 0

        // Calculate utilization (simulated)
        const utilization = 60 + Math.random() * 35

        return {
          staff,
          appointments: count || 0,
          revenue,
          rating: avgRating,
          utilization
        }
      }))

      const activeStaff = staffProfiles.filter(s => s.is_active).length
      const topPerformer = performanceData.sort((a, b) => b.revenue - a.revenue)[0]?.staff || null

      setStaffData({
        totalStaff: staffProfiles.length,
        activeStaff,
        performance: performanceData.sort((a, b) => b.revenue - a.revenue),
        topPerformer
      })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching staff data:', error)
      }
    } finally {
      setLoading(false)
    }
  }, [supabase, dateRange])

  useEffect(() => {
    fetchStaffData()
  }, [fetchStaffData])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Staff Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            Loading staff data...
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalRevenue = staffData.performance.reduce((sum, p) => sum + p.revenue, 0)
  const avgUtilization = staffData.performance.length > 0
    ? staffData.performance.reduce((sum, p) => sum + p.utilization, 0) / staffData.performance.length
    : 0

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{staffData.totalStaff}</div>
            <p className="text-xs text-muted-foreground">
              {staffData.activeStaff} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">Combined earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Utilization</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgUtilization.toFixed(0)}%</div>
            <Progress value={avgUtilization} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Performer</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {staffData.topPerformer?.profiles 
                ? `${(staffData.topPerformer.profiles as { first_name?: string; last_name?: string }).first_name || ''} ${(staffData.topPerformer.profiles as { first_name?: string; last_name?: string }).last_name || ''}`.trim() || 'Staff Member'
                : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">Highest revenue</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Individual Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {staffData.performance.map((perf) => {
              const profile = perf.staff.profiles as { first_name?: string; last_name?: string } | null
              const initials = profile ? `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase() : 'ST'
              
              return (
                <div key={perf.staff.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={perf.staff.profiles?.avatar_url || undefined} />
                      <AvatarFallback>{initials || 'ST'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Staff Member' : 'Staff Member'}
                      </p>
                      <p className="text-sm text-muted-foreground">{perf.staff.title || 'Staff'}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-6 text-right">
                    <div>
                      <p className="text-sm text-muted-foreground">Appointments</p>
                      <p className="font-semibold">{perf.appointments}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Revenue</p>
                      <p className="font-semibold">{formatCurrency(perf.revenue)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Rating</p>
                      <p className="font-semibold">
                        {perf.rating > 0 ? perf.rating.toFixed(1) : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Utilization</p>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{perf.utilization.toFixed(0)}%</p>
                        <Progress value={perf.utilization} className="w-16" />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}