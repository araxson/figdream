import type { Json, TableDefinition, Relationship } from '@/core/shared/types/base.types'
import type { AppointmentStatus, PaymentStatus } from '@/core/shared/types/enums.types'

// Appointments Domain Types
export interface AppointmentsTables {
  appointment_services: TableDefinition<
    AppointmentServiceRow,
    AppointmentServiceInsert,
    AppointmentServiceUpdate,
    AppointmentServiceRelationships
  >
  appointments: TableDefinition<
    AppointmentRow,
    AppointmentInsert,
    AppointmentUpdate,
    AppointmentRelationships
  >
  blocked_times: TableDefinition<
    BlockedTimeRow,
    BlockedTimeInsert,
    BlockedTimeUpdate,
    BlockedTimeRelationships
  >
}

// Appointment Services Types
export interface AppointmentServiceRow {
  appointment_id: string | null
  completed_at: string | null
  created_at: string | null
  discount_percentage: number | null
  duration_minutes: number | null
  end_time: string | null
  id: string | null
  is_completed: boolean | null
  notes: string | null
  quantity: number | null
  service_id: string | null
  service_name: string | null
  service_order: number | null
  staff_id: string | null
  start_time: string | null
  subtotal: number | null
  unit_price: number | null
}

export interface AppointmentServiceInsert {
  appointment_id?: string | null
  completed_at?: string | null
  created_at?: string | null
  discount_percentage?: number | null
  duration_minutes?: number | null
  end_time?: string | null
  id?: string | null
  is_completed?: boolean | null
  notes?: string | null
  quantity?: number | null
  service_id?: string | null
  service_name?: string | null
  service_order?: number | null
  staff_id?: string | null
  start_time?: string | null
  subtotal?: number | null
  unit_price?: number | null
}

export interface AppointmentServiceUpdate {
  appointment_id?: string | null
  completed_at?: string | null
  created_at?: string | null
  discount_percentage?: number | null
  duration_minutes?: number | null
  end_time?: string | null
  id?: string | null
  is_completed?: boolean | null
  notes?: string | null
  quantity?: number | null
  service_id?: string | null
  service_name?: string | null
  service_order?: number | null
  staff_id?: string | null
  start_time?: string | null
  subtotal?: number | null
  unit_price?: number | null
}

export type AppointmentServiceRelationships = []

// Appointments Types
export interface AppointmentRow {
  booking_source: string | null
  cancellation_reason: string | null
  cancelled_at: string | null
  cancelled_by: string | null
  checked_in_at: string | null
  checked_in_by: string | null
  completed_at: string | null
  completed_by: string | null
  confirmation_code: string | null
  created_at: string | null
  customer_id: string | null
  deposit_amount: number | null
  deposit_paid: boolean | null
  deposit_required: boolean | null
  discount_amount: number | null
  duration_minutes: number | null
  end_time: string | null
  followup_sent: boolean | null
  id: string | null
  internal_notes: string | null
  marked_no_show_at: string | null
  marked_no_show_by: string | null
  metadata: Json | null
  notes: string | null
  paid_at: string | null
  payment_method: string | null
  payment_status: PaymentStatus | null
  preferences: Json | null
  referral_source: string | null
  reminder_sent: boolean | null
  reminder_sent_at: string | null
  resource_id: string | null
  resource_type: string | null
  salon_id: string | null
  service_count: number | null
  staff_id: string | null
  start_time: string | null
  status: AppointmentStatus | null
  subtotal: number | null
  tax_amount: number | null
  tip_amount: number | null
  total_amount: number | null
  updated_at: string | null
}

export interface AppointmentInsert {
  booking_source?: string | null
  cancellation_reason?: string | null
  cancelled_at?: string | null
  cancelled_by?: string | null
  checked_in_at?: string | null
  checked_in_by?: string | null
  completed_at?: string | null
  completed_by?: string | null
  confirmation_code?: string | null
  created_at?: string | null
  customer_id?: string | null
  deposit_amount?: number | null
  deposit_paid?: boolean | null
  deposit_required?: boolean | null
  discount_amount?: number | null
  duration_minutes?: number | null
  end_time?: string | null
  followup_sent?: boolean | null
  id?: string | null
  internal_notes?: string | null
  marked_no_show_at?: string | null
  marked_no_show_by?: string | null
  metadata?: Json | null
  notes?: string | null
  paid_at?: string | null
  payment_method?: string | null
  payment_status?: PaymentStatus | null
  preferences?: Json | null
  referral_source?: string | null
  reminder_sent?: boolean | null
  reminder_sent_at?: string | null
  resource_id?: string | null
  resource_type?: string | null
  salon_id?: string | null
  service_count?: number | null
  staff_id?: string | null
  start_time?: string | null
  status?: AppointmentStatus | null
  subtotal?: number | null
  tax_amount?: number | null
  tip_amount?: number | null
  total_amount?: number | null
  updated_at?: string | null
}

export interface AppointmentUpdate {
  booking_source?: string | null
  cancellation_reason?: string | null
  cancelled_at?: string | null
  cancelled_by?: string | null
  checked_in_at?: string | null
  checked_in_by?: string | null
  completed_at?: string | null
  completed_by?: string | null
  confirmation_code?: string | null
  created_at?: string | null
  customer_id?: string | null
  deposit_amount?: number | null
  deposit_paid?: boolean | null
  deposit_required?: boolean | null
  discount_amount?: number | null
  duration_minutes?: number | null
  end_time?: string | null
  followup_sent?: boolean | null
  id?: string | null
  internal_notes?: string | null
  marked_no_show_at?: string | null
  marked_no_show_by?: string | null
  metadata?: Json | null
  notes?: string | null
  paid_at?: string | null
  payment_method?: string | null
  payment_status?: PaymentStatus | null
  preferences?: Json | null
  referral_source?: string | null
  reminder_sent?: boolean | null
  reminder_sent_at?: string | null
  resource_id?: string | null
  resource_type?: string | null
  salon_id?: string | null
  service_count?: number | null
  staff_id?: string | null
  start_time?: string | null
  status?: AppointmentStatus | null
  subtotal?: number | null
  tax_amount?: number | null
  tip_amount?: number | null
  total_amount?: number | null
  updated_at?: string | null
}

export type AppointmentRelationships = []

// Blocked Times Types
export interface BlockedTimeRow {
  block_type: string | null
  created_at: string | null
  created_by: string | null
  end_time: string | null
  id: string | null
  is_active: boolean | null
  is_recurring: boolean | null
  reason: string | null
  recurrence_pattern: string | null
  salon_id: string | null
  staff_id: string | null
  start_time: string | null
  updated_at: string | null
}

export interface BlockedTimeInsert {
  block_type?: string | null
  created_at?: string | null
  created_by?: string | null
  end_time?: string | null
  id?: string | null
  is_active?: boolean | null
  is_recurring?: boolean | null
  reason?: string | null
  recurrence_pattern?: string | null
  salon_id?: string | null
  staff_id?: string | null
  start_time?: string | null
  updated_at?: string | null
}

export interface BlockedTimeUpdate {
  block_type?: string | null
  created_at?: string | null
  created_by?: string | null
  end_time?: string | null
  id?: string | null
  is_active?: boolean | null
  is_recurring?: boolean | null
  reason?: string | null
  recurrence_pattern?: string | null
  salon_id?: string | null
  staff_id?: string | null
  start_time?: string | null
  updated_at?: string | null
}

export type BlockedTimeRelationships = []