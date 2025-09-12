export interface DashboardStats {
  todayAppointments: number
  completedToday: number
  upcomingToday: number
  weeklyEarnings: number
  monthlyEarnings: number
  averageRating: number
  totalReviews: number
  regularClients: number
  // Owner dashboard specific
  todayRevenue?: number
  monthlyRevenue?: number
  totalCustomers?: number
  activeStaff?: number
  totalServices?: number
}

export interface ScheduleItem {
  time: string
  customer: string
  service: string
  duration: string
  status: 'completed' | 'in-progress' | 'upcoming' | 'break'
}

export interface TopService {
  service: string
  count: number
  revenue: number
}

export interface PerformanceMetric {
  label: string
  value: string | number
  change?: string
  trend?: 'up' | 'down'
}

export interface TodayAppointment {
  time: string
  customer: string
  service: string
  staff: string
}

export interface StaffPerformance {
  name: string
  appointments: number
  revenue: number
  rating: number
}