import { Database } from '@/types/database.types'

export type StaffSchedule = Database['public']['Tables']['staff_schedules']['Row']
export type StaffBreak = Database['public']['Tables']['staff_breaks']['Row']
export type TimeOffRequest = Database['public']['Tables']['time_off_requests']['Row']

export interface ScheduleData {
  schedules: StaffSchedule[]
  breaks: StaffBreak[]
  timeOffRequests: TimeOffRequest[]
}

export interface ScheduleFormData {
  dayOfWeek: number
  startTime: string
  endTime: string
}

export interface BreakFormData {
  breakDate: string
  startTime: string
  endTime: string
}