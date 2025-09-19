'use server'

import { z } from 'zod'

// Response types
export interface ActionResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  fieldErrors?: Record<string, string[] | undefined>
  code?: string
  message?: string
}

// Validation schemas
export const CreateReviewSchema = z.object({
  salon_id: z.string().uuid('Invalid salon ID'),
  appointment_id: z.string().uuid('Invalid appointment ID'),
  staff_id: z.string().uuid('Invalid staff ID').optional(),
  overall_rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  service_rating: z.number().min(1).max(5).optional(),
  staff_rating: z.number().min(1).max(5).optional(),
  ambiance_rating: z.number().min(1).max(5).optional(),
  cleanliness_rating: z.number().min(1).max(5).optional(),
  value_rating: z.number().min(1).max(5).optional(),
  title: z.string().min(1, 'Title is required').max(100, 'Title too long').optional(),
  content: z.string().min(10, 'Review must be at least 10 characters').max(1000, 'Review too long').optional(),
  photos: z.array(z.string().url('Invalid photo URL')).max(5, 'Maximum 5 photos allowed').optional(),
  is_anonymous: z.boolean().optional()
})

export const UpdateReviewSchema = CreateReviewSchema.partial().omit({
  salon_id: true,
  appointment_id: true,
  customer_id: true
})

export const ReviewResponseSchema = z.object({
  review_id: z.string().uuid('Invalid review ID'),
  content: z.string().min(10, 'Response must be at least 10 characters').max(500, 'Response too long')
})

export const ReviewFiltersSchema = z.object({
  salon_id: z.string().uuid().optional(),
  staff_id: z.string().uuid().optional(),
  customer_id: z.string().uuid().optional(),
  min_rating: z.number().min(1).max(5).optional(),
  has_response: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  is_verified: z.boolean().optional(),
  status: z.enum(['pending', 'approved', 'rejected', 'flagged']).optional(),
  search: z.string().max(100).optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional()
})