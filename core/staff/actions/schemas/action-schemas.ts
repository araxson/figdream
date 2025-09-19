/**
 * Staff Action Validation Schemas
 * Centralized validation schemas for all staff-related Server Actions
 */

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

// Staff creation/update schemas
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

// Schedule schema
const DayScheduleSchema = z.object({
  enabled: z.boolean(),
  start_time: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)'),
  end_time: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)'),
  break_start: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  break_end: z.string().regex(/^\d{2}:\d{2}$/).optional()
})

export const StaffScheduleSchema = z.object({
  monday: DayScheduleSchema.optional(),
  tuesday: DayScheduleSchema.optional(),
  wednesday: DayScheduleSchema.optional(),
  thursday: DayScheduleSchema.optional(),
  friday: DayScheduleSchema.optional(),
  saturday: DayScheduleSchema.optional(),
  sunday: DayScheduleSchema.optional()
})

// Time off request schema
export const TimeOffRequestSchema = z.object({
  staff_id: z.string().uuid(),
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
  reason: z.string().min(1, 'Reason is required'),
  notes: z.string().optional(),
  request_type: z.enum(['vacation', 'sick', 'personal', 'other'])
})

// Service assignment schema
export const ServiceAssignmentSchema = z.object({
  service_ids: z.array(z.string().uuid()).min(1, 'Select at least one service'),
  duration_override: z.number().optional(),
  price_override: z.number().optional()
})

// Bulk operation schemas
export const BulkStaffIdsSchema = z.object({
  staffIds: z.array(z.string().uuid()).min(1, 'Select at least one staff member')
})

export const BulkRoleUpdateSchema = z.object({
  staffIds: z.array(z.string().uuid()).min(1, 'Select at least one staff member'),
  role: z.enum(['admin', 'staff', 'receptionist'])
})

// Filter schemas for queries
export const StaffFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['active', 'inactive', 'all']).optional(),
  role: z.string().optional(),
  service_id: z.string().uuid().optional(),
  is_bookable: z.boolean().optional()
}).optional()

// Pagination schema
export const PaginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20)
})