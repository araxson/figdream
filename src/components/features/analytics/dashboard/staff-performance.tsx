'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'
import { formatCurrency } from '@/lib/utils/format'

type StaffProfile = Database['public']['Tables']['staff_profiles']['Row'] & {
  profiles?: {
    first_name: string | null
    last_name: string | null
    email: string
  }
}

interface StaffStats {
  staff: StaffProfile
  appointmentCount: number
  revenue: number
  avgRating: number
  utilizationRate: number
}

export function StaffPerformance() {
  const [staffStats, setStaffStats] = useState<StaffStats[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchStaffPerformance = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: salon } = await supabase
        .from('salons')
        .select('id')
        .eq('created_by', user.id)
        .single()

      if (!salon) return

      // Get staff
      const { data: staff } = await supabase
        .from('staff_profiles')
        .select('*, profiles(first_name, last_name, email)')
        .eq('salon_id', salon.id)

      if (!staff) return

      // Get appointments for this week
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      
      const { data: appointments } = await supabase
        .from('appointments')
        .select('staff_id, computed_total_price, status')
        .eq('salon_id', salon.id)
        .gte('created_at', weekAgo.toISOString())

      // Get reviews
      const { data: reviews } = await supabase
        .from('reviews')
        .select('staff_id, rating')
        .eq('salon_id', salon.id)

      // Calculate stats for each staff
      const stats: StaffStats[] = staff.map(member => {
        // Use fallback data since relationships might not work
        const staffAppointments = Array.isArray(appointments) ? appointments.filter(a => a.staff_id === member.id) : []
        const completedAppointments = staffAppointments.filter(a => a.status === 'completed')
        const staffReviews = Array.isArray(reviews) ? reviews.filter(r => r.staff_id === member.id) : []
        
        const revenue = completedAppointments.reduce((sum, a) => sum + (a.computed_total_price || 0), 0)
        const avgRating = staffReviews.length > 0
          ? staffReviews.reduce((sum, r) => sum + r.rating, 0) / staffReviews.length
          : 0

        // Simple utilization calculation (appointments / working days)
        const utilizationRate = (staffAppointments.length / 7) * 100 // Assuming 7 working days

        return {
          staff: member,
          appointmentCount: staffAppointments.length,
          revenue,
          avgRating,
          utilizationRate: Math.min(utilizationRate, 100)
        }
      }).sort((a, b) => b.revenue - a.revenue)

      setStaffStats(stats)
    } catch {
      // Error handled silently
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchStaffPerformance()
  }, [fetchStaffPerformance])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Staff Performance</CardTitle>
        <CardDescription>This week&apos;s staff metrics</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : staffStats.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            No staff data available
          </p>
        ) : (
          <div className="space-y-4">
            {staffStats.map((stat) => (
              <div key={stat.staff.id} className="flex items-center gap-4">
                <Avatar>
                  <AvatarFallback>
                    {stat.staff.profiles?.first_name?.[0]}
                    {stat.staff.profiles?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {stat.staff.profiles?.first_name} {stat.staff.profiles?.last_name}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{stat.appointmentCount} appointments</span>
                    <span>{formatCurrency(stat.revenue)} revenue</span>
                    {stat.avgRating > 0 && (
                      <span>⭐ {stat.avgRating.toFixed(1)}</span>
                    )}
                  </div>
                </div>
                <Badge variant={stat.utilizationRate > 70 ? "default" : "secondary"}>
                  {stat.utilizationRate.toFixed(0)}% utilized
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}