// Re-export database types
export type { Database, Json } from './database.types'

// Table type aliases for easier access
import { Database } from './database.types'

// Raw table types
export type Tables = Database['public']['Tables']
export type Views = Database['public']['Views']
export type Enums = Database['public']['Enums']

// Individual table types
export type Appointment = Tables['appointments']['Row']
export type AppointmentInsert = Tables['appointments']['Insert']
export type AppointmentUpdate = Tables['appointments']['Update']

export type Customer = Tables['customers']['Row']
export type CustomerInsert = Tables['customers']['Insert']
export type CustomerUpdate = Tables['customers']['Update']

export type Salon = Tables['salons']['Row']
export type SalonInsert = Tables['salons']['Insert']
export type SalonUpdate = Tables['salons']['Update']

export type Staff = Tables['staff_profiles']['Row']
export type StaffInsert = Tables['staff_profiles']['Insert']
export type StaffUpdate = Tables['staff_profiles']['Update']

export type Service = Tables['services']['Row']
export type ServiceInsert = Tables['services']['Insert']
export type ServiceUpdate = Tables['services']['Update']

export type Review = Tables['reviews']['Row']
export type ReviewInsert = Tables['reviews']['Insert']
export type ReviewUpdate = Tables['reviews']['Update']

export type UserRole = Tables['user_roles']['Row']
export type UserRoleInsert = Tables['user_roles']['Insert']
export type UserRoleUpdate = Tables['user_roles']['Update']

export type Location = Tables['salon_locations']['Row']
export type LocationInsert = Tables['salon_locations']['Insert']
export type LocationUpdate = Tables['salon_locations']['Update']

// Enum types
export type AppointmentStatus = Enums['appointment_status']
export type PaymentMethod = Enums['payment_method']
export type UserRoleType = Enums['user_role_type']
export type NotificationType = Enums['notification_type']
export type BreakType = Enums['break_type']
export type PreferenceType = Enums['preference_type']

// Utility types
export type ID = string
export type Timestamp = string
export type DateString = string
export type TimeString = string

// Common response types
export interface ApiResponse<T = unknown> {
  data?: T
  error?: {
    message: string
    code?: string
  }
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// User with role
export interface UserWithRole {
  id: string
  email: string
  roles: UserRole[]
}

// Appointment with relations
export interface AppointmentWithRelations extends Appointment {
  customer?: Customer
  staff?: Staff
  salon?: Salon
  // services is already in Appointment as Json, use service_details for expanded services
  service_details?: Service[]
}

// Service with category
export interface ServiceWithCategory extends Service {
  category?: Tables['service_categories']['Row']
}

// Staff with schedule
export interface StaffWithSchedule extends Staff {
  schedules?: Tables['staff_schedules']['Row'][]
  services?: Service[]
}