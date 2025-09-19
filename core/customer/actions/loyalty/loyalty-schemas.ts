import { z } from 'zod'

/**
 * Validation schemas for loyalty actions
 * Centralized schema definitions for type safety
 */

export const CreateLoyaltyProgramSchema = z.object({
  salon_id: z.string().uuid('Invalid salon ID'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  type: z.enum(['points', 'visits', 'tiered', 'hybrid']),
  points_per_dollar: z.number().min(0).optional(),
  points_per_visit: z.number().min(0).optional(),
  redemption_rate: z.number().min(0).max(1).optional(),
  tier_config: z.record(z.any()).optional(),
  benefits: z.array(z.string()).optional(),
  terms_conditions: z.string().optional(),
  is_active: z.boolean().default(true),
  starts_at: z.string().datetime().optional(),
  ends_at: z.string().datetime().optional()
})

export const UpdateLoyaltyProgramSchema = CreateLoyaltyProgramSchema.partial().omit({
  salon_id: true
})

export const EnrollCustomerSchema = z.object({
  program_id: z.string().uuid('Invalid program ID'),
  customer_id: z.string().uuid('Invalid customer ID'),
  initial_points: z.number().min(0).default(0)
})

export const AddPointsSchema = z.object({
  customer_loyalty_id: z.string().uuid('Invalid customer loyalty ID'),
  points: z.number().min(1, 'Points must be positive'),
  description: z.string().min(1, 'Description is required').max(200),
  appointment_id: z.string().uuid().optional(),
  reference_id: z.string().optional(),
  reference_type: z.string().optional(),
  expires_at: z.string().datetime().optional()
})

export const RedeemPointsSchema = z.object({
  customer_loyalty_id: z.string().uuid('Invalid customer loyalty ID'),
  points: z.number().min(1, 'Points must be positive'),
  description: z.string().min(1, 'Description is required').max(200),
  reward_id: z.string().optional(),
  appointment_id: z.string().uuid().optional()
})

export const CreateLoyaltyTierSchema = z.object({
  program_id: z.string().uuid('Invalid program ID'),
  name: z.string().min(1, 'Name is required').max(50),
  min_points: z.number().min(0, 'Minimum points must be non-negative'),
  max_points: z.number().min(0).nullable().optional(),
  benefits: z.array(z.string()),
  multiplier: z.number().min(1).default(1)
})

export const UpdateLoyaltyTierSchema = CreateLoyaltyTierSchema.partial().omit({
  program_id: true
})

export const AdjustPointsSchema = z.object({
  customer_loyalty_id: z.string().uuid('Invalid customer loyalty ID'),
  points: z.number().refine(val => val !== 0, 'Points adjustment cannot be zero'),
  description: z.string().min(1, 'Description is required').max(200)
})