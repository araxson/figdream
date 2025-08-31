/**
 * User profile validation schemas for FigDream
 * Comprehensive Zod schemas for user profile management, preferences, and settings
 */

import { z } from 'zod'

// Import reusable schemas from auth-schema
import { 
  emailSchema, 
  phoneSchema, 
  nameSchema, 
  Gender, 
  UserRole 
} from './auth-schema'

// Common regex patterns
const urlRegex = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const zipCodeRegex = /^\d{5}(-\d{4})?$/

// Timezone validation
const timezones = [
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'America/Phoenix', 'America/Anchorage', 'Pacific/Honolulu', 'America/Toronto',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Tokyo', 'Asia/Shanghai',
  'Australia/Sydney', 'Australia/Melbourne'
]

// Loyalty tier enum
const LoyaltyTier = z.enum(['bronze', 'silver', 'gold', 'platinum'], {
  errorMap: () => ({ message: 'Invalid loyalty tier' })
})

// Base validation schemas
export const userIdSchema = z
  .string({ required_error: 'User ID is required' })
  .regex(uuidRegex, 'Invalid user ID format')

export const avatarUrlSchema = z
  .string()
  .nullable()
  .optional()
  .refine((val) => !val || urlRegex.test(val), {
    message: 'Avatar URL must be a valid URL'
  })
  .refine((val) => !val || val.length <= 500, {
    message: 'Avatar URL must be less than 500 characters'
  })
  .transform((val) => val || null)

export const dateOfBirthSchema = z
  .string()
  .nullable()
  .optional()
  .refine((val) => {
    if (!val) return true
    const date = new Date(val)
    return !isNaN(date.getTime())
  }, {
    message: 'Invalid date format'
  })
  .refine((val) => {
    if (!val) return true
    const date = new Date(val)
    const today = new Date()
    const age = today.getFullYear() - date.getFullYear()
    return age >= 13 && age <= 120
  }, {
    message: 'Age must be between 13 and 120 years'
  })
  .transform((val) => val || null)

export const timezoneSchema = z
  .string()
  .optional()
  .refine((val) => !val || timezones.includes(val), {
    message: 'Invalid timezone'
  })
  .default('America/New_York')

export const addressSchema = z
  .string()
  .nullable()
  .optional()
  .refine((val) => !val || (val.length >= 5 && val.length <= 200), {
    message: 'Address must be between 5 and 200 characters'
  })
  .transform((val) => val?.trim() || null)

export const citySchema = z
  .string()
  .nullable()
  .optional()
  .refine((val) => !val || (val.length >= 2 && val.length <= 50), {
    message: 'City must be between 2 and 50 characters'
  })
  .refine((val) => !val || /^[a-zA-Z\s\-\'\.]+$/.test(val), {
    message: 'City can only contain letters, spaces, hyphens, apostrophes, and periods'
  })
  .transform((val) => val?.trim() || null)

export const stateSchema = z
  .string()
  .nullable()
  .optional()
  .refine((val) => !val || (val.length >= 2 && val.length <= 50), {
    message: 'State must be between 2 and 50 characters'
  })
  .transform((val) => val?.trim() || null)

export const zipCodeSchema = z
  .string()
  .nullable()
  .optional()
  .refine((val) => !val || zipCodeRegex.test(val), {
    message: 'ZIP code must be in format 12345 or 12345-6789'
  })
  .transform((val) => val || null)

export const countrySchema = z
  .string()
  .nullable()
  .optional()
  .min(2, 'Country must be at least 2 characters')
  .max(50, 'Country must be less than 50 characters')
  .transform((val) => val?.trim() || null)

// User profile schema
export const userProfileSchema = z.object({
  first_name: nameSchema,
  last_name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  avatar_url: avatarUrlSchema,
  date_of_birth: dateOfBirthSchema,
  gender: Gender.optional().nullable(),
  timezone: timezoneSchema
})

// Update user profile schema
export const updateUserProfileSchema = userProfileSchema.partial().extend({
  user_id: userIdSchema
})

// User address schema
export const userAddressSchema = z.object({
  user_id: userIdSchema,
  address: addressSchema,
  city: citySchema,
  state: stateSchema,
  zip_code: zipCodeSchema,
  country: countrySchema.default('United States'),
  is_primary: z.boolean().optional().default(true)
})

// User preferences schema
export const userPreferencesSchema = z.object({
  user_id: userIdSchema,
  language: z
    .string()
    .optional()
    .refine((val) => !val || ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'zh'].includes(val), {
      message: 'Unsupported language'
    })
    .default('en'),
  timezone: timezoneSchema,
  date_format: z
    .enum(['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'])
    .optional()
    .default('MM/DD/YYYY'),
  time_format: z
    .enum(['12h', '24h'])
    .optional()
    .default('12h'),
  currency: z
    .string()
    .optional()
    .length(3, 'Currency code must be 3 characters')
    .regex(/^[A-Z]{3}$/, 'Currency code must be uppercase letters')
    .default('USD'),
  theme: z
    .enum(['light', 'dark', 'system'])
    .optional()
    .default('system')
})

// Notification preferences schema
export const notificationPreferencesSchema = z.object({
  user_id: userIdSchema,
  email_enabled: z.boolean().optional().default(true),
  sms_enabled: z.boolean().optional().default(false),
  push_enabled: z.boolean().optional().default(true),
  booking_reminders: z.boolean().optional().default(true),
  booking_confirmations: z.boolean().optional().default(true),
  booking_cancellations: z.boolean().optional().default(true),
  payment_confirmations: z.boolean().optional().default(true),
  marketing_messages: z.boolean().optional().default(false),
  promotional_offers: z.boolean().optional().default(false),
  loyalty_updates: z.boolean().optional().default(true),
  review_requests: z.boolean().optional().default(true),
  system_updates: z.boolean().optional().default(true),
  reminder_hours_before: z
    .number()
    .int()
    .min(1, 'Reminder must be at least 1 hour before')
    .max(168, 'Reminder cannot be more than 7 days before')
    .optional()
    .default(24)
})

// Privacy settings schema
export const privacySettingsSchema = z.object({
  user_id: userIdSchema,
  profile_visibility: z
    .enum(['public', 'friends', 'private'])
    .optional()
    .default('private'),
  show_real_name: z.boolean().optional().default(true),
  show_avatar: z.boolean().optional().default(true),
  show_reviews: z.boolean().optional().default(true),
  show_loyalty_status: z.boolean().optional().default(false),
  allow_friend_requests: z.boolean().optional().default(true),
  data_processing_consent: z.boolean().optional().default(false),
  marketing_consent: z.boolean().optional().default(false),
  third_party_sharing: z.boolean().optional().default(false)
})

// Account security schema
export const accountSecuritySchema = z.object({
  user_id: userIdSchema,
  two_factor_enabled: z.boolean().optional().default(false),
  login_notifications: z.boolean().optional().default(true),
  session_timeout_hours: z
    .number()
    .int()
    .min(1, 'Session timeout must be at least 1 hour')
    .max(168, 'Session timeout cannot exceed 7 days')
    .optional()
    .default(24),
  allowed_devices: z
    .number()
    .int()
    .min(1, 'Must allow at least 1 device')
    .max(10, 'Cannot allow more than 10 devices')
    .optional()
    .default(3),
  password_change_required: z.boolean().optional().default(false),
  account_locked: z.boolean().optional().default(false),
  failed_login_attempts: z
    .number()
    .int()
    .min(0)
    .max(10)
    .optional()
    .default(0)
})

// Emergency contact schema
export const emergencyContactSchema = z.object({
  user_id: userIdSchema,
  contact_name: nameSchema,
  contact_phone: phoneSchema.refine((val) => val !== null && val !== undefined, {
    message: 'Emergency contact phone is required'
  }),
  relationship: z
    .string({ required_error: 'Relationship is required' })
    .min(1, 'Relationship is required')
    .max(50, 'Relationship must be less than 50 characters')
    .transform((val) => val.trim()),
  is_primary: z.boolean().optional().default(true)
})

// User loyalty schema
export const userLoyaltySchema = z.object({
  customer_id: userIdSchema,
  points: z
    .number()
    .int()
    .min(0, 'Loyalty points cannot be negative')
    .max(999999, 'Loyalty points cannot exceed 999,999'),
  lifetime_points: z
    .number()
    .int()
    .min(0, 'Lifetime points cannot be negative'),
  tier: LoyaltyTier,
  tier_progress: z
    .number()
    .min(0, 'Tier progress cannot be negative')
    .max(1, 'Tier progress cannot exceed 100%')
    .optional()
    .default(0),
  next_tier_points_needed: z
    .number()
    .int()
    .min(0)
    .optional()
    .nullable()
})

// Staff profile schema (extends user profile)
export const staffProfileSchema = userProfileSchema.extend({
  employee_id: z
    .string()
    .nullable()
    .optional()
    .refine((val) => !val || val.length <= 20, {
      message: 'Employee ID must be less than 20 characters'
    })
    .transform((val) => val?.trim() || null),
  bio: z
    .string()
    .nullable()
    .optional()
    .refine((val) => !val || val.length <= 500, {
      message: 'Bio must be less than 500 characters'
    })
    .transform((val) => val?.trim() || null),
  specialties: z
    .array(z.string().min(1).max(50))
    .optional()
    .refine((val) => !val || val.length <= 10, {
      message: 'Cannot have more than 10 specialties'
    }),
  certifications: z
    .array(z.string().min(1).max(100))
    .optional()
    .refine((val) => !val || val.length <= 20, {
      message: 'Cannot have more than 20 certifications'
    }),
  years_experience: z
    .number()
    .int()
    .min(0, 'Years of experience cannot be negative')
    .max(50, 'Years of experience cannot exceed 50')
    .optional()
    .nullable(),
  hourly_rate: z
    .number()
    .min(0, 'Hourly rate cannot be negative')
    .max(500, 'Hourly rate cannot exceed $500')
    .optional()
    .nullable(),
  commission_rate: z
    .number()
    .min(0, 'Commission rate cannot be negative')
    .max(1, 'Commission rate cannot exceed 100%')
    .optional()
    .nullable()
})

// Bulk user operations schema
export const bulkUserUpdateSchema = z.object({
  user_ids: z
    .array(userIdSchema)
    .min(1, 'At least one user ID is required')
    .max(100, 'Cannot update more than 100 users at once'),
  updates: z.object({
    is_active: z.boolean().optional(),
    role: UserRole.optional(),
    email_verified: z.boolean().optional(),
    account_locked: z.boolean().optional()
  }).refine((data) => {
    return Object.keys(data).length > 0
  }, {
    message: 'At least one update field must be provided'
  })
})

// User search/filter schema
export const userFilterSchema = z.object({
  role: UserRole.optional(),
  is_active: z.boolean().optional(),
  email_verified: z.boolean().optional(),
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
    .enum(['first_name', 'last_name', 'email', 'created_at', 'last_login'])
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

// Partial schemas for updates
export const userProfileUpdateSchema = userProfileSchema.partial()
export const staffProfileUpdateSchema = staffProfileSchema.partial()
export const userPreferencesUpdateSchema = userPreferencesSchema.partial()
export const notificationPreferencesUpdateSchema = notificationPreferencesSchema.partial()

// Type exports
export type UserProfileInput = z.infer<typeof userProfileSchema>
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>
export type UserAddressInput = z.infer<typeof userAddressSchema>
export type UserPreferencesInput = z.infer<typeof userPreferencesSchema>
export type NotificationPreferencesInput = z.infer<typeof notificationPreferencesSchema>
export type PrivacySettingsInput = z.infer<typeof privacySettingsSchema>
export type AccountSecurityInput = z.infer<typeof accountSecuritySchema>
export type EmergencyContactInput = z.infer<typeof emergencyContactSchema>
export type UserLoyaltyInput = z.infer<typeof userLoyaltySchema>
export type StaffProfileInput = z.infer<typeof staffProfileSchema>
export type BulkUserUpdateInput = z.infer<typeof bulkUserUpdateSchema>
export type UserFilterInput = z.infer<typeof userFilterSchema>

// Update type exports
export type UserProfileUpdateInput = z.infer<typeof userProfileUpdateSchema>
export type StaffProfileUpdateInput = z.infer<typeof staffProfileUpdateSchema>
export type UserPreferencesUpdateInput = z.infer<typeof userPreferencesUpdateSchema>
export type NotificationPreferencesUpdateInput = z.infer<typeof notificationPreferencesUpdateSchema>

// Export individual field schemas for reuse
export {
  LoyaltyTier,
  userIdSchema,
  avatarUrlSchema,
  dateOfBirthSchema,
  timezoneSchema,
  addressSchema,
  citySchema,
  stateSchema,
  zipCodeSchema,
  countrySchema
}