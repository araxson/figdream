/**
 * Salon management validation schemas for FigDream
 * Comprehensive Zod schemas for salon creation, location management, and salon operations
 */

import { z } from 'zod'

// Import reusable schemas
import { 
  emailSchema, 
  phoneSchema, 
  userIdSchema,
  addressSchema,
  citySchema,
  stateSchema,
  zipCodeSchema,
  countrySchema,
  timezoneSchema
} from './user-schema'

// Common regex patterns
const urlRegex = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
// const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/ // Reserved for future use
const colorHexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
const timeRegex = /^([01]?\d|2[0-3]):([0-5]?\d)(?::([0-5]?\d))?$/

// Days of week
const DaysOfWeek = z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'], {
  errorMap: () => ({ message: 'Invalid day of week' })
})

// Base validation schemas
export const salonIdSchema = z
  .string({ required_error: 'Salon ID is required' })
  .regex(uuidRegex, 'Invalid salon ID format')

export const locationIdSchema = z
  .string({ required_error: 'Location ID is required' })
  .regex(uuidRegex, 'Invalid location ID format')

export const salonNameSchema = z
  .string({ required_error: 'Salon name is required' })
  .min(1, 'Salon name is required')
  .max(100, 'Salon name must be less than 100 characters')
  .regex(/^[a-zA-Z0-9\s\-\'&\.!]+$/, 'Salon name contains invalid characters')
  .trim()

export const descriptionSchema = z
  .string()
  .nullable()
  .optional()
  .refine((val) => !val || (val.length >= 10 && val.length <= 1000), {
    message: 'Description must be between 10 and 1000 characters'
  })
  .transform((val) => val?.trim() || null)

export const websiteUrlSchema = z
  .string()
  .nullable()
  .optional()
  .refine((val) => !val || urlRegex.test(val), {
    message: 'Website must be a valid URL'
  })
  .refine((val) => !val || val.length <= 255, {
    message: 'Website URL must be less than 255 characters'
  })
  .transform((val) => val || null)

export const logoUrlSchema = z
  .string()
  .nullable()
  .optional()
  .refine((val) => !val || urlRegex.test(val), {
    message: 'Logo URL must be a valid URL'
  })
  .refine((val) => !val || val.length <= 500, {
    message: 'Logo URL must be less than 500 characters'
  })
  .transform((val) => val || null)

export const businessHoursSchema = z.object({
  day: DaysOfWeek,
  open_time: z
    .string({ required_error: 'Opening time is required' })
    .regex(timeRegex, 'Opening time must be in HH:MM format'),
  close_time: z
    .string({ required_error: 'Closing time is required' })
    .regex(timeRegex, 'Closing time must be in HH:MM format'),
  is_closed: z.boolean().optional().default(false)
}).refine((data) => {
  if (data.is_closed) return true
  
  const [openHour, openMin] = data.open_time.split(':').map(Number)
  const [closeHour, closeMin] = data.close_time.split(':').map(Number)
  const openMinutes = openHour * 60 + openMin
  const closeMinutes = closeHour * 60 + closeMin
  
  return closeMinutes > openMinutes
}, {
  message: 'Closing time must be after opening time',
  path: ['close_time']
})

export const coordinatesSchema = z.object({
  latitude: z
    .number()
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90')
    .nullable()
    .optional(),
  longitude: z
    .number()
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180')
    .nullable()
    .optional()
})

// Salon creation schema
export const createSalonSchema = z.object({
  name: salonNameSchema,
  description: descriptionSchema,
  logo_url: logoUrlSchema,
  website: websiteUrlSchema,
  owner_id: userIdSchema,
  business_license: z
    .string()
    .nullable()
    .optional()
    .refine((val) => !val || val.length <= 50, {
      message: 'Business license must be less than 50 characters'
    })
    .transform((val) => val?.trim() || null),
  tax_id: z
    .string()
    .nullable()
    .optional()
    .refine((val) => !val || val.length <= 20, {
      message: 'Tax ID must be less than 20 characters'
    })
    .transform((val) => val?.trim() || null),
  business_type: z
    .enum(['individual', 'llc', 'corporation', 'partnership', 'other'])
    .optional()
    .default('individual'),
  is_active: z.boolean().optional().default(true)
})

// Update salon schema
export const updateSalonSchema = createSalonSchema.partial().extend({
  salon_id: salonIdSchema
})

// Location creation schema
export const createLocationSchema = z.object({
  salon_id: salonIdSchema,
  name: z
    .string({ required_error: 'Location name is required' })
    .min(1, 'Location name is required')
    .max(100, 'Location name must be less than 100 characters')
    .trim(),
  address: addressSchema.refine((val) => val !== null && val !== undefined, {
    message: 'Address is required for locations'
  }),
  city: citySchema.refine((val) => val !== null && val !== undefined, {
    message: 'City is required for locations'
  }),
  state: stateSchema.refine((val) => val !== null && val !== undefined, {
    message: 'State is required for locations'
  }),
  zip_code: zipCodeSchema.refine((val) => val !== null && val !== undefined, {
    message: 'ZIP code is required for locations'
  }),
  country: countrySchema.default('United States'),
  phone: phoneSchema.refine((val) => val !== null && val !== undefined, {
    message: 'Phone number is required for locations'
  }),
  email: emailSchema.optional(),
  latitude: z
    .number()
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90')
    .nullable()
    .optional(),
  longitude: z
    .number()
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180')
    .nullable()
    .optional(),
  timezone: timezoneSchema,
  business_hours: z
    .array(businessHoursSchema)
    .length(7, 'Business hours must be provided for all 7 days of the week'),
  parking_available: z.boolean().optional().default(false),
  wheelchair_accessible: z.boolean().optional().default(false),
  wifi_available: z.boolean().optional().default(false),
  max_capacity: z
    .number()
    .int()
    .min(1, 'Maximum capacity must be at least 1')
    .max(500, 'Maximum capacity cannot exceed 500')
    .optional()
    .default(20),
  is_active: z.boolean().optional().default(true)
}).refine((data) => {
  // Validate business hours don't have duplicate days
  const days = data.business_hours.map(bh => bh.day)
  const uniqueDays = new Set(days)
  return uniqueDays.size === days.length
}, {
  message: 'Business hours cannot have duplicate days',
  path: ['business_hours']
})

// Update location schema
export const updateLocationSchema = createLocationSchema.partial().extend({
  location_id: locationIdSchema
})

// Salon settings schema
export const salonSettingsSchema = z.object({
  salon_id: salonIdSchema,
  booking_window_days: z
    .number()
    .int()
    .min(1, 'Booking window must be at least 1 day')
    .max(365, 'Booking window cannot exceed 365 days')
    .optional()
    .default(30),
  advance_booking_hours: z
    .number()
    .int()
    .min(1, 'Advance booking must be at least 1 hour')
    .max(168, 'Advance booking cannot exceed 7 days')
    .optional()
    .default(2),
  cancellation_window_hours: z
    .number()
    .int()
    .min(1, 'Cancellation window must be at least 1 hour')
    .max(72, 'Cancellation window cannot exceed 3 days')
    .optional()
    .default(24),
  auto_confirm_bookings: z.boolean().optional().default(false),
  require_deposit: z.boolean().optional().default(false),
  deposit_percentage: z
    .number()
    .min(0, 'Deposit percentage cannot be negative')
    .max(1, 'Deposit percentage cannot exceed 100%')
    .optional()
    .default(0.2),
  late_cancellation_fee: z
    .number()
    .min(0, 'Late cancellation fee cannot be negative')
    .max(500, 'Late cancellation fee cannot exceed $500')
    .optional()
    .default(0),
  no_show_fee: z
    .number()
    .min(0, 'No-show fee cannot be negative')
    .max(500, 'No-show fee cannot exceed $500')
    .optional()
    .default(0),
  allow_online_booking: z.boolean().optional().default(true),
  allow_walk_ins: z.boolean().optional().default(true),
  send_reminders: z.boolean().optional().default(true),
  reminder_hours_before: z
    .number()
    .int()
    .min(1, 'Reminder must be at least 1 hour before')
    .max(168, 'Reminder cannot be more than 7 days before')
    .optional()
    .default(24),
  loyalty_program_enabled: z.boolean().optional().default(false),
  points_per_dollar: z
    .number()
    .min(0, 'Points per dollar cannot be negative')
    .max(10, 'Points per dollar cannot exceed 10')
    .optional()
    .default(1),
  time_zone: timezoneSchema
})

// Salon branding schema
export const salonBrandingSchema = z.object({
  salon_id: salonIdSchema,
  primary_color: z
    .string()
    .regex(colorHexRegex, 'Primary color must be a valid hex color')
    .optional()
    .default('#000000'),
  secondary_color: z
    .string()
    .regex(colorHexRegex, 'Secondary color must be a valid hex color')
    .optional()
    .default('#ffffff'),
  accent_color: z
    .string()
    .regex(colorHexRegex, 'Accent color must be a valid hex color')
    .optional()
    .default('#007bff'),
  logo_url: logoUrlSchema,
  banner_url: z
    .string()
    .nullable()
    .optional()
    .refine((val) => !val || urlRegex.test(val), {
      message: 'Banner URL must be a valid URL'
    })
    .transform((val) => val || null),
  font_family: z
    .enum(['Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 'Open Sans', 'Roboto'])
    .optional()
    .default('Arial'),
  custom_css: z
    .string()
    .nullable()
    .optional()
    .refine((val) => !val || val.length <= 5000, {
      message: 'Custom CSS must be less than 5000 characters'
    })
    .transform((val) => val?.trim() || null)
})

// Salon staff assignment schema
export const salonStaffSchema = z.object({
  salon_id: salonIdSchema,
  location_id: locationIdSchema.optional(),
  user_id: userIdSchema,
  role: z.enum(['salon_admin', 'location_admin', 'staff'], {
    errorMap: () => ({ message: 'Invalid staff role' })
  }),
  employee_id: z
    .string()
    .nullable()
    .optional()
    .refine((val) => !val || val.length <= 20, {
      message: 'Employee ID must be less than 20 characters'
    })
    .transform((val) => val?.trim() || null),
  commission_rate: z
    .number()
    .min(0, 'Commission rate cannot be negative')
    .max(1, 'Commission rate cannot exceed 100%')
    .nullable()
    .optional(),
  hourly_rate: z
    .number()
    .min(0, 'Hourly rate cannot be negative')
    .max(500, 'Hourly rate cannot exceed $500')
    .nullable()
    .optional(),
  start_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),
  end_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format')
    .nullable()
    .optional(),
  is_active: z.boolean().optional().default(true)
}).refine((data) => {
  if (data.end_date) {
    return new Date(data.start_date) <= new Date(data.end_date)
  }
  return true
}, {
  message: 'End date must be after start date',
  path: ['end_date']
})

// Salon analytics preferences schema
export const salonAnalyticsSchema = z.object({
  salon_id: salonIdSchema,
  track_customer_behavior: z.boolean().optional().default(true),
  track_staff_performance: z.boolean().optional().default(true),
  track_revenue_metrics: z.boolean().optional().default(true),
  track_booking_patterns: z.boolean().optional().default(true),
  share_anonymous_data: z.boolean().optional().default(false),
  generate_daily_reports: z.boolean().optional().default(true),
  generate_weekly_reports: z.boolean().optional().default(true),
  generate_monthly_reports: z.boolean().optional().default(true),
  email_reports_to: z
    .array(emailSchema)
    .optional()
    .refine((val) => !val || val.length <= 10, {
      message: 'Cannot send reports to more than 10 email addresses'
    })
})

// Salon search/filter schema
export const salonFilterSchema = z.object({
  owner_id: userIdSchema.optional(),
  is_active: z.boolean().optional(),
  business_type: z
    .enum(['individual', 'llc', 'corporation', 'partnership', 'other'])
    .optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  has_locations: z.boolean().optional(),
  created_after: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional(),
  created_before: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional(),
  search_query: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 2, {
      message: 'Search query must be at least 2 characters'
    }),
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
    .enum(['name', 'created_at', 'updated_at', 'owner_name'])
    .optional()
    .default('created_at'),
  sort_order: z
    .enum(['asc', 'desc'])
    .optional()
    .default('desc')
}).refine((data) => {
  if (data.created_after && data.created_before) {
    return new Date(data.created_after) <= new Date(data.created_before)
  }
  return true
}, {
  message: 'Created after date must be before or equal to created before date',
  path: ['created_before']
})

// Location search/filter schema  
export const locationFilterSchema = z.object({
  salon_id: salonIdSchema.optional(),
  is_active: z.boolean().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  has_parking: z.boolean().optional(),
  is_accessible: z.boolean().optional(),
  has_wifi: z.boolean().optional(),
  min_capacity: z.number().int().min(1).optional(),
  max_capacity: z.number().int().min(1).optional(),
  search_query: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 2, {
      message: 'Search query must be at least 2 characters'
    }),
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
    .enum(['name', 'created_at', 'updated_at', 'city'])
    .optional()
    .default('name'),
  sort_order: z
    .enum(['asc', 'desc'])
    .optional()
    .default('asc')
})

// Bulk operations schema
export const bulkSalonUpdateSchema = z.object({
  salon_ids: z
    .array(salonIdSchema)
    .min(1, 'At least one salon ID is required')
    .max(50, 'Cannot update more than 50 salons at once'),
  updates: z.object({
    is_active: z.boolean().optional(),
    business_type: z
      .enum(['individual', 'llc', 'corporation', 'partnership', 'other'])
      .optional()
  }).refine((data) => {
    return Object.keys(data).length > 0
  }, {
    message: 'At least one update field must be provided'
  })
})

// Partial schemas for updates
export const createSalonUpdateSchema = createSalonSchema.partial()
export const createLocationUpdateSchema = createLocationSchema.partial()
export const salonSettingsUpdateSchema = salonSettingsSchema.partial()

// Type exports
export type CreateSalonInput = z.infer<typeof createSalonSchema>
export type UpdateSalonInput = z.infer<typeof updateSalonSchema>
export type CreateLocationInput = z.infer<typeof createLocationSchema>
export type UpdateLocationInput = z.infer<typeof updateLocationSchema>
export type SalonSettingsInput = z.infer<typeof salonSettingsSchema>
export type SalonBrandingInput = z.infer<typeof salonBrandingSchema>
export type SalonStaffInput = z.infer<typeof salonStaffSchema>
export type SalonAnalyticsInput = z.infer<typeof salonAnalyticsSchema>
export type SalonFilterInput = z.infer<typeof salonFilterSchema>
export type LocationFilterInput = z.infer<typeof locationFilterSchema>
export type BulkSalonUpdateInput = z.infer<typeof bulkSalonUpdateSchema>
export type BusinessHoursInput = z.infer<typeof businessHoursSchema>
export type CoordinatesInput = z.infer<typeof coordinatesSchema>

// Update type exports
export type CreateSalonUpdateInput = z.infer<typeof createSalonUpdateSchema>
export type CreateLocationUpdateInput = z.infer<typeof createLocationUpdateSchema>
export type SalonSettingsUpdateInput = z.infer<typeof salonSettingsUpdateSchema>

// Export individual field schemas for reuse
export {
  DaysOfWeek,
  salonIdSchema,
  locationIdSchema,
  salonNameSchema,
  descriptionSchema,
  websiteUrlSchema,
  logoUrlSchema,
  businessHoursSchema,
  coordinatesSchema
}