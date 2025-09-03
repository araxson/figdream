'use server'

import { getStaffPerformanceMetrics, getStaffRevenueBreakdown, getStaffServiceStats } from '@/lib/data-access/staff'

export async function fetchStaffPerformanceData(staffId: string) {
  const [metrics, revenue, services] = await Promise.all([
    getStaffPerformanceMetrics(staffId),
    getStaffRevenueBreakdown(staffId),
    getStaffServiceStats(staffId)
  ])
  
  return { metrics, revenue, services }
}