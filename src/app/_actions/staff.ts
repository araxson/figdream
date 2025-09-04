'use server'

import { getStaffPerformanceMetrics, getStaffRevenueBreakdown, getStaffServiceStats } from '@/lib/data-access/staff'
import { requireResourceAccess } from '@/lib/data-access/auth/dal-security'

export async function fetchStaffPerformanceData(staffId: string) {
  // CRITICAL: Use secure DAL auth pattern for CVE-2025-29927
  await requireResourceAccess('staff', staffId)
  
  const [metrics, revenue, services] = await Promise.all([
    getStaffPerformanceMetrics(staffId),
    getStaffRevenueBreakdown(staffId),
    getStaffServiceStats(staffId)
  ])
  
  return { metrics, revenue, services }
}