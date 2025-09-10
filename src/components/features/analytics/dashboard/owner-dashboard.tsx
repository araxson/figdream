"use client"

import { useEffect, useState } from 'react'
import { DashboardStats, TodayAppointment, TopService } from './dashboard-types'
import { DashboardStatsCards } from './dashboard-stats'
import { QuickActions } from './quick-actions'
import { AppointmentsAndServices } from './appointments-services'
import { StaffPerformance } from './staff-performance'
import { MonthlyOverview } from './monthly-overview'
import { createClient } from '@/lib/supabase/client'
import { Skeleton } from '@/components/ui/skeleton'
import { format, startOfDay, startOfMonth } from 'date-fns'

export function OwnerDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    todayRevenue: 0,
    monthlyRevenue: 0,
    todayAppointments: 0,
    completedToday: 0,
    upcomingToday: 0,
    weeklyEarnings: 0,
    monthlyEarnings: 0,
    totalCustomers: 0,
    averageRating: 0,
    totalReviews: 0,
    regularClients: 0,
    activeStaff: 0,
    totalServices: 0
  })
  const [todaysAppointments, setTodaysAppointments] = useState<TodayAppointment[]>([])
  const [topServices, setTopServices] = useState<TopService[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const today = startOfDay(new Date())
        const monthStart = startOfMonth(new Date())

        // Fetch today's appointments
        const { data: todayAppts } = await supabase
          .from('appointments')
          .select(`
            id,
            start_time,
            computed_total_price,
            customer:profiles!appointments_customer_id_fkey (first_name, last_name),
            appointment_services (services (name)),
            staff:staff_profiles!appointments_staff_id_fkey (user:profiles!staff_profiles_user_id_fkey (first_name, last_name))
          `)
          .gte('start_time', today.toISOString())
          .lt('start_time', new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString())
          .order('start_time')

        // Fetch monthly revenue
        const { data: monthlyAppts } = await supabase
          .from('appointments')
          .select('computed_total_price')
          .gte('start_time', monthStart.toISOString())
          .eq('status', 'completed')

        // Fetch customer count
        const { count: customerCount } = await supabase
          .from('customers')
          .select('*', { count: 'exact', head: true })

        // Fetch reviews
        const { data: reviews } = await supabase
          .from('reviews')
          .select('rating')

        // Fetch active staff
        const { count: staffCount } = await supabase
          .from('staff_profiles')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true)

        // Fetch services
        const { count: serviceCount } = await supabase
          .from('services')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true)

        // Calculate stats
        const todayRevenue = todayAppts?.reduce((sum, apt) => sum + Number(apt.computed_total_price || 0), 0) || 0
        const monthlyRevenue = monthlyAppts?.reduce((sum, apt) => sum + Number(apt.computed_total_price || 0), 0) || 0
        const avgRating = reviews?.length ? 
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0

        setStats({
          todayRevenue,
          monthlyRevenue,
          todayAppointments: todayAppts?.length || 0,
          completedToday: 0,
          upcomingToday: 0,
          weeklyEarnings: 0,
          monthlyEarnings: monthlyRevenue,
          totalCustomers: customerCount || 0,
          averageRating: Math.round(avgRating * 10) / 10,
          totalReviews: reviews?.length || 0,
          regularClients: 0,
          activeStaff: staffCount || 0,
          totalServices: serviceCount || 0
        })

        // Format today's appointments
        setTodaysAppointments(
          (todayAppts || []).slice(0, 4).map(apt => ({
            time: format(new Date(apt.start_time), 'HH:mm'),
            customer: apt.customer ? 
              `${apt.customer.first_name || ''} ${apt.customer.last_name || ''}`.trim() || 'Unknown' : 'Unknown',
            service: apt.appointment_services?.[0]?.services?.name || 'Unknown Service',
            staff: apt.staff?.user ? 
              `${apt.staff.user.first_name || ''} ${apt.staff.user.last_name || ''}`.trim() || 'Unknown' : 'Unknown'
          }))
        )

        // Fetch top services
        const { data: serviceStats } = await supabase
          .from('appointments')
          .select(`
            appointment_services (
              services (
                id,
                name
              )
            ),
            computed_total_price
          `)
          .gte('start_time', monthStart.toISOString())
          .eq('status', 'completed')

        // Group by service
        const serviceMap = new Map<string, { count: number; revenue: number }>()
        serviceStats?.forEach(apt => {
          apt.appointment_services?.forEach(as => {
            if (as.services?.name) {
              const existing = serviceMap.get(as.services.name) || { count: 0, revenue: 0 }
              serviceMap.set(as.services.name, {
                count: existing.count + 1,
                revenue: existing.revenue + Number(apt.computed_total_price || 0)
              })
            }
          })
        })

        setTopServices(
          Array.from(serviceMap.entries())
            .map(([service, data]) => ({ service, ...data }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 4)
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
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <DashboardStatsCards stats={stats} />
      <QuickActions />
      <AppointmentsAndServices appointments={todaysAppointments} services={topServices} />
      <StaffPerformance />
      <MonthlyOverview stats={stats} />
    </div>
  )
}