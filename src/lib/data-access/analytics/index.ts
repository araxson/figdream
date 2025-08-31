'use server'

import { createClient } from '@/lib/database/supabase/server'
import { Database } from '@/types/database.types'
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns'

// Get comprehensive analytics for a salon
export async function getSalonAnalytics(salonId: string, dateRange?: { start: Date; end: Date }) {
  const supabase = await createClient()
  
  const start = dateRange?.start || startOfMonth(new Date())
  const end = dateRange?.end || endOfMonth(new Date())
  
  // Fetch multiple data points in parallel
  const [
    appointments,
    customers,
    revenue,
    services,
    staff,
    reviews
  ] = await Promise.all([
    getAppointmentAnalytics(salonId, start, end),
    getCustomerAnalytics(salonId, start, end),
    getRevenueAnalytics(salonId, start, end),
    getServiceAnalytics(salonId, start, end),
    getStaffAnalytics(salonId, start, end),
    getReviewAnalytics(salonId, start, end)
  ])
  
  return {
    appointments,
    customers,
    revenue,
    services,
    staff,
    reviews,
    period: {
      start: format(start, 'yyyy-MM-dd'),
      end: format(end, 'yyyy-MM-dd')
    }
  }
}

// Appointment Analytics
async function getAppointmentAnalytics(salonId: string, start: Date, end: Date) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('salon_id', salonId)
    .gte('start_time', start.toISOString())
    .lte('start_time', end.toISOString())
  
  if (error) {
    console.error('Error fetching appointment analytics:', error)
    return null
  }
  
  const total = data.length
  const completed = data.filter(a => a.status === 'completed').length
  const cancelled = data.filter(a => a.status === 'cancelled').length
  const noShow = data.filter(a => a.status === 'no_show').length
  
  // Calculate daily distribution
  const byDay: Record<string, number> = {}
  data.forEach(appointment => {
    const day = format(new Date(appointment.start_time), 'yyyy-MM-dd')
    byDay[day] = (byDay[day] || 0) + 1
  })
  
  // Calculate hourly distribution
  const byHour: Record<number, number> = {}
  data.forEach(appointment => {
    const hour = new Date(appointment.start_time).getHours()
    byHour[hour] = (byHour[hour] || 0) + 1
  })
  
  return {
    total,
    completed,
    cancelled,
    noShow,
    completionRate: total > 0 ? (completed / total * 100).toFixed(1) : '0',
    cancellationRate: total > 0 ? (cancelled / total * 100).toFixed(1) : '0',
    byDay,
    byHour,
    averagePerDay: total > 0 ? (total / Object.keys(byDay).length).toFixed(1) : '0'
  }
}

// Customer Analytics
async function getCustomerAnalytics(salonId: string, start: Date, end: Date) {
  const supabase = await createClient()
  
  // Get new customers
  const { data: newCustomers, error: newError } = await supabase
    .from('customers')
    .select('*')
    .eq('salon_id', salonId)
    .gte('created_at', start.toISOString())
    .lte('created_at', end.toISOString())
  
  // Get returning customers (those with multiple appointments)
  const { data: appointments, error: apptError } = await supabase
    .from('appointments')
    .select('customer_id')
    .eq('salon_id', salonId)
    .gte('start_time', start.toISOString())
    .lte('start_time', end.toISOString())
  
  if (newError || apptError) {
    console.error('Error fetching customer analytics:', newError || apptError)
    return null
  }
  
  const uniqueCustomers = new Set(appointments?.map(a => a.customer_id))
  const customerVisits: Record<string, number> = {}
  appointments?.forEach(a => {
    if (a.customer_id) {
      customerVisits[a.customer_id] = (customerVisits[a.customer_id] || 0) + 1
    }
  })
  
  const returningCustomers = Object.values(customerVisits).filter(visits => visits > 1).length
  
  return {
    newCustomers: newCustomers?.length || 0,
    totalCustomers: uniqueCustomers.size,
    returningCustomers,
    retentionRate: uniqueCustomers.size > 0 
      ? (returningCustomers / uniqueCustomers.size * 100).toFixed(1) 
      : '0',
    averageVisits: appointments?.length && uniqueCustomers.size > 0
      ? (appointments.length / uniqueCustomers.size).toFixed(1)
      : '0'
  }
}

// Revenue Analytics
async function getRevenueAnalytics(salonId: string, start: Date, end: Date) {
  const supabase = await createClient()
  
  const { data: appointments, error } = await supabase
    .from('appointments')
    .select(`
      *,
      appointment_services (
        service_id,
        price,
        services (
          name,
          category
        )
      )
    `)
    .eq('salon_id', salonId)
    .eq('status', 'completed')
    .gte('start_time', start.toISOString())
    .lte('start_time', end.toISOString())
  
  if (error) {
    console.error('Error fetching revenue analytics:', error)
    return null
  }
  
  let totalRevenue = 0
  const revenueByDay: Record<string, number> = {}
  const revenueByCategory: Record<string, number> = {}
  
  appointments?.forEach(appointment => {
    const day = format(new Date(appointment.start_time), 'yyyy-MM-dd')
    
    appointment.appointment_services?.forEach(service => {
      const amount = service.price || 0
      totalRevenue += amount
      revenueByDay[day] = (revenueByDay[day] || 0) + amount
      
      const category = service.services?.category || 'Other'
      revenueByCategory[category] = (revenueByCategory[category] || 0) + amount
    })
  })
  
  const dailyAverage = Object.keys(revenueByDay).length > 0
    ? totalRevenue / Object.keys(revenueByDay).length
    : 0
  
  return {
    totalRevenue: totalRevenue.toFixed(2),
    dailyAverage: dailyAverage.toFixed(2),
    appointmentCount: appointments?.length || 0,
    averageTicket: appointments?.length > 0 
      ? (totalRevenue / appointments.length).toFixed(2)
      : '0',
    revenueByDay,
    revenueByCategory
  }
}

// Service Analytics
async function getServiceAnalytics(salonId: string, start: Date, end: Date) {
  const supabase = await createClient()
  
  const { data: appointmentServices, error } = await supabase
    .from('appointment_services')
    .select(`
      *,
      services (
        id,
        name,
        category,
        duration
      ),
      appointments!inner (
        salon_id,
        start_time,
        status
      )
    `)
    .eq('appointments.salon_id', salonId)
    .eq('appointments.status', 'completed')
    .gte('appointments.start_time', start.toISOString())
    .lte('appointments.start_time', end.toISOString())
  
  if (error) {
    console.error('Error fetching service analytics:', error)
    return null
  }
  
  const serviceCount: Record<string, number> = {}
  const serviceRevenue: Record<string, number> = {}
  const categoryCount: Record<string, number> = {}
  
  appointmentServices?.forEach(item => {
    const serviceName = item.services?.name || 'Unknown'
    const category = item.services?.category || 'Other'
    const revenue = item.price || 0
    
    serviceCount[serviceName] = (serviceCount[serviceName] || 0) + 1
    serviceRevenue[serviceName] = (serviceRevenue[serviceName] || 0) + revenue
    categoryCount[category] = (categoryCount[category] || 0) + 1
  })
  
  // Get top services
  const topServices = Object.entries(serviceCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({
      name,
      count,
      revenue: serviceRevenue[name] || 0
    }))
  
  return {
    totalServices: appointmentServices?.length || 0,
    uniqueServices: Object.keys(serviceCount).length,
    topServices,
    categoryBreakdown: categoryCount
  }
}

// Staff Analytics
async function getStaffAnalytics(salonId: string, start: Date, end: Date) {
  const supabase = await createClient()
  
  const { data: appointments, error } = await supabase
    .from('appointments')
    .select(`
      *,
      staff_profiles (
        id,
        full_name,
        display_name
      ),
      appointment_services (
        price
      )
    `)
    .eq('salon_id', salonId)
    .gte('start_time', start.toISOString())
    .lte('start_time', end.toISOString())
  
  if (error) {
    console.error('Error fetching staff analytics:', error)
    return null
  }
  
  const staffMetrics: Record<string, {
    appointments: number
    completed: number
    revenue: number
    utilization: number
  }> = {}
  
  appointments?.forEach(appointment => {
    const staffName = appointment.staff_profiles?.display_name || 
                     appointment.staff_profiles?.full_name || 
                     'Unknown'
    
    if (!staffMetrics[staffName]) {
      staffMetrics[staffName] = {
        appointments: 0,
        completed: 0,
        revenue: 0,
        utilization: 0
      }
    }
    
    staffMetrics[staffName].appointments++
    
    if (appointment.status === 'completed') {
      staffMetrics[staffName].completed++
      
      appointment.appointment_services?.forEach(service => {
        staffMetrics[staffName].revenue += service.price || 0
      })
    }
  })
  
  // Calculate utilization (simplified - appointments / working days)
  const workingDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  Object.keys(staffMetrics).forEach(staff => {
    staffMetrics[staff].utilization = 
      (staffMetrics[staff].appointments / workingDays * 100) / 8 // Assuming 8 appointments per day is 100%
  })
  
  return {
    totalStaff: Object.keys(staffMetrics).length,
    staffMetrics,
    topPerformers: Object.entries(staffMetrics)
      .sort(([, a], [, b]) => b.revenue - a.revenue)
      .slice(0, 3)
      .map(([name, metrics]) => ({ name, ...metrics }))
  }
}

// Review Analytics
async function getReviewAnalytics(salonId: string, start: Date, end: Date) {
  const supabase = await createClient()
  
  const { data: reviews, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('salon_id', salonId)
    .gte('created_at', start.toISOString())
    .lte('created_at', end.toISOString())
  
  if (error) {
    console.error('Error fetching review analytics:', error)
    return null
  }
  
  const totalReviews = reviews?.length || 0
  const averageRating = totalReviews > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
    : 0
  
  const ratingDistribution: Record<number, number> = {
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0
  }
  
  reviews?.forEach(review => {
    ratingDistribution[review.rating] = (ratingDistribution[review.rating] || 0) + 1
  })
  
  return {
    totalReviews,
    averageRating: averageRating.toFixed(1),
    ratingDistribution,
    recentReviews: reviews?.slice(0, 5) || []
  }
}

// Get comparison data for period-over-period analysis
export async function getComparisonAnalytics(salonId: string) {
  const currentStart = startOfMonth(new Date())
  const currentEnd = endOfMonth(new Date())
  const previousStart = startOfMonth(subMonths(new Date(), 1))
  const previousEnd = endOfMonth(subMonths(new Date(), 1))
  
  const [current, previous] = await Promise.all([
    getSalonAnalytics(salonId, { start: currentStart, end: currentEnd }),
    getSalonAnalytics(salonId, { start: previousStart, end: previousEnd })
  ])
  
  return {
    current,
    previous,
    changes: calculateChanges(current, previous)
  }
}

// Calculate percentage changes
function calculateChanges(current: any, previous: any) {
  const calculateChange = (cur: number, prev: number) => {
    if (prev === 0) return cur > 0 ? 100 : 0
    return ((cur - prev) / prev * 100).toFixed(1)
  }
  
  return {
    appointments: calculateChange(
      current.appointments?.total || 0,
      previous.appointments?.total || 0
    ),
    revenue: calculateChange(
      parseFloat(current.revenue?.totalRevenue || '0'),
      parseFloat(previous.revenue?.totalRevenue || '0')
    ),
    customers: calculateChange(
      current.customers?.totalCustomers || 0,
      previous.customers?.totalCustomers || 0
    ),
    averageRating: calculateChange(
      parseFloat(current.reviews?.averageRating || '0'),
      parseFloat(previous.reviews?.averageRating || '0')
    )
  }
}