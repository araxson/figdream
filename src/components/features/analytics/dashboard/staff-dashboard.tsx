"use client"

import { useEffect, useState } from 'react'
import { DashboardStats, ScheduleItem } from './dashboard-types'
import { DashboardStatsCards } from './dashboard-stats'
import { DashboardSchedule } from './dashboard-schedule'
import { DashboardQuickActions } from './dashboard-quick-actions'
import { DashboardReviews } from './dashboard-reviews'
import { DashboardPerformance } from './dashboard-performance'
import { createClient } from '@/lib/supabase/client'
import { Skeleton } from '@/components/ui/skeleton'
import { format, startOfDay, startOfWeek, startOfMonth } from 'date-fns'

interface BreakTime {
  time: string
  type: string
}

interface Review {
  customer: string
  rating: number
  comment: string
  date: string
}

interface ServiceStat {
  service: string
  count: number
  revenue: number
}

interface AppointmentService {
  services?: {
    name?: string | null
    price?: number | null
  } | null
}

interface AppointmentWithServices {
  appointment_services?: AppointmentService[] | null
}

interface CustomerData {
  first_name?: string | null
  last_name?: string | null
}

interface BreakData {
  break_start?: string | null
  break_end?: string | null
}

export function StaffDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    todayAppointments: 0,
    completedToday: 0,
    upcomingToday: 0,
    weeklyEarnings: 0,
    monthlyEarnings: 0,
    averageRating: 0,
    totalReviews: 0,
    regularClients: 0
  })
  const [todaysSchedule, setTodaysSchedule] = useState<ScheduleItem[]>([])
  const [upcomingBreaks, setUpcomingBreaks] = useState<BreakTime[]>([])
  const [recentReviews, setRecentReviews] = useState<Review[]>([])
  const [topServices, setTopServices] = useState<ServiceStat[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const { data: session } = await supabase.auth.getSession()
        if (!session?.session?.user) return

        const staffId = session.session.user.id
        const today = startOfDay(new Date())
        const weekStart = startOfWeek(new Date())
        const monthStart = startOfMonth(new Date())

        // Fetch today's appointments
        const { data: todayAppts } = await supabase
          .from('appointments')
          .select(`
            id,
            start_time,
            status,
            computed_total_price,
            computed_total_duration,
            customers (first_name, last_name),
            appointment_services (services(name))
          `)
          .eq('staff_id', staffId)
          .gte('start_time', today.toISOString())
          .lt('start_time', new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString())
          .order('start_time')

        // Fetch weekly earnings
        const { data: weeklyAppts } = await supabase
          .from('appointments')
          .select('computed_total_price')
          .eq('staff_id', staffId)
          .eq('status', 'completed')
          .gte('start_time', weekStart.toISOString())

        // Fetch monthly earnings
        const { data: monthlyAppts } = await supabase
          .from('appointments')
          .select('computed_total_price')
          .eq('staff_id', staffId)
          .eq('status', 'completed')
          .gte('start_time', monthStart.toISOString())

        // Fetch reviews
        const { data: reviews } = await supabase
          .from('reviews')
          .select(`
            rating,
            comment,
            created_at,
            customers (first_name, last_name)
          `)
          .eq('staff_id', staffId)
          .order('created_at', { ascending: false })
          .limit(10)

        // Fetch regular clients (clients with 3+ appointments)
        const { data: regularClientsData } = await supabase
          .from('appointments')
          .select('customer_id')
          .eq('staff_id', staffId)
          .eq('status', 'completed')

        const clientCounts = new Map<string, number>()
        regularClientsData?.forEach(apt => {
          const count = clientCounts.get(apt.customer_id) || 0
          clientCounts.set(apt.customer_id, count + 1)
        })
        const regularClients = Array.from(clientCounts.values()).filter(count => count >= 3).length

        // Fetch breaks
        const { data: breaks } = await supabase
          .from('staff_schedules')
          .select('break_start, break_end')
          .eq('staff_id', staffId)
          .gte('date', today.toISOString())
          .lt('date', new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString())

        // Calculate stats
        const completedToday = todayAppts?.filter(apt => apt.status === 'completed').length || 0
        const upcomingToday = todayAppts?.filter(apt => apt.status === 'confirmed' || apt.status === 'pending').length || 0
        const weeklyEarnings = weeklyAppts?.reduce((sum, apt) => sum + Number(apt.computed_total_price || 0), 0) || 0
        const monthlyEarnings = monthlyAppts?.reduce((sum, apt) => sum + Number(apt.computed_total_price || 0), 0) || 0
        const avgRating = reviews?.length ? 
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0

        setStats({
          todayAppointments: todayAppts?.length || 0,
          completedToday,
          upcomingToday,
          weeklyEarnings,
          monthlyEarnings,
          averageRating: Math.round(avgRating * 10) / 10,
          totalReviews: reviews?.length || 0,
          regularClients
        })

        // Format schedule
        setTodaysSchedule(
          (todayAppts || []).map(apt => ({
            time: format(new Date(apt.start_time), 'HH:mm'),
            customer: (apt.customers && typeof apt.customers === 'object' && 'first_name' in apt.customers) ? 
              `${(apt.customers as CustomerData).first_name} ${(apt.customers as CustomerData).last_name}` : 'Unknown',
            service: apt.appointment_services?.[0]?.services?.name || 'Unknown Service',
            duration: apt.computed_total_duration ? `${apt.computed_total_duration} min` : '30 min',
            status: apt.status === 'completed' ? 'completed' : 
                   apt.status === 'in_progress' ? 'in-progress' : 'upcoming'
          }))
        )

        // Format breaks
        setUpcomingBreaks(
          (breaks || []).map(brk => {
            const breakData = brk as BreakData
            return {
              time: (breakData.break_start && breakData.break_end) ? 
                `${format(new Date(breakData.break_start), 'HH:mm')} - ${format(new Date(breakData.break_end), 'HH:mm')}` : '',
              type: 'Break'
            }
          })
        )

        // Format reviews
        setRecentReviews(
          (reviews || []).slice(0, 3).map(review => ({
            customer: (review.customers && typeof review.customers === 'object' && 'first_name' in review.customers) ? 
              `${(review.customers as CustomerData).first_name} ${(review.customers as CustomerData).last_name}` : 'Anonymous',
            rating: review.rating,
            comment: review.comment || '',
            date: format(new Date(review.created_at), 'MMM d')
          }))
        )

        // Calculate top services
        const { data: serviceStats } = await supabase
          .from('appointments')
          .select(`
            appointment_services (
              services (name, price)
            )
          `)
          .eq('staff_id', staffId)
          .eq('status', 'completed')
          .gte('start_time', monthStart.toISOString())

        const serviceMap = new Map<string, { count: number; revenue: number }>()
        serviceStats?.forEach(apt => {
          const appointmentWithServices = apt as AppointmentWithServices
          appointmentWithServices.appointment_services?.forEach((as) => {
            if (as.services?.name) {
              const existing = serviceMap.get(as.services.name) || { count: 0, revenue: 0 }
              serviceMap.set(as.services.name, {
                count: existing.count + 1,
                revenue: existing.revenue + (as.services?.price || 0)
              })
            }
          })
        })

        setTopServices(
          Array.from(serviceMap.entries())
            .map(([service, data]) => ({ service, ...data }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 3)
        )
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [supabase])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-24" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <DashboardStatsCards stats={stats} />
      <DashboardQuickActions />
      <DashboardSchedule schedule={todaysSchedule} breaks={upcomingBreaks} />
      <DashboardReviews reviews={recentReviews} />
      <DashboardPerformance data={{ topServices, regularClients: stats.regularClients }} />
    </div>
  )
}