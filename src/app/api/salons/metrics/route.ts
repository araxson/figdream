import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type SalonMetric = {
  salon_id: string
  salon_name: string
  total_appointments: number
  total_revenue: number
  total_customers: number
  average_rating: number
  staff_count: number
  service_count: number
  completion_rate: number
  growth_rate: number
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const sortBy = searchParams.get('sortBy') || 'revenue'

    // Fetch all active salons
    const { data: salons, error: salonsError } = await supabase
      .from('salons')
      .select('*')
      .eq('is_active', true)

    if (salonsError) {
      console.error('Error fetching salons:', salonsError)
      return NextResponse.json({ error: 'Failed to fetch salons' }, { status: 500 })
    }

    if (!salons) {
      return NextResponse.json({ metrics: [] })
    }

    // Fetch metrics for each salon
    const metricsData: SalonMetric[] = await Promise.all(
      salons.map(async (salon) => {
        try {
          // Fetch appointments count
          const { count: appointmentCount } = await supabase
            .from('appointments')
            .select('*', { count: 'exact', head: true })
            .eq('salon_id', salon.id)

          // Fetch completed appointments for completion rate
          const { count: completedCount } = await supabase
            .from('appointments')
            .select('*', { count: 'exact', head: true })
            .eq('salon_id', salon.id)
            .eq('status', 'completed')

          // Fetch revenue from completed appointments
          const { data: completedAppointments } = await supabase
            .from('appointments')
            .select('computed_total_price')
            .eq('salon_id', salon.id)
            .eq('status', 'completed')

          const totalRevenue = completedAppointments?.reduce((sum, a) => sum + (a.computed_total_price || 0), 0) || 0

          // Fetch unique customers
          const { data: customers } = await supabase
            .from('appointments')
            .select('customer_id')
            .eq('salon_id', salon.id)

          const uniqueCustomers = new Set(customers?.map(c => c.customer_id)).size

          // Fetch reviews and calculate average rating
          const { data: reviews } = await supabase
            .from('reviews')
            .select('rating')
            .eq('salon_id', salon.id)

          const avgRating = reviews && reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0

          // Fetch staff count
          const { count: staffCount } = await supabase
            .from('staff_profiles')
            .select('*', { count: 'exact', head: true })
            .eq('salon_id', salon.id)
            .eq('is_active', true)

          // Fetch service count
          const { count: serviceCount } = await supabase
            .from('services')
            .select('*', { count: 'exact', head: true })
            .eq('salon_id', salon.id)
            .eq('is_active', true)

          // Calculate completion rate
          const completionRate = appointmentCount && appointmentCount > 0
            ? ((completedCount || 0) / appointmentCount) * 100
            : 0

          // Calculate growth rate (compare this month vs last month)
          const currentDate = new Date()
          const lastMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
          const thisMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
          
          const { count: lastMonthAppointments } = await supabase
            .from('appointments')
            .select('*', { count: 'exact', head: true })
            .eq('salon_id', salon.id)
            .gte('created_at', lastMonthStart.toISOString())
            .lt('created_at', thisMonthStart.toISOString())
          
          const { count: thisMonthAppointments } = await supabase
            .from('appointments')
            .select('*', { count: 'exact', head: true })
            .eq('salon_id', salon.id)
            .gte('created_at', thisMonthStart.toISOString())
          
          const growthRate = lastMonthAppointments && lastMonthAppointments > 0
            ? ((thisMonthAppointments || 0) - lastMonthAppointments) / lastMonthAppointments * 100
            : 0

          return {
            salon_id: salon.id,
            salon_name: salon.name,
            total_appointments: appointmentCount || 0,
            total_revenue: totalRevenue,
            total_customers: uniqueCustomers,
            average_rating: avgRating,
            staff_count: staffCount || 0,
            service_count: serviceCount || 0,
            completion_rate: completionRate,
            growth_rate: growthRate
          }
        } catch (error) {
          console.error(`Error fetching metrics for salon ${salon.id}:`, error)
          return {
            salon_id: salon.id,
            salon_name: salon.name,
            total_appointments: 0,
            total_revenue: 0,
            total_customers: 0,
            average_rating: 0,
            staff_count: 0,
            service_count: 0,
            completion_rate: 0,
            growth_rate: 0
          }
        }
      })
    )

    // Sort metrics
    const sorted = [...metricsData].sort((a, b) => {
      if (sortBy === 'revenue') return b.total_revenue - a.total_revenue
      if (sortBy === 'appointments') return b.total_appointments - a.total_appointments
      if (sortBy === 'rating') return b.average_rating - a.average_rating
      return 0
    })

    return NextResponse.json({ metrics: sorted })

  } catch (error) {
    console.error('Error fetching salon metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch salon metrics' },
      { status: 500 }
    )
  }
}