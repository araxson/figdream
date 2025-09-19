'use server'

import { getDashboardMetrics, getRevenueChart, getTodayAppointments, getStaffPerformance } from '../dal'
import { revalidatePath } from 'next/cache'

export async function fetchDashboardData(salonId: string) {
  try {
    const [metrics, revenue, appointments, staff] = await Promise.all([
      getDashboardMetrics(salonId),
      getRevenueChart(salonId, 30),
      getTodayAppointments(salonId),
      getStaffPerformance(salonId)
    ])

    return {
      metrics,
      revenue,
      appointments,
      staff,
      success: true
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return {
      metrics: null,
      revenue: [],
      appointments: [],
      staff: [],
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch dashboard data'
    }
  }
}

export async function refreshDashboard(salonId: string) {
  const data = await fetchDashboardData(salonId)
  revalidatePath('/dashboard')
  return data
}