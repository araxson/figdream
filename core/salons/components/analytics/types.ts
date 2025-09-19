export interface SalonAnalyticsProps {
  salonId: string
}

export interface RevenueDataPoint {
  month: string
  revenue: number
  bookings: number
  avgTicket: number
}

export interface ServicePerformance {
  name: string
  bookings: number
  revenue: number
  growth: number
}

export interface CustomerSegment {
  name: string
  value: number
  count: number
}

export interface HourlyBooking {
  hour: string
  bookings: number
}

export interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: any
  prefix?: string
  suffix?: string
}

export const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']