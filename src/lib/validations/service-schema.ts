/**
 * Service validation schemas for FigDream
 * Comprehensive Zod schemas for service management, categories, and pricing
 */

import { z } from 'zod'

// Import reusable schemas
import { salonIdSchema, locationIdSchema } from './salon-schema'
import { userIdSchema } from './user-schema'
import { priceSchema, durationSchema } from './booking-schema'

// Common regex patterns
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const colorHexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
// const urlRegex = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/ // Reserved for future use

// Service difficulty levels
const ServiceDifficulty = z.enum(['beginner', 'intermediate', 'advanced', 'expert'], {
  errorMap: () => ({ message: 'Invalid service difficulty level' })
})

// Service status
const ServiceStatus = z.enum(['active', 'inactive', 'discontinued', 'seasonal'], {
  errorMap: () => ({ message: 'Invalid service status' })
})

// Base validation schemas
export const serviceIdSchema = z
  .string({ required_error: 'Service ID is required' })
  .regex(uuidRegex, 'Invalid service ID format')

export const categoryIdSchema = z
  .string({ required_error: 'Category ID is required' })
  .regex(uuidRegex, 'Invalid category ID format')

export const serviceNameSchema = z
  .string({ required_error: 'Service name is required' })
  .min(1, 'Service name is required')
  .max(100, 'Service name must be less than 100 characters')
  .regex(/^[a-zA-Z0-9\s\-\'&\.!(),]+$/, 'Service name contains invalid characters')
  .trim()

export const serviceDescriptionSchema = z
  .string()
  .nullable()
  .optional()
  .refine((val) => !val || (val.length >= 10 && val.length <= 500), {
    message: 'Service description must be between 10 and 500 characters'
  })
  .transform((val) => val?.trim() || null)

export const categoryNameSchema = z
  .string({ required_error: 'Category name is required' })
  .min(1, 'Category name is required')
  .max(50, 'Category name must be less than 50 characters')
  .regex(/^[a-zA-Z0-9\s\-\'&\.!(),]+$/, 'Category name contains invalid characters')
  .trim()

export const displayOrderSchema = z
  .number()
  .int()
  .min(0, 'Display order cannot be negative')
  .max(9999, 'Display order cannot exceed 9999')
  .optional()
  .default(0)

export const skillLevelSchema = z
  .number()
  .int()
  .min(1, 'Skill level must be at least 1')
  .max(5, 'Skill level cannot exceed 5')
  .optional()
  .nullable()

export const preparationTimeSchema = z
  .number()
  .int()
  .min(0, 'Preparation time cannot be negative')
  .max(120, 'Preparation time cannot exceed 2 hours')
  .optional()
  .default(0)

export const cleanupTimeSchema = z
  .number()
  .int()
  .min(0, 'Cleanup time cannot be negative')
  .max(60, 'Cleanup time cannot exceed 1 hour')
  .optional()
  .default(0)

// Service category schema
export const serviceCategorySchema = z.object({
  name: categoryNameSchema,
  description: z
    .string()
    .nullable()
    .optional()
    .refine((val) => !val || (val.length >= 5 && val.length <= 250), {
      message: 'Category description must be between 5 and 250 characters'
    })
    .transform((val) => val?.trim() || null),
  display_order: displayOrderSchema,
  color: z
    .string()
    .regex(colorHexRegex, 'Category color must be a valid hex color')
    .optional()
    .default('#007bff'),
  icon: z
    .string()
    .nullable()
    .optional()
    .refine((val) => !val || val.length <= 50, {
      message: 'Icon name must be less than 50 characters'
    })
    .transform((val) => val?.trim() || null),
  is_featured: z.boolean().optional().default(false),
  is_active: z.boolean().optional().default(true)
})

// Update service category schema
export const updateServiceCategorySchema = serviceCategorySchema.partial().extend({
  category_id: categoryIdSchema
})

// Base service schema
export const serviceSchema = z.object({
  name: serviceNameSchema,
  description: serviceDescriptionSchema,
  duration_minutes: durationSchema,
  price: priceSchema,
  category_id: categoryIdSchema.nullable().optional(),
  skill_level_required: skillLevelSchema,
  difficulty: ServiceDifficulty.optional().default('intermediate'),
  preparation_time: preparationTimeSchema,
  cleanup_time: cleanupTimeSchema,
  max_advance_booking_days: z
    .number()
    .int()
    .min(1, 'Max advance booking must be at least 1 day')
    .max(365, 'Max advance booking cannot exceed 365 days')
    .optional()
    .default(30),
  min_advance_booking_hours: z
    .number()
    .int()
    .min(1, 'Min advance booking must be at least 1 hour')
    .max(168, 'Min advance booking cannot exceed 7 days')
    .optional()
    .default(2),
  requires_consultation: z.boolean().optional().default(false),
  consultation_duration: z
    .number()
    .int()
    .min(5, 'Consultation duration must be at least 5 minutes')
    .max(60, 'Consultation duration cannot exceed 1 hour')
    .nullable()
    .optional(),
  age_restriction_min: z
    .number()
    .int()
    .min(0, 'Minimum age cannot be negative')
    .max(120, 'Minimum age cannot exceed 120')
    .nullable()
    .optional(),
  age_restriction_max: z
    .number()
    .int()
    .min(0, 'Maximum age cannot be negative')
    .max(120, 'Maximum age cannot exceed 120')
    .nullable()
    .optional(),
  gender_restriction: z
    .enum(['male', 'female', 'any'])
    .optional()
    .default('any'),
  requires_deposit: z.boolean().optional().default(false),
  deposit_amount: z
    .number()
    .min(0, 'Deposit amount cannot be negative')
    .nullable()
    .optional(),
  deposit_percentage: z
    .number()
    .min(0, 'Deposit percentage cannot be negative')
    .max(1, 'Deposit percentage cannot exceed 100%')
    .nullable()
    .optional(),
  cancellation_window_hours: z
    .number()
    .int()
    .min(1, 'Cancellation window must be at least 1 hour')
    .max(168, 'Cancellation window cannot exceed 7 days')
    .optional()
    .default(24),
  is_popular: z.boolean().optional().default(false),
  is_featured: z.boolean().optional().default(false),
  status: ServiceStatus.optional().default('active'),
  tags: z
    .array(z.string().min(1).max(20).trim())
    .optional()
    .refine((val) => !val || val.length <= 10, {
      message: 'Cannot have more than 10 tags'
    }),
  image_urls: z
    .array(z.string().url('Image URL must be valid'))
    .optional()
    .refine((val) => !val || val.length <= 5, {
      message: 'Cannot have more than 5 images'
    })
}).refine((data) => {
  // Age restrictions validation
  if (data.age_restriction_min && data.age_restriction_max) {
    return data.age_restriction_min <= data.age_restriction_max
  }
  return true
}, {
  message: 'Minimum age must be less than or equal to maximum age',
  path: ['age_restriction_max']
}).refine((data) => {
  // Deposit validation
  if (data.requires_deposit) {
    return data.deposit_amount !== null || data.deposit_percentage !== null
  }
  return true
}, {
  message: 'Deposit amount or percentage is required when deposit is enabled',
  path: ['deposit_amount']
}).refine((data) => {
  // Consultation duration validation
  if (data.requires_consultation) {
    return data.consultation_duration !== null
  }
  return true
}, {
  message: 'Consultation duration is required when consultation is enabled',
  path: ['consultation_duration']
})

// Update service schema
export const updateServiceSchema = serviceSchema.partial().extend({
  service_id: serviceIdSchema
})

// Salon service relationship schema
export const salonServiceSchema = z.object({
  salon_id: salonIdSchema,
  service_id: serviceIdSchema,
  custom_price: priceSchema.nullable().optional(),
  custom_duration: durationSchema.nullable().optional(),
  custom_name: z
    .string()
    .nullable()
    .optional()
    .refine((val) => !val || (val.length >= 1 && val.length <= 100), {
      message: 'Custom name must be between 1 and 100 characters'
    })
    .transform((val) => val?.trim() || null),
  custom_description: z
    .string()
    .nullable()
    .optional()
    .refine((val) => !val || (val.length >= 10 && val.length <= 500), {
      message: 'Custom description must be between 10 and 500 characters'
    })
    .transform((val) => val?.trim() || null),
  display_order: displayOrderSchema,
  is_active: z.boolean().optional().default(true),
  is_featured: z.boolean().optional().default(false),
  booking_restrictions: z.object({
    max_per_day: z
      .number()
      .int()
      .min(1, 'Maximum per day must be at least 1')
      .max(100, 'Maximum per day cannot exceed 100')
      .nullable()
      .optional(),
    max_per_customer_per_month: z
      .number()
      .int()
      .min(1, 'Maximum per customer per month must be at least 1')
      .max(50, 'Maximum per customer per month cannot exceed 50')
      .nullable()
      .optional(),
    requires_previous_service: serviceIdSchema.nullable().optional()
  }).optional()
})

// Staff service relationship schema
export const staffServiceSchema = z.object({
  staff_id: userIdSchema,
  service_id: serviceIdSchema,
  custom_price: priceSchema.nullable().optional(),
  custom_duration: durationSchema.nullable().optional(),
  proficiency_level: z
    .number()
    .int()
    .min(1, 'Proficiency level must be at least 1')
    .max(5, 'Proficiency level cannot exceed 5')
    .optional()
    .default(3),
  years_experience: z
    .number()
    .min(0, 'Years of experience cannot be negative')
    .max(50, 'Years of experience cannot exceed 50')
    .nullable()
    .optional(),
  certifications: z
    .array(z.string().min(1).max(100))
    .optional()
    .refine((val) => !val || val.length <= 10, {
      message: 'Cannot have more than 10 certifications'
    }),
  specializations: z
    .array(z.string().min(1).max(50))
    .optional()
    .refine((val) => !val || val.length <= 5, {
      message: 'Cannot have more than 5 specializations'
    }),
  is_preferred: z.boolean().optional().default(false),
  is_active: z.boolean().optional().default(true),
  commission_override: z
    .number()
    .min(0, 'Commission override cannot be negative')
    .max(1, 'Commission override cannot exceed 100%')
    .nullable()
    .optional()
})

// Service package schema
export const servicePackageSchema = z.object({
  name: z
    .string({ required_error: 'Package name is required' })
    .min(1, 'Package name is required')
    .max(100, 'Package name must be less than 100 characters')
    .trim(),
  description: z
    .string()
    .nullable()
    .optional()
    .refine((val) => !val || (val.length >= 10 && val.length <= 500), {
      message: 'Package description must be between 10 and 500 characters'
    })
    .transform((val) => val?.trim() || null),
  service_ids: z
    .array(serviceIdSchema)
    .min(2, 'Package must contain at least 2 services')
    .max(10, 'Package cannot contain more than 10 services'),
  package_price: priceSchema,
  package_duration: z
    .number()
    .int()
    .min(30, 'Package duration must be at least 30 minutes')
    .max(480, 'Package duration cannot exceed 8 hours'),
  discount_percentage: z
    .number()
    .min(0, 'Discount percentage cannot be negative')
    .max(0.5, 'Discount percentage cannot exceed 50%')
    .optional()
    .default(0.1),
  validity_days: z
    .number()
    .int()
    .min(30, 'Package validity must be at least 30 days')
    .max(365, 'Package validity cannot exceed 365 days')
    .optional()
    .default(90),
  max_bookings_per_package: z
    .number()
    .int()
    .min(1, 'Must allow at least 1 booking per package')
    .max(20, 'Cannot allow more than 20 bookings per package')
    .optional()
    .default(1),
  requires_consecutive_booking: z.boolean().optional().default(false),
  is_gift_eligible: z.boolean().optional().default(true),
  is_active: z.boolean().optional().default(true)
})

// Service addon schema
export const serviceAddonSchema = z.object({
  name: z
    .string({ required_error: 'Addon name is required' })
    .min(1, 'Addon name is required')
    .max(100, 'Addon name must be less than 100 characters')
    .trim(),
  description: serviceDescriptionSchema,
  price: priceSchema,
  duration_minutes: z
    .number()
    .int()
    .min(0, 'Addon duration cannot be negative')
    .max(120, 'Addon duration cannot exceed 2 hours')
    .optional()
    .default(0),
  applicable_services: z
    .array(serviceIdSchema)
    .min(1, 'Addon must be applicable to at least one service'),
  is_required: z.boolean().optional().default(false),
  max_quantity: z
    .number()
    .int()
    .min(1, 'Max quantity must be at least 1')
    .max(10, 'Max quantity cannot exceed 10')
    .optional()
    .default(1),
  is_active: z.boolean().optional().default(true)
})

// Service search/filter schema
export const serviceFilterSchema = z.object({
  salon_id: salonIdSchema.optional(),
  location_id: locationIdSchema.optional(),
  category_id: categoryIdSchema.optional(),
  staff_id: userIdSchema.optional(),
  status: ServiceStatus.optional(),
  difficulty: ServiceDifficulty.optional(),
  min_price: z.number().min(0).optional(),
  max_price: z.number().min(0).optional(),
  min_duration: z.number().int().min(1).optional(),
  max_duration: z.number().int().min(1).optional(),
  requires_consultation: z.boolean().optional(),
  is_popular: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  gender_restriction: z.enum(['male', 'female', 'any']).optional(),
  tags: z.array(z.string()).optional(),
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
    .enum(['name', 'price', 'duration', 'popularity', 'created_at'])
    .optional()
    .default('name'),
  sort_order: z
    .enum(['asc', 'desc'])
    .optional()
    .default('asc')
}).refine((data) => {
  if (data.min_price && data.max_price) {
    return data.min_price <= data.max_price
  }
  return true
}, {
  message: 'Minimum price must be less than or equal to maximum price',
  path: ['max_price']
}).refine((data) => {
  if (data.min_duration && data.max_duration) {
    return data.min_duration <= data.max_duration
  }
  return true
}, {
  message: 'Minimum duration must be less than or equal to maximum duration',
  path: ['max_duration']
})

// Bulk operations schema
export const bulkServiceUpdateSchema = z.object({
  service_ids: z
    .array(serviceIdSchema)
    .min(1, 'At least one service ID is required')
    .max(50, 'Cannot update more than 50 services at once'),
  updates: z.object({
    status: ServiceStatus.optional(),
    category_id: categoryIdSchema.nullable().optional(),
    is_featured: z.boolean().optional(),
    is_popular: z.boolean().optional()
  }).refine((data) => {
    return Object.keys(data).length > 0
  }, {
    message: 'At least one update field must be provided'
  })
})

// Service review schema
export const serviceReviewSchema = z.object({
  service_id: serviceIdSchema,
  customer_id: userIdSchema,
  booking_id: z.string().regex(uuidRegex, 'Invalid booking ID format'),
  rating: z
    .number()
    .int()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5'),
  review_text: z
    .string()
    .nullable()
    .optional()
    .refine((val) => !val || (val.length >= 10 && val.length <= 1000), {
      message: 'Review text must be between 10 and 1000 characters'
    })
    .transform((val) => val?.trim() || null),
  would_recommend: z.boolean().optional().default(true),
  service_quality: z
    .number()
    .int()
    .min(1, 'Service quality rating must be at least 1')
    .max(5, 'Service quality rating cannot exceed 5')
    .optional(),
  value_for_money: z
    .number()
    .int()
    .min(1, 'Value for money rating must be at least 1')
    .max(5, 'Value for money rating cannot exceed 5')
    .optional(),
  staff_friendliness: z
    .number()
    .int()
    .min(1, 'Staff friendliness rating must be at least 1')
    .max(5, 'Staff friendliness rating cannot exceed 5')
    .optional()
})

// Partial schemas for updates
export const serviceUpdateSchema = serviceSchema.partial()
export const serviceCategoryUpdateSchema = serviceCategorySchema.partial()

// Type exports
export type ServiceInput = z.infer<typeof serviceSchema>
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>
export type ServiceCategoryInput = z.infer<typeof serviceCategorySchema>
export type UpdateServiceCategoryInput = z.infer<typeof updateServiceCategorySchema>
export type SalonServiceInput = z.infer<typeof salonServiceSchema>
export type StaffServiceInput = z.infer<typeof staffServiceSchema>
export type ServicePackageInput = z.infer<typeof servicePackageSchema>
export type ServiceAddonInput = z.infer<typeof serviceAddonSchema>
export type ServiceFilterInput = z.infer<typeof serviceFilterSchema>
export type BulkServiceUpdateInput = z.infer<typeof bulkServiceUpdateSchema>
export type ServiceReviewInput = z.infer<typeof serviceReviewSchema>

// Update type exports
export type ServiceUpdateInput = z.infer<typeof serviceUpdateSchema>
export type ServiceCategoryUpdateInput = z.infer<typeof serviceCategoryUpdateSchema>

// Export individual field schemas for reuse
export {
  ServiceDifficulty,
  ServiceStatus,
  serviceIdSchema,
  categoryIdSchema,
  serviceNameSchema,
  serviceDescriptionSchema,
  categoryNameSchema,
  displayOrderSchema,
  skillLevelSchema,
  preparationTimeSchema,
  cleanupTimeSchema
}