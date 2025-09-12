'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { TrendingUp, Star } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'
import { formatCurrency } from '@/lib/utils/format'
import { UserRole } from '@/lib/auth/constants'

type StaffProfile = Database['public']['Tables']['staff_profiles']['Row'] & {
  profiles?: {
    first_name: string | null
    last_name: string | null
    email: string
    avatar_url?: string | null
  }
}

interface StaffStats {
  staff: StaffProfile
  appointmentCount: number
  revenue: number
  totalRevenue?: number
  avgRating: number
  utilizationRate: number
  clientRetention?: number
}

interface StaffPerformanceProps {
  userRole: UserRole
  salonId?: string
  staffId?: string
  dateRange?: 'day' | 'week' | 'month' | 'year'
  variant?: 'compact' | 'detailed'
}

export function StaffPerformance({ 
  userRole, 
  salonId, 
  staffId,
  dateRange = 'month',
  variant = 'compact'
}: StaffPerformanceProps) {
  const [staffStats, setStaffStats] = useState<StaffStats[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchStaffPerformance = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let effectiveSalonId = salonId

      // If no salon ID provided and user is owner/manager, get their salon
      if (!effectiveSalonId && ['salon_owner', 'salon_manager'].includes(userRole)) {
        const { data: salon } = await supabase
          .from('salons')
          .select('id')
          .eq('created_by', user.id)
          .single()
        
        if (salon) {
          effectiveSalonId = salon.id
        }
      }

      // Build query based on role
      let query = supabase
        .from('staff_profiles')
        .select('*, profiles(first_name, last_name, email, avatar_url)')

      // Apply filters based on role
      if (userRole === 'staff' && staffId) {
        query = query.eq('id', staffId)
      } else if (effectiveSalonId) {
        query = query.eq('salon_id', effectiveSalonId)
      } else if (userRole !== 'super_admin') {
        // Non-admin users can only see their own data
        query = query.eq('user_id', user.id)
      }

      const { data: staff } = await query

      if (!staff || staff.length === 0) {
        setStaffStats([])
        return
      }

      // Fetch performance metrics for each staff member
      const statsPromises = staff.map(async (staffMember) => {
        // Get appointments count and revenue
        const startDate = getStartDate(dateRange)
        
        const { data: appointments } = await supabase
          .from('appointments')
          .select('id, computed_total_price, status')
          .eq('staff_id', staffMember.id)
          .eq('status', 'completed')
          .gte('appointment_date', startDate.toISOString())

        const appointmentCount = appointments?.length || 0
        const revenue = appointments?.reduce((sum, apt) => sum + (apt.computed_total_price || 0), 0) || 0

        // Get average rating
        const { data: reviews } = await supabase
          .from('reviews')
          .select('rating')
          .eq('staff_id', staffMember.id)

        const avgRating = reviews && reviews.length > 0 
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
          : 0

        // Calculate utilization rate (simplified)
        const utilizationRate = Math.min(100, (appointmentCount / 20) * 100) // Assuming 20 appointments is 100% utilization

        // Calculate client retention (simplified - percentage of repeat clients)
        // TODO: Implement actual client retention calculation
        const clientRetention = 75 // Placeholder - would need more complex calculation

        return {
          staff: staffMember,
          appointmentCount,
          revenue,
          totalRevenue: revenue,
          avgRating,
          utilizationRate,
          clientRetention
        }
      })

      const stats = await Promise.all(statsPromises)
      setStaffStats(stats)
    } catch (error) {
      console.error('Error fetching staff performance:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase, userRole, salonId, staffId, dateRange])

  useEffect(() => {
    fetchStaffPerformance()
  }, [fetchStaffPerformance])

  const getStartDate = (range: string) => {
    const now = new Date()
    switch (range) {
      case 'day':
        return new Date(now.setHours(0, 0, 0, 0))
      case 'week':
        return new Date(now.setDate(now.getDate() - 7))
      case 'year':
        return new Date(now.setFullYear(now.getFullYear() - 1))
      case 'month':
      default:
        return new Date(now.setMonth(now.getMonth() - 1))
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Performance Data...</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  if (variant === 'detailed') {
    return (
      <div className="grid gap-4">
        {staffStats.map((stat) => (
          <Card key={stat.staff.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={stat.staff.profiles?.avatar_url || undefined} />
                    <AvatarFallback>
                      {stat.staff.profiles?.first_name?.[0]}
                      {stat.staff.profiles?.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>
                      {stat.staff.profiles?.first_name} {stat.staff.profiles?.last_name}
                    </CardTitle>
                    <CardDescription>{stat.staff.profiles?.email}</CardDescription>
                  </div>
                </div>
                <Badge variant="outline">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  Top Performer
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(stat.revenue)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Appointments</p>
                  <p className="text-2xl font-bold">{stat.appointmentCount}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rating</p>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-2xl font-bold">{stat.avgRating.toFixed(1)}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Utilization</p>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold">{stat.utilizationRate.toFixed(0)}%</p>
                    <Progress value={stat.utilizationRate} className="h-2" />
                  </div>
                </div>
              </div>
              {stat.clientRetention !== undefined && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Client Retention</span>
                    <span className="font-semibold">{stat.clientRetention}%</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Compact variant for dashboards
  return (
    <Card>
      <CardHeader>
        <CardTitle>Staff Performance</CardTitle>
        <CardDescription>
          {dateRange === 'day' && 'Today\'s'}
          {dateRange === 'week' && 'This Week\'s'}
          {dateRange === 'month' && 'This Month\'s'}
          {dateRange === 'year' && 'This Year\'s'} Performance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {staffStats.map((stat) => (
            <div key={stat.staff.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {stat.staff.profiles?.first_name?.[0]}
                    {stat.staff.profiles?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">
                    {stat.staff.profiles?.first_name} {stat.staff.profiles?.last_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stat.appointmentCount} appointments
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">{formatCurrency(stat.revenue)}</p>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs text-muted-foreground">{stat.avgRating.toFixed(1)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}