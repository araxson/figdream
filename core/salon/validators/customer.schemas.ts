import { z } from 'zod'

/**
 * Customer creation schema
 */
export const CreateCustomerSchema = z.object({
  email: z.string().email('Invalid email address'),
  display_name: z.string().min(2, 'Name must be at least 2 characters'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  date_of_birth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  marketing_consent: z.boolean().default(false),
  sms_consent: z.boolean().default(false),
  email_consent: z.boolean().default(true)
})

/**
 * Customer update schema (partial)
 */
export const UpdateCustomerSchema = CreateCustomerSchema.partial()

/**
 * Customer preferences schema
 */
export const CustomerPreferencesSchema = z.object({
  notification_preferences: z.object({
    email: z.boolean().default(true),
    sms: z.boolean().default(false),
    push: z.boolean().default(false),
    appointment_reminders: z.boolean().default(true),
    marketing: z.boolean().default(false),
    promotions: z.boolean().default(false)
  }).optional(),
  booking_preferences: z.object({
    preferred_days: z.array(z.number().min(0).max(6)).optional(),
    preferred_times: z.array(z.string()).optional(),
    advance_booking_days: z.number().min(1).max(365).default(30),
    auto_confirm: z.boolean().default(false)
  }).optional(),
  service_preferences: z.array(z.string().uuid()).optional(),
  staff_preferences: z.array(z.string().uuid()).optional()
})

/**
 * Customer note schema
 */
export const CustomerNoteSchema = z.object({
  note: z.string().min(1, 'Note is required').max(1000, 'Note too long'),
  is_private: z.boolean().default(false),
  salon_id: z.string().uuid().optional()
})

/**
 * Common action response type
 */
export interface ActionResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  fieldErrors?: Record<string, string[] | undefined>
  code?: string
  message?: string
}