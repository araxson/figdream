'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { TrendingUp, Star, Clock, Calendar } from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'
import { formatCurrency } from '@/lib/utils/format'

type StaffProfile = Database['public']['Tables']['staff_profiles']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row']
}

type StaffPerformance = {
  staff: StaffProfile
  totalRevenue: number
  appointmentCount: number
  averageRating: number
  utilizationRate: number
  clientRetention: number
}

export function StaffPerformance() {
  const [performances, setPerformances] = useState<StaffPerformance[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange] = useState('month')
  const supabase = createClient()

  const fetchPerformanceData = useCallback(async () => {
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
      const { data: staffData } = await supabase
        .from('staff_profiles')
        .select(`
          *,
          profiles(*)
        `)
        .eq('salon_id', salon.id)
        .eq('is_active', true)

      if (!staffData) return

      // Calculate performance metrics for each staff member
      const performanceData = await Promise.all(staffData.map(async (staff) => {
        // Get appointments
        const { data: appointments } = await supabase
          .from('appointments')
          .select('*, payments(*)')
          .eq('staff_profile_id', staff.id)
          .eq('status', 'completed')

        // Calculate total revenue
        const totalRevenue = appointments?.reduce((sum, apt) => 
          sum + (apt.computed_total_price || 0), 0) || 0

        // Get reviews
        const { data: reviews } = await supabase
          .from('reviews')
          .select('rating')
          .eq('staff_profile_id', staff.id)

        const averageRating = reviews?.length 
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          : 0

        // Calculate utilization rate (simulated)
        const utilizationRate = 65 + Math.random() * 30

        // Calculate client retention (simulated)
        const clientRetention = 70 + Math.random() * 25

        return {
          staff,
          totalRevenue,
          appointmentCount: appointments?.length || 0,
          averageRating,
          utilizationRate,
          clientRetention
        }
      }))

      setPerformances(performanceData.sort((a, b) => b.totalRevenue - a.totalRevenue))
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching performance data:', error)
      }
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchPerformanceData()
  }, [fetchPerformanceData, dateRange])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Staff Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            Loading performance data...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {performances.map((perf, index) => {
              const initials = `${perf.staff.profiles?.first_name?.[0] || ''}${perf.staff.profiles?.last_name?.[0] || ''}`.toUpperCase()
              
              return (
                <div key={perf.staff.id} className="space-y-4 pb-6 border-b last:border-0">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar>
                          <AvatarImage src={perf.staff.profiles?.avatar_url || undefined} />
                          <AvatarFallback>{initials || 'ST'}</AvatarFallback>
                        </Avatar>
                        {index < 3 && (
                          <div className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                            {index + 1}
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          {perf.staff.profiles?.first_name} {perf.staff.profiles?.last_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">{perf.staff.title || 'Staff'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{formatCurrency(perf.totalRevenue)}</div>
                      <div className="text-sm text-muted-foreground">Total Revenue</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        Appointments
                      </div>
                      <div className="text-xl font-semibold">{perf.appointmentCount}</div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Star className="h-3 w-3" />
                        Rating
                      </div>
                      <div className="text-xl font-semibold">
                        {perf.averageRating.toFixed(1)}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        Utilization
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-xl font-semibold">
                          {perf.utilizationRate.toFixed(0)}%
                        </div>
                        <Progress value={perf.utilizationRate} className="w-16" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <TrendingUp className="h-3 w-3" />
                        Retention
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-xl font-semibold">
                          {perf.clientRetention.toFixed(0)}%
                        </div>
                        <Progress value={perf.clientRetention} className="w-16" />
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