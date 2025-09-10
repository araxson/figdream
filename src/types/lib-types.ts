/**
 * Centralized type definitions and utilities
 * All components should import types from here instead of directly from database.types.ts
 */

import { Database } from '@/types/database.types'

// Database type shortcuts
export type Tables = Database['public']['Tables']
export type Enums = Database['public']['Enums']
export type Views = Database['public']['Views']

// Table row types
export type Appointment = Tables['appointments']['Row']
export type Customer = Tables['customers']['Row']
export type Salon = Tables['salons']['Row']
export type StaffProfile = Tables['staff_profiles']['Row']
export type Service = Tables['services']['Row']
export type ServiceCategory = Tables['service_categories']['Row']
export type Review = Tables['reviews']['Row']
export type SalonLocation = Tables['salon_locations']['Row']
export type UserRole = Tables['user_roles']['Row']
export type Profile = Tables['profiles']['Row']

// Insert types
export type AppointmentInsert = Tables['appointments']['Insert']
export type CustomerInsert = Tables['customers']['Insert']
export type SalonInsert = Tables['salons']['Insert']
export type ServiceInsert = Tables['services']['Insert']
export type ReviewInsert = Tables['reviews']['Insert']

// Update types
export type AppointmentUpdate = Tables['appointments']['Update']
export type CustomerUpdate = Tables['customers']['Update']
export type SalonUpdate = Tables['salons']['Update']
export type ServiceUpdate = Tables['services']['Update']
export type ReviewUpdate = Tables['reviews']['Update']

// Enum types
export type AppointmentStatus = Enums['appointment_status']
export type PaymentMethod = Enums['payment_method']
export type UserRoleType = Enums['user_role_type']
export type NotificationType = Enums['notification_type']
export type BreakType = Enums['break_type']
export type PreferenceType = Enums['preference_type']

// Extended types with relations
export interface AppointmentWithRelations extends Appointment {
  customers?: Customer
  staff_profiles?: StaffProfile
  salons?: Salon
  appointment_services?: Array<{
    id: string
    service_id: string
    appointment_id: string
    price?: number
    duration?: number
    services?: Service
  }>
}

export interface ServiceWithCategory extends Service {
  service_categories?: ServiceCategory
}

export interface StaffWithServices extends StaffProfile {
  staff_services?: Array<{
    id: string
    staff_id: string
    service_id: string
    services?: Service
  }>
}

export interface SalonWithRelations extends Salon {
  salon_locations?: SalonLocation[]
  services?: Service[]
  staff_profiles?: StaffProfile[]
}

export interface CustomerWithAppointments extends Customer {
  appointments?: Appointment[]
}

// Common filter types
export interface PaginationParams {
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface DateRangeFilter {
  startDate?: string
  endDate?: string
}

export interface AppointmentFilters extends PaginationParams, DateRangeFilter {
  status?: AppointmentStatus
  salonId?: string
  staffId?: string
  customerId?: string
  serviceId?: string
}

export interface ServiceFilters extends PaginationParams {
  categoryId?: string
  salonId?: string
  isActive?: boolean
  minPrice?: number
  maxPrice?: number
}

// Response types
export interface ApiResponse<T> {
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

// Utility types
export type ID = string
export type Timestamp = string
export type DateString = string
export type TimeString = string
export type Currency = number

// User with roles
export interface UserWithRoles {
  id: string
  email: string
  profile?: Profile
  user_roles?: UserRole[]
}

// Revenue types for manual tracking
export interface RevenueData {
  appointmentId: string
  salonId: string
  staffId?: string
  customerId?: string
  totalAmount: Currency
  tipAmount?: Currency
  paymentMethod: PaymentMethod
  paymentCollected: boolean
  date: DateString
}

// Dashboard metric types
export interface DashboardMetrics {
  totalRevenue: Currency
  totalAppointments: number
  totalCustomers: number
  averageRating: number
  topServices: ServiceStats[]
  recentAppointments: AppointmentWithRelations[]
}

export interface ServiceStats {
  serviceId: string
  serviceName: string
  count: number
  revenue: Currency
}

// Form schemas types
export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  email: string
  password: string
  fullName: string
  phone?: string
}

export interface AppointmentFormData {
  customerId: string
  salonId: string
  staffId?: string
  serviceIds: string[]
  appointmentDate: DateString
  startTime: TimeString
  notes?: string
}