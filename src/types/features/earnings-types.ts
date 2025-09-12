import { Database } from '@/types/database.types'

export type StaffEarning = Database['public']['Tables']['staff_earnings']['Row']

export interface EarningsStats {
  todayEarnings: number
  weekEarnings: number
  monthEarnings: number
  yearEarnings: number
  todayTips: number
  monthTips: number
  averagePerAppointment: number
  topService: string
  commissionRate: number
  targetProgress: number
}

export type TimeRange = 'week' | 'month' | 'year'