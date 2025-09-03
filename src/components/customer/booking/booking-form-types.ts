import { z } from 'zod'
import type { Database } from '@/types/database.types'
import type { SelectedService } from './service-selector'
import type { StaffMember } from './staff-selector'
import type { TimeSlot } from './time-slot-picker'

export type Appointment = Database['public']['Tables']['appointments']['Row']

// Booking form validation schema
export const bookingFormSchema = z.object({
  // Customer information (for walk-ins or guests)
  customer: z.object({
    first_name: z.string().min(1, 'First name is required').max(50),
    last_name: z.string().min(1, 'Last name is required').max(50),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits').max(20),
  }).optional(),
  
  // Booking details
  booking_date: z.string().min(1, 'Date is required'),
  start_time: z.string().min(1, 'Start time is required'),
  end_time: z.string().min(1, 'End time is required'),
  location_id: z.string().min(1, 'Location is required'),
  staff_id: z.string().optional(),
  
  // Services
  services: z.array(z.string()).min(1, 'At least one service must be selected'),
  
  // Additional details
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
  special_requests: z.string().max(500, 'Special requests must be less than 500 characters').optional(),
  
  // Preferences
  send_reminders: z.boolean().default(true),
  marketing_consent: z.boolean().default(false),
  
  // Payment (for deposits)
  deposit_required: z.boolean().default(false),
  deposit_amount: z.number().optional(),
  payment_method: z.enum(['cash', 'card', 'online']).optional(),
})

export type BookingFormData = z.infer<typeof bookingFormSchema>

export interface BookingFormProps {
  locationId: string
  className?: string
  onBookingSuccess?: (booking: Appointment) => void
  onBookingError?: (error: string) => void
  initialDate?: Date
  initialServices?: SelectedService[]
  initialStaff?: StaffMember
  isWalkIn?: boolean
  currentUser?: {
    id: string
    first_name: string
    last_name: string
    email: string
    phone: string | null
  } | null
  businessRules?: {
    require_deposit: boolean
    deposit_percentage: number
    min_advance_hours: number
    max_advance_days: number
    allow_walk_ins: boolean
  }
  disabled?: boolean
}

export interface BookingTotals {
  totalPrice: number
  totalDuration: number
  depositAmount: number
  finalAmount: number
}

export interface BookingStep {
  id: string
  title: string
  icon: React.ComponentType<{ className?: string }>
}

export interface StepContentProps {
  form: unknown // Will be the UseFormReturn type from react-hook-form
  selectedServices: SelectedService[]
  setSelectedServices: (services: SelectedService[]) => void
  selectedStaff: StaffMember | null
  setSelectedStaff: (staff: StaffMember | null) => void
  selectedDate: Date
  setSelectedDate: (date: Date) => void
  selectedTimeSlot: TimeSlot | null
  setSelectedTimeSlot: (slot: TimeSlot | null) => void
  customStartTime: string
  setCustomStartTime: (time: string) => void
  timeSelectionMethod: 'slots' | 'custom'
  setTimeSelectionMethod: (method: 'slots' | 'custom') => void
  locationId: string
  totals: BookingTotals
  businessRules: BookingFormProps['businessRules']
  isWalkIn: boolean
  currentUser: BookingFormProps['currentUser']
  disabled: boolean
  submitError: string | null
}