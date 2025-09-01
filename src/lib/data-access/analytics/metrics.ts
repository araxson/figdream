import { Database } from '@/types/database.types'
import { createServerClient } from '@/lib/database/supabase/server'
import { cache } from 'react'
import { startOfMonth, endOfMonth, subMonths, startOfDay, endOfDay, subDays } from 'date-fns'

type Appointment = Database['public']['Tables']['appointments']['Row']
type LoyaltyTransaction = Database['public']['Tables']['loyalty_transactions']['Row']
type Customer = Database['public']['Tables']['customers']['Row']
type Service = Database['public']['Tables']['services']['Row']

/**
 * Get revenue metrics for a salon
 */
export const getRevenueMetrics = cache(async (salonId: string, period: 'day' | 'week' | 'month' | 'year' = 'month') => {
  const supabase = await createServerClient()
  
  // Calculate date range based on period
  const now = new Date()
  let startDate: Date
  let previousStartDate: Date
  
  switch (period) {
    case 'day':
      startDate = startOfDay(now)
      previousStartDate = startOfDay(subDays(now, 1))
      break
    case 'week':
      startDate = subDays(now, 7)
      previousStartDate = subDays(now, 14)
      break
    case 'month':
      startDate = startOfMonth(now)
      previousStartDate = startOfMonth(subMonths(now, 1))
      break
    case 'year':
      startDate = subMonths(now, 12)
      previousStartDate = subMonths(now, 24)
      break
  }

  // Get current period appointments with revenue
  const { data: currentAppointments, error: currentError } = await supabase
    .from('appointments')
    .select('total_amount, created_at, status')
    .eq('salon_id', salonId)
    .eq('status', 'completed')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', now.toISOString())

  // Get previous period appointments for comparison
  const { data: previousAppointments, error: previousError } = await supabase
    .from('appointments')
    .select('total_amount, created_at, status')
    .eq('salon_id', salonId)
    .eq('status', 'completed')
    .gte('created_at', previousStartDate.toISOString())
    .lt('created_at', startDate.toISOString())

  if (currentError || previousError) {
    console.error('Error fetching revenue metrics:', currentError || previousError)
    return {
      currentRevenue: 0,
      previousRevenue: 0,
      growth: 0,
      appointments: [],
      dailyRevenue: []
    }
  }

  const currentRevenue = currentAppointments?.reduce((sum, apt) => {
    return sum + (apt.total_amount || 0)
  }, 0) || 0

  const previousRevenue = previousAppointments?.reduce((sum, apt) => {
    return sum + (apt.total_amount || 0)
  }, 0) || 0

  const growth = previousRevenue > 0 
    ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
    : 0

  // Calculate daily revenue for charts
  const dailyRevenue = calculateDailyRevenue(currentAppointments || [], startDate, now)

  return {
    currentRevenue,
    previousRevenue,
    growth,
    appointments: currentAppointments || [],
    dailyRevenue
  }
})

/**
 * Get customer analytics for a salon
 */
export const getCustomerMetrics = cache(async (salonId: string) => {
  const supabase = await createServerClient()
  
  const now = new Date()
  const thirtyDaysAgo = subDays(now, 30)
  const sixtyDaysAgo = subDays(now, 60)

  // Get total customers
  const { count: totalCustomers } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true })
    .eq('salon_id', salonId)

  // Get new customers in last 30 days
  const { count: newCustomers } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true })
    .eq('salon_id', salonId)
    .gte('created_at', thirtyDaysAgo.toISOString())

  // Get returning customers (had appointments in both periods)
  const { data: returningData } = await supabase
    .from('appointments')
    .select('customer_id')
    .eq('salon_id', salonId)
    .gte('scheduled_at', sixtyDaysAgo.toISOString())
    .lte('scheduled_at', thirtyDaysAgo.toISOString())

  const { data: recentData } = await supabase
    .from('appointments')
    .select('customer_id')
    .eq('salon_id', salonId)
    .gte('scheduled_at', thirtyDaysAgo.toISOString())

  const returningCustomerIds = new Set(returningData?.map(a => a.customer_id) || [])
  const recentCustomerIds = new Set(recentData?.map(a => a.customer_id) || [])
  const returningCount = [...recentCustomerIds].filter(id => returningCustomerIds.has(id)).length

  const retentionRate = totalCustomers && totalCustomers > 0 
    ? (returningCount / totalCustomers) * 100 
    : 0

  // Get customer lifetime value
  const { data: ltv } = await supabase
    .from('transactions')
    .select('customer_id, amount')
    .eq('salon_id', salonId)
    .eq('type', 'payment')

  const customerSpending = ltv?.reduce((acc, t) => {
    if (t.customer_id) {
      acc[t.customer_id] = (acc[t.customer_id] || 0) + (t.amount || 0)
    }
    return acc
  }, {} as Record<string, number>) || {}

  const avgLifetimeValue = Object.values(customerSpending).length > 0
    ? Object.values(customerSpending).reduce((sum, val) => sum + val, 0) / Object.values(customerSpending).length
    : 0

  return {
    totalCustomers: totalCustomers || 0,
    newCustomers: newCustomers || 0,
    returningCustomers: returningCount,
    retentionRate,
    avgLifetimeValue,
    customerGrowth: calculateCustomerGrowth(totalCustomers || 0, newCustomers || 0)
  }
})

/**
 * Get service popularity metrics
 */
export const getServiceMetrics = cache(async (salonId: string) => {
  const supabase = await createServerClient()
  
  const thirtyDaysAgo = subDays(new Date(), 30)

  // Get service bookings in last 30 days
  const { data: bookings } = await supabase
    .from('appointment_services')
    .select(`
      service_id,
      services (
        id,
        name,
        category_id,
        price,
        duration,
        service_categories (
          name
        )
      ),
      appointments!inner (
        scheduled_at,
        status,
        salon_id
      )
    `)
    .eq('appointments.salon_id', salonId)
    .gte('appointments.scheduled_at', thirtyDaysAgo.toISOString())
    .eq('appointments.status', 'completed')

  // Calculate service popularity
  const serviceStats = bookings?.reduce((acc, booking) => {
    if (booking.service_id && booking.services) {
      if (!acc[booking.service_id]) {
        acc[booking.service_id] = {
          id: booking.service_id,
          name: booking.services.name,
          category: booking.services.service_categories?.name || 'Uncategorized',
          bookings: 0,
          revenue: 0,
          avgDuration: booking.services.duration || 0
        }
      }
      acc[booking.service_id].bookings++
      acc[booking.service_id].revenue += booking.services.price || 0
    }
    return acc
  }, {} as Record<string, any>) || {}

  const topServices = Object.values(serviceStats)
    .sort((a, b) => b.bookings - a.bookings)
    .slice(0, 10)

  const categoryBreakdown = Object.values(serviceStats).reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = { bookings: 0, revenue: 0 }
    }
    acc[service.category].bookings += service.bookings
    acc[service.category].revenue += service.revenue
    return acc
  }, {} as Record<string, any>)

  return {
    topServices,
    categoryBreakdown,
    totalServices: Object.keys(serviceStats).length,
    totalBookings: bookings?.length || 0
  }
})

/**
 * Get staff utilization metrics
 */
export const getStaffUtilization = cache(async (salonId: string) => {
  const supabase = await createServerClient()
  
  const now = new Date()
  const thirtyDaysAgo = subDays(now, 30)

  // Get staff with their appointments
  const { data: staffData } = await supabase
    .from('staff_profiles')
    .select(`
      id,
      first_name,
      last_name,
      appointments (
        id,
        scheduled_at,
        duration,
        status
      )
    `)
    .eq('salon_id', salonId)
    .eq('is_active', true)

  const utilization = staffData?.map(staff => {
    const validAppointments = staff.appointments?.filter(
      a => a.status === 'completed' && 
      new Date(a.scheduled_at) >= thirtyDaysAgo
    ) || []

    const totalMinutesWorked = validAppointments.reduce(
      (sum, a) => sum + (a.duration || 0), 0
    )

    // Assume 8 hours per day, 22 working days per month
    const availableMinutes = 8 * 60 * 22
    const utilizationRate = availableMinutes > 0 
      ? (totalMinutesWorked / availableMinutes) * 100 
      : 0

    return {
      id: staff.id,
      name: `${staff.first_name} ${staff.last_name}`,
      appointments: validAppointments.length,
      hoursWorked: totalMinutesWorked / 60,
      utilizationRate: Math.min(utilizationRate, 100) // Cap at 100%
    }
  }) || []

  const avgUtilization = utilization.length > 0
    ? utilization.reduce((sum, s) => sum + s.utilizationRate, 0) / utilization.length
    : 0

  return {
    staffUtilization: utilization.sort((a, b) => b.utilizationRate - a.utilizationRate),
    avgUtilization,
    totalStaff: utilization.length
  }
})

/**
 * Get booking patterns and peak hours
 */
export const getBookingPatterns = cache(async (salonId: string) => {
  const supabase = await createServerClient()
  
  const thirtyDaysAgo = subDays(new Date(), 30)

  const { data: appointments } = await supabase
    .from('appointments')
    .select('scheduled_at, status')
    .eq('salon_id', salonId)
    .gte('scheduled_at', thirtyDaysAgo.toISOString())
    .in('status', ['completed', 'confirmed'])

  // Calculate hourly distribution
  const hourlyDistribution = new Array(24).fill(0)
  const dayDistribution = new Array(7).fill(0)

  appointments?.forEach(apt => {
    const date = new Date(apt.scheduled_at)
    const hour = date.getHours()
    const day = date.getDay()
    
    hourlyDistribution[hour]++
    dayDistribution[day]++
  })

  // Find peak hours
  const peakHour = hourlyDistribution.indexOf(Math.max(...hourlyDistribution))
  const peakDay = dayDistribution.indexOf(Math.max(...dayDistribution))

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  return {
    hourlyDistribution,
    dayDistribution,
    peakHour: `${peakHour}:00 - ${peakHour + 1}:00`,
    peakDay: dayNames[peakDay],
    totalBookings: appointments?.length || 0
  }
})

/**
 * Get comprehensive dashboard summary
 */
export const getDashboardSummary = cache(async (salonId: string) => {
  const [revenue, customers, services, staff, patterns] = await Promise.all([
    getRevenueMetrics(salonId, 'month'),
    getCustomerMetrics(salonId),
    getServiceMetrics(salonId),
    getStaffUtilization(salonId),
    getBookingPatterns(salonId)
  ])

  return {
    revenue: {
      current: revenue.currentRevenue,
      growth: revenue.growth,
      chart: revenue.dailyRevenue
    },
    customers: {
      total: customers.totalCustomers,
      new: customers.newCustomers,
      retention: customers.retentionRate
    },
    services: {
      popular: services.topServices.slice(0, 5),
      categories: services.categoryBreakdown
    },
    staff: {
      utilization: staff.avgUtilization,
      top: staff.staffUtilization.slice(0, 5)
    },
    patterns: {
      peakHour: patterns.peakHour,
      peakDay: patterns.peakDay,
      hourly: patterns.hourlyDistribution
    }
  }
})

// Helper functions
function calculateDailyRevenue(appointments: Appointment[], startDate: Date, endDate: Date) {
  const dailyMap = new Map<string, number>()
  
  // Initialize all days with 0
  let currentDate = new Date(startDate)
  while (currentDate <= endDate) {
    dailyMap.set(currentDate.toISOString().split('T')[0], 0)
    currentDate.setDate(currentDate.getDate() + 1)
  }

  // Sum appointment revenue by day
  appointments.forEach(apt => {
    if (apt.created_at && apt.total_amount) {
      const day = new Date(apt.created_at).toISOString().split('T')[0]
      dailyMap.set(day, (dailyMap.get(day) || 0) + apt.total_amount)
    }
  })

  return Array.from(dailyMap.entries()).map(([date, amount]) => ({
    date,
    amount
  }))
}

function calculateCustomerGrowth(total: number, newCustomers: number): number {
  if (total === 0) return 0
  return (newCustomers / (total - newCustomers)) * 100
}