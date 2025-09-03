// Service selection types
export interface SelectedService {
  id: string
  name: string
  price: number
  duration: number
  category_id?: string
  category_name?: string
  quantity: number
  description?: string
}

// Staff member types
export interface StaffMember {
  id: string
  first_name: string
  last_name: string
  display_name?: string
  avatar_url?: string
  specialties?: string[]
  available?: boolean
  bio?: string
}

// Time slot types
export interface TimeSlot {
  start_time: string
  end_time: string
  available: boolean
  staff_id?: string
  duration?: number
}