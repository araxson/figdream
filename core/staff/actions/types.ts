import { z } from 'zod'

// Response types
export interface ActionResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  fieldErrors?: Record<string, string[] | undefined>
  code?: string
  message?: string
}

// Staff validation schemas
export const CreateStaffSchema = z.object({
  email: z.string().email('Invalid email address'),
  display_name: z.string().min(2, 'Name must be at least 2 characters'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  bio: z.string().optional(),
  experience_years: z.number().min(0).max(50).optional(),
  specializations: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  commission_rate: z.number().min(0).max(100).optional(),
  hourly_rate: z.number().min(0).optional(),
  employment_type: z.enum(['full_time', 'part_time', 'contractor']).optional(),
  is_bookable: z.boolean().default(true),
  hired_at: z.string().optional()
})

export const UpdateStaffSchema = CreateStaffSchema.omit({ email: true }).partial()

// Schedule validation schema
export const StaffScheduleSchema = z.object({
  monday: z.object({
    enabled: z.boolean(),
    start_time: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)'),
    end_time: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)'),
    break_start: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    break_end: z.string().regex(/^\d{2}:\d{2}$/).optional()
  }).optional(),
  tuesday: z.object({
    enabled: z.boolean(),
    start_time: z.string().regex(/^\d{2}:\d{2}$/),
    end_time: z.string().regex(/^\d{2}:\d{2}$/),
    break_start: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    break_end: z.string().regex(/^\d{2}:\d{2}$/).optional()
  }).optional(),
  wednesday: z.object({
    enabled: z.boolean(),
    start_time: z.string().regex(/^\d{2}:\d{2}$/),
    end_time: z.string().regex(/^\d{2}:\d{2}$/),
    break_start: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    break_end: z.string().regex(/^\d{2}:\d{2}$/).optional()
  }).optional(),
  thursday: z.object({
    enabled: z.boolean(),
    start_time: z.string().regex(/^\d{2}:\d{2}$/),
    end_time: z.string().regex(/^\d{2}:\d{2}$/),
    break_start: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    break_end: z.string().regex(/^\d{2}:\d{2}$/).optional()
  }).optional(),
  friday: z.object({
    enabled: z.boolean(),
    start_time: z.string().regex(/^\d{2}:\d{2}$/),
    end_time: z.string().regex(/^\d{2}:\d{2}$/),
    break_start: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    break_end: z.string().regex(/^\d{2}:\d{2}$/).optional()
  }).optional(),
  saturday: z.object({
    enabled: z.boolean(),
    start_time: z.string().regex(/^\d{2}:\d{2}$/),
    end_time: z.string().regex(/^\d{2}:\d{2}$/),
    break_start: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    break_end: z.string().regex(/^\d{2}:\d{2}$/).optional()
  }).optional(),
  sunday: z.object({
    enabled: z.boolean(),
    start_time: z.string().regex(/^\d{2}:\d{2}$/),
    end_time: z.string().regex(/^\d{2}:\d{2}$/),
    break_start: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    break_end: z.string().regex(/^\d{2}:\d{2}$/).optional()
  }).optional()
})

// Service assignment schemas
export const ServiceAssignmentSchema = z.object({
  serviceIds: z.array(z.string().uuid()).min(1, 'At least one service is required'),
  staffProfileId: z.string().uuid('Invalid staff profile ID')
})

// Bulk operation schemas
export const BulkStaffIdsSchema = z.object({
  staffIds: z.array(z.string().uuid()).min(1, 'At least one staff member required')
})

export const BulkUpdateRoleSchema = BulkStaffIdsSchema.extend({
  role: z.enum(['owner', 'manager', 'staff', 'guest'])
})

// Type exports from validation schemas
export type CreateStaffInput = z.infer<typeof CreateStaffSchema>
export type UpdateStaffInput = z.infer<typeof UpdateStaffSchema>
export type StaffScheduleInput = z.infer<typeof StaffScheduleSchema>
export type ServiceAssignmentInput = z.infer<typeof ServiceAssignmentSchema>
export type BulkStaffIdsInput = z.infer<typeof BulkStaffIdsSchema>
export type BulkUpdateRoleInput = z.infer<typeof BulkUpdateRoleSchema>