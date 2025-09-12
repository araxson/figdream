import { Database } from '@/types/database.types'

export type TimeOffRequest = Database['public']['Tables']['time_off_requests']['Row']

export interface TimeOffFormData {
  startDate: string
  endDate: string
  reason: string
}

export interface TimeOffStats {
  approvedDays: number
  pendingDays: number
  remainingDays: number
}