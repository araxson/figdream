// Dashboard types
import type { Database } from '@/types/database.types'

export type Salon = Database['organization']['Tables']['salons']['Row']
export type Appointment = Database['scheduling']['Tables']['appointments']['Row']
export type Staff = Database['organization']['Tables']['staff_profiles']['Row']
export type Revenue = Database['public']['Tables']['revenue_analytics']['Row']

export interface DashboardMetrics {
  totalRevenue: number
  totalAppointments: number
  totalCustomers: number
  totalStaff: number
  averageRating: number
  revenueGrowth: number
  appointmentGrowth: number
  customerGrowth: number
}

export interface RevenueChartData {
  date: string
  revenue: number
  appointments: number
}

export interface TopService {
  id: string
  name: string
  bookings: number
  revenue: number
}

export interface StaffPerformance {
  id: string
  name: string
  appointments: number
  revenue: number
  rating: number
}

export interface DashboardFilters {
  dateRange: {
    start: Date
    end: Date
  }
  salonId?: string
  locationId?: string
}