/**
 * Booking form types aligned with database schema
 */
import { Service, StaffProfile } from '@/types/db-types'

// Service selection types - extends database Service type
export interface SelectedService extends Pick<Service, 'id' | 'name' | 'price' | 'description'> {
  duration: number // Maps to duration_minutes from Service
  category_id?: string | null
  category_name?: string
  quantity: number
}

// Staff member types - based on database StaffProfile
export interface StaffMember extends Pick<StaffProfile, 'id' | 'first_name' | 'last_name' | 'avatar_url' | 'bio'> {
  display_name?: string
  specialties?: string[]
  available?: boolean
}

// Time slot types
export interface TimeSlot {
  start_time: string
  end_time: string
  available: boolean
  staff_id?: string
  duration?: number
}