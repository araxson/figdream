import { Database } from '@/types/database.types'

type Tables = Database['public']['Tables']
type StaffProfile = Tables['staff_profiles']['Row']

export interface StaffWithDetails extends StaffProfile {
  user?: Tables['profiles']['Row']
  staff_schedules?: Tables['staff_schedules']['Row'][]
  staff_services?: Tables['staff_services']['Row'][]
  staff_specialties?: Tables['staff_specialties']['Row'][]
  staff_time_off?: Tables['staff_time_off']['Row'][]
  staff_breaks?: Tables['staff_breaks']['Row'][]
  appointments?: Tables['appointments']['Row'][]
  staff_earnings?: Tables['staff_earnings']['Row'][]
  utilization_rate?: number
  average_rating?: number
  total_appointments?: number
  total_revenue?: number
}

export interface StaffFilters {
  salon_id?: string
  location_id?: string
  is_active?: boolean
  specialties?: string[]
  services?: string[]
  available_on?: string
}

export interface StaffScheduleUpdate {
  staff_id: string
  day_of_week: number
  start_time: string
  end_time: string
  is_available: boolean
}

export interface StaffTimeOffRequest {
  staff_id: string
  start_date: string
  end_date: string
  reason: string
  type: 'vacation' | 'sick' | 'personal' | 'other'
}

export interface StaffServiceAssignment {
  staff_id: string
  service_ids: string[]
}

export interface StaffSpecialtyAssignment {
  staff_id: string
  specialty_ids: string[]
}

export interface StaffEarningsFilters {
  staff_id: string
  start_date?: string
  end_date?: string
  type?: 'commission' | 'tip' | 'bonus' | 'other'
}

export interface StaffUtilizationOptions {
  staff_id: string
  start_date: string
  end_date: string
  include_breaks?: boolean
}