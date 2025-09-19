import { z } from 'zod'

// Shared Response Types
export interface ActionResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  fieldErrors?: Record<string, string[] | undefined>
  code?: string
  message?: string
}

// Shared Validation Schemas
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

export const ServiceAssignmentSchema = z.object({
  service_ids: z.array(z.string().uuid('Invalid service ID')),
  can_modify_price: z.boolean().default(false),
  custom_duration: z.number().optional()
})

export const BulkStaffSchema = z.object({
  staff_ids: z.array(z.string().uuid('Invalid staff ID')).min(1, 'At least one staff member is required')
})

export const StaffStatusSchema = z.object({
  status: z.enum(['available', 'busy', 'break', 'off_duty', 'vacation', 'sick_leave', 'training']),
  notes: z.string().optional()
})

// Type definitions
export type CreateStaffInput = z.infer<typeof CreateStaffSchema>
export type UpdateStaffInput = z.infer<typeof UpdateStaffSchema>
export type StaffScheduleInput = z.infer<typeof StaffScheduleSchema>
export type ServiceAssignmentInput = z.infer<typeof ServiceAssignmentSchema>
export type BulkStaffInput = z.infer<typeof BulkStaffSchema>
export type StaffStatusInput = z.infer<typeof StaffStatusSchema>