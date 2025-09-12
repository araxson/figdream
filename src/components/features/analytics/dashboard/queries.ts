export interface DashboardReview {
  id: string
  customer_name: string
  rating: number
  comment: string
  created_at: string
  salon_name?: string
}

export interface DashboardSalon {
  id: string
  name: string
  location: string
  rating: number
  total_bookings: number
  revenue: number
}

export interface StaffStats {
  totalStaff: number
  activeToday: number
  onTimeOff: number
  averageRating: number
}

export async function fetchDashboardReviews(): Promise<DashboardReview[]> {
  // This would be replaced with actual API call
  return []
}

export async function fetchDashboardSalons(): Promise<DashboardSalon[]> {
  // This would be replaced with actual API call
  return []
}

export async function getRecentReviews(): Promise<DashboardReview[]> {
  return fetchDashboardReviews()
}

export async function getSalonOverview(): Promise<DashboardSalon[]> {
  return fetchDashboardSalons()
}

export async function getStaffStats(): Promise<StaffStats> {
  return {
    totalStaff: 0,
    activeToday: 0,
    onTimeOff: 0,
    averageRating: 0
  }
}