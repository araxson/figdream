// Core booking types aligned with database schema
import type { Database } from '@/types/database.types'

// Database table types
export type Appointment = Database['public']['Tables']['appointments']['Row']
export type AppointmentService = Database['public']['Tables']['appointment_services']['Row']
export type Service = Database['public']['Tables']['services']['Row']
export type ServiceCategory = Database['public']['Tables']['service_categories']['Row']
export type StaffProfile = Database['public']['Tables']['staff_profiles']['Row']
export type StaffSchedule = Database['public']['Tables']['staff_schedules']['Row']

// Booking status enum matching database
export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'checked_in'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show'

// Payment status enum
export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'partially_paid'
  | 'failed'
  | 'refunded'

// Booking wizard step types
export type BookingStep =
  | 'service'
  | 'staff'
  | 'datetime'
  | 'customer'
  | 'addons'
  | 'payment'
  | 'confirmation'

// Booking wizard state
export interface BookingWizardState {
  currentStep: BookingStep
  selectedServices: ServiceSelection[]
  selectedStaff: string | null
  selectedDate: Date | null
  selectedTime: string | null
  customerInfo: CustomerInfo | null
  selectedAddons: ServiceSelection[]
  paymentMethod: PaymentMethod | null
  specialRequests?: string
  bookingSource: 'online' | 'phone' | 'walk-in' | 'app'
}

// Service selection with details
export interface ServiceSelection {
  serviceId: string
  serviceName: string
  categoryId: string
  categoryName: string
  duration: number
  price: number
  staffId?: string
  quantity: number
}

// Customer information
export interface CustomerInfo {
  id?: string
  firstName: string
  lastName: string
  email: string
  phone: string
  notes?: string
  isNewCustomer: boolean
  marketingOptIn?: boolean
}

// Payment method
export interface PaymentMethod {
  id?: string
  type: 'card' | 'cash' | 'bank_transfer' | 'other'
  lastFour?: string
  brand?: string
}

// Time slot availability
export interface TimeSlot {
  time: string
  available: boolean
  staffId?: string
  staffName?: string
  capacity?: number
  booked?: number
}

// Daily availability
export interface DailyAvailability {
  date: Date
  slots: TimeSlot[]
  isFullyBooked: boolean
  isClosed: boolean
}

// Staff availability
export interface StaffAvailability {
  staffId: string
  staffName: string
  avatar?: string
  rating?: number
  nextAvailable: Date | null
  dailyAvailability: DailyAvailability[]
}

// Booking confirmation details
export interface BookingConfirmation {
  confirmationCode: string
  appointment: Appointment
  services: AppointmentService[]
  staff: StaffProfile
  salon: {
    id: string
    name: string
    address: string
    phone: string
    email: string
  }
  totalAmount: number
  depositAmount?: number
  cancellationPolicy?: string
  reminderSettings?: {
    email: boolean
    sms: boolean
    hours: number
  }
}

// Booking filter options
export interface BookingFilters {
  status?: BookingStatus[]
  staffId?: string
  customerId?: string
  dateRange?: {
    start: Date
    end: Date
  }
  searchTerm?: string
}

// Extended appointment with all required fields
export interface ExtendedAppointment extends Appointment {
  confirmation_code?: string
  total_amount?: number
  deposit_amount?: number
  appointment_services?: AppointmentService[]
  staff?: StaffProfile
  salon?: {
    id: string
    name: string
    address?: string
  }
}

// Booking list item
export interface BookingListItem extends Appointment {
  customerName: string
  staffName: string
  services: string[]
  isPastDue?: boolean
  canReschedule?: boolean
  canCancel?: boolean
}

// Recurring appointment settings
export interface RecurringSettings {
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly'
  interval: number
  endDate?: Date
  occurrences?: number
  daysOfWeek?: number[] // 0-6 for weekly
  dayOfMonth?: number // for monthly
}

// Group booking
export interface GroupBooking {
  leadCustomerId: string
  participants: CustomerInfo[]
  sharedServices?: ServiceSelection[]
  individualServices?: Map<string, ServiceSelection[]>
  preferSameStaff?: boolean
}

// Waiting list entry
export interface WaitingListEntry {
  id: string
  customerId: string
  customerName: string
  serviceIds: string[]
  preferredStaffId?: string
  preferredDate?: Date
  preferredTimeRange?: {
    start: string
    end: string
  }
  flexibleDates?: boolean
  priority: number
  createdAt: Date
  notified?: boolean
  notifiedAt?: Date
}

// Real-time update types
export interface BookingUpdate {
  type: 'new' | 'updated' | 'cancelled' | 'rescheduled'
  appointmentId: string
  appointment?: Appointment
  timestamp: Date
  triggeredBy?: string
}

// Conflict detection
export interface BookingConflict {
  type: 'double_booking' | 'insufficient_time' | 'staff_unavailable' | 'resource_unavailable'
  description: string
  conflictingAppointments?: Appointment[]
  suggestedAlternatives?: TimeSlot[]
}

// Capacity tracking
export interface CapacityInfo {
  date: Date
  totalSlots: number
  bookedSlots: number
  availableSlots: number
  utilizationPercentage: number
  peakHours?: string[]
}

// Booking analytics
export interface BookingAnalytics {
  totalBookings: number
  completedBookings: number
  cancelledBookings: number
  noShowBookings: number
  averageLeadTime: number // hours
  peakBookingTimes: string[]
  popularServices: Array<{
    serviceId: string
    serviceName: string
    count: number
  }>
  topStaff: Array<{
    staffId: string
    staffName: string
    bookings: number
    rating?: number
  }>
}