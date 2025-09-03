/**
 * Booking validation schemas for FigDream
 * Comprehensive Zod schemas for booking creation, updates, cancellation, and management
 */
import { z } from 'zod'
import { locationIdSchema } from './salon-schema'
import { serviceIdSchema } from './service-schema'
import { userIdSchema } from './user-schema'
// Booking status enum
const BookingStatus = z.enum(['pending', 'confirmed', 'cancelled', 'completed', 'no_show'], {
  message: 'Invalid booking status'
})
// Time format regex (HH:MM or HH:MM:SS)
const timeRegex = /^([01]?\d|2[0-3]):([0-5]?\d)(?::([0-5]?\d))?$/
const dateRegex = /^\d{4}-\d{2}-\d{2}$/
// UUID regex for ID validation
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
// Base validation schemas
export const bookingIdSchema = z
  .string()
  .regex(uuidRegex, 'Invalid booking ID format')
// Import these from salon-schema to avoid duplicate exports
export const staffIdSchema = z
  .string()
  .nullable()
  .optional()
  .refine((val) => !val || uuidRegex.test(val), {
    message: 'Invalid staff ID format'
  })
export const bookingDateSchema = z
  .string()
  .regex(dateRegex, 'Date must be in YYYY-MM-DD format')
  .refine((date) => {
    const bookingDate = new Date(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return bookingDate >= today
  }, {
    message: 'Booking date cannot be in the past'
  })
  .refine((date) => {
    const bookingDate = new Date(date)
    const maxDate = new Date()
    maxDate.setMonth(maxDate.getMonth() + 6) // 6 months in advance
    return bookingDate <= maxDate
  }, {
    message: 'Booking date cannot be more than 6 months in advance'
  })
export const timeSchema = z
  .string()
  .regex(timeRegex, 'Time must be in HH:MM format')
  .refine((time) => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59
  }, {
    message: 'Invalid time format'
  })
export const priceSchema = z
  .number()
  .min(0, 'Price cannot be negative')
  .max(10000, 'Price cannot exceed $10,000')
  .multipleOf(0.01, 'Price must have at most 2 decimal places')
export const durationSchema = z
  .number()
  .min(15, 'Service duration must be at least 15 minutes')
  .max(480, 'Service duration cannot exceed 8 hours')
  .multipleOf(15, 'Duration must be in 15-minute increments')
export const notesSchema = z
  .string()
  .optional()
  .nullable()
  .refine((val) => !val || val.length <= 500, {
    message: 'Notes must be less than 500 characters'
  })
  .transform((val) => val?.trim() || null)
// Booking service schema
export const bookingServiceSchema = z.object({
  service_id: serviceIdSchema,
  price: priceSchema,
  duration_minutes: durationSchema,
  staff_id: staffIdSchema
})
// Create booking schema
export const createBookingSchema = z.object({
  customer_id: userIdSchema,
  location_id: locationIdSchema,
  staff_id: staffIdSchema,
  booking_date: bookingDateSchema,
  start_time: timeSchema,
  services: z
    .array(bookingServiceSchema)
    .min(1, 'At least one service is required')
    .max(10, 'Cannot book more than 10 services at once'),
  notes: notesSchema,
  deposit_amount: z
    .number()
    .optional()
    .nullable()
    .refine((val) => val === null || val === undefined || val >= 0, {
      message: 'Deposit amount cannot be negative'
    })
    .transform((val) => val || null)
}).refine((data) => {
  // Validate that end time doesn't exceed business hours
  const startTime = data.start_time
  const totalDuration = data.services.reduce((sum, service) => sum + service.duration_minutes, 0)
  const [startHours, startMinutes] = startTime.split(':').map(Number)
  const startMinutesTotal = startHours * 60 + startMinutes
  const endMinutesTotal = startMinutesTotal + totalDuration
  const endHours = Math.floor(endMinutesTotal / 60)
  return endHours < 24 // Don't allow bookings that go past midnight
}, {
  message: 'Booking duration extends beyond business hours',
  path: ['services']
}).refine((data) => {
  // Validate consistent staff selection (if staff is specified for the booking, all services should have the same staff or no staff specified)
  if (data.staff_id) {
    return data.services.every(service => !service.staff_id || service.staff_id === data.staff_id)
  }
  return true
}, {
  message: 'All services must be performed by the same staff member',
  path: ['services']
})
// Update booking schema
export const updateBookingSchema = z.object({
  booking_id: bookingIdSchema,
  booking_date: bookingDateSchema.optional(),
  start_time: timeSchema.optional(),
  services: z
    .array(bookingServiceSchema)
    .min(1, 'At least one service is required')
    .max(10, 'Cannot book more than 10 services at once')
    .optional(),
  notes: notesSchema,
  deposit_amount: z
    .number()
    .optional()
    .nullable()
    .refine((val) => val === null || val === undefined || val >= 0, {
      message: 'Deposit amount cannot be negative'
    })
    .transform((val) => val || null)
}).refine((data) => {
  // At least one field should be provided for update
  return Object.keys(data).length > 1 // more than just booking_id
}, {
  message: 'At least one field must be provided for update'
})
// Cancel booking schema
export const cancelBookingSchema = z.object({
  booking_id: bookingIdSchema,
  reason: z
    .string()
    .optional()
    .nullable()
    .refine((val) => !val || val.length <= 250, {
      message: 'Cancellation reason must be less than 250 characters'
    })
    .transform((val) => val?.trim() || null),
  refund_requested: z.boolean().optional().default(false)
}).refine((data) => {
  // If refund is requested, reason should be provided
  if (data.refund_requested && !data.reason) {
    return false
  }
  return true
}, {
  message: 'Reason is required when requesting a refund',
  path: ['reason']
})
// Confirm booking schema
export const confirmBookingSchema = z.object({
  booking_id: bookingIdSchema,
  confirmed_by: userIdSchema,
  confirmation_notes: z
    .string()
    .optional()
    .nullable()
    .refine((val) => !val || val.length <= 250, {
      message: 'Confirmation notes must be less than 250 characters'
    })
    .transform((val) => val?.trim() || null)
})
// Complete booking schema
export const completeBookingSchema = z.object({
  booking_id: bookingIdSchema,
  completed_by: userIdSchema,
  actual_duration: z
    .number()
    .optional()
    .nullable()
    .refine((val) => val === null || val === undefined || (val >= 5 && val <= 600), {
      message: 'Actual duration must be between 5 and 600 minutes'
    }),
  completion_notes: z
    .string()
    .optional()
    .nullable()
    .refine((val) => !val || val.length <= 500, {
      message: 'Completion notes must be less than 500 characters'
    })
    .transform((val) => val?.trim() || null),
  tip_amount: z
    .number()
    .optional()
    .nullable()
    .refine((val) => val === null || val === undefined || val >= 0, {
      message: 'Tip amount cannot be negative'
    })
    .refine((val) => val === null || val === undefined || val <= 1000, {
      message: 'Tip amount cannot exceed $1,000'
    })
})
// Mark no-show schema
export const markNoShowSchema = z.object({
  booking_id: bookingIdSchema,
  marked_by: userIdSchema,
  no_show_reason: z
    .string()
    .optional()
    .nullable()
    .refine((val) => !val || val.length <= 250, {
      message: 'No-show reason must be less than 250 characters'
    })
    .transform((val) => val?.trim() || null)
})
// Reschedule booking schema
export const rescheduleBookingSchema = z.object({
  booking_id: bookingIdSchema,
  new_booking_date: bookingDateSchema,
  new_start_time: timeSchema,
  reschedule_reason: z
    .string()
    .optional()
    .nullable()
    .refine((val) => !val || val.length <= 250, {
      message: 'Reschedule reason must be less than 250 characters'
    })
    .transform((val) => val?.trim() || null)
}).refine((data) => {
  // Validate the new time slot doesn't conflict with business rules
  const newDateTime = new Date(`${data.new_booking_date}T${data.new_start_time}`)
  const now = new Date()
  const minRescheduleTime = new Date(now.getTime() + 2 * 60 * 60 * 1000) // 2 hours minimum notice
  return newDateTime >= minRescheduleTime
}, {
  message: 'Bookings must be rescheduled at least 2 hours in advance',
  path: ['new_booking_date']
})
// Booking search/filter schema
export const bookingFilterSchema = z.object({
  customer_id: userIdSchema.optional(),
  location_id: locationIdSchema.optional(),
  staff_id: staffIdSchema.optional(),
  status: BookingStatus.optional(),
  start_date: z
    .string()
    .regex(dateRegex, 'Start date must be in YYYY-MM-DD format')
    .optional(),
  end_date: z
    .string()
    .regex(dateRegex, 'End date must be in YYYY-MM-DD format')
    .optional(),
  service_ids: z
    .array(serviceIdSchema)
    .optional(),
  page: z
    .number()
    .int()
    .min(1, 'Page must be at least 1')
    .optional()
    .default(1),
  limit: z
    .number()
    .int()
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .optional()
    .default(20),
  sort_by: z
    .enum(['booking_date', 'created_at', 'status', 'total_price'])
    .optional()
    .default('booking_date'),
  sort_order: z
    .enum(['asc', 'desc'])
    .optional()
    .default('asc')
}).refine((data) => {
  if (data.start_date && data.end_date) {
    return new Date(data.start_date) <= new Date(data.end_date)
  }
  return true
}, {
  message: 'Start date must be before or equal to end date',
  path: ['end_date']
})
// Booking availability check schema
export const availabilityCheckSchema = z.object({
  location_id: locationIdSchema,
  staff_id: staffIdSchema.optional(),
  service_ids: z
    .array(serviceIdSchema)
    .min(1, 'At least one service is required'),
  preferred_date: bookingDateSchema,
  time_preference: z
    .enum(['morning', 'afternoon', 'evening', 'any'])
    .optional()
    .default('any')
})
// Booking reminder preferences schema
export const reminderPreferencesSchema = z.object({
  booking_id: bookingIdSchema,
  email_reminder: z.boolean().optional().default(true),
  sms_reminder: z.boolean().optional().default(false),
  reminder_hours_before: z
    .number()
    .int()
    .min(1, 'Reminder must be at least 1 hour before')
    .max(168, 'Reminder cannot be more than 7 days (168 hours) before')
    .optional()
    .default(24)
})
// Bulk operations schema
export const bulkUpdateBookingsSchema = z.object({
  booking_ids: z
    .array(bookingIdSchema)
    .min(1, 'At least one booking ID is required')
    .max(50, 'Cannot update more than 50 bookings at once'),
  updates: z.object({
    status: BookingStatus.optional(),
    notes: notesSchema.optional(),
    staff_id: staffIdSchema.optional()
  }).refine((data) => {
    return Object.keys(data).length > 0
  }, {
    message: 'At least one update field must be provided'
  })
})
// Partial schemas for updates
export const createBookingUpdateSchema = createBookingSchema.partial().omit({ customer_id: true })
export const updateBookingPartialSchema = updateBookingSchema.partial()
// Type exports
export type CreateBookingInput = z.infer<typeof createBookingSchema>
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>
export type ConfirmBookingInput = z.infer<typeof confirmBookingSchema>
export type CompleteBookingInput = z.infer<typeof completeBookingSchema>
export type MarkNoShowInput = z.infer<typeof markNoShowSchema>
export type RescheduleBookingInput = z.infer<typeof rescheduleBookingSchema>
export type BookingFilterInput = z.infer<typeof bookingFilterSchema>
export type AvailabilityCheckInput = z.infer<typeof availabilityCheckSchema>
export type ReminderPreferencesInput = z.infer<typeof reminderPreferencesSchema>
export type BulkUpdateBookingsInput = z.infer<typeof bulkUpdateBookingsSchema>
export type BookingServiceInput = z.infer<typeof bookingServiceSchema>
// Update type exports
export type CreateBookingUpdateInput = z.infer<typeof createBookingUpdateSchema>
export type UpdateBookingPartialInput = z.infer<typeof updateBookingPartialSchema>