/**
 * Advanced Features Validation Schemas for FigDream
 * Schemas for AI recommendations, loyalty programs, and gift cards
 */
import { z } from 'zod'
/**
 * AI Recommendation Schemas
 */
export const recommendationTypes = [
  'service',
  'staff',
  'time_slot',
  'product',
  'package',
  'similar_service',
  'complementary_service',
  'trending',
] as const
export const recommendationContexts = [
  'booking_flow',
  'homepage',
  'profile',
  'search_results',
  'checkout',
  'post_booking',
] as const
export const createRecommendationRequestSchema = z.object({
  customer_id: z.string().uuid('Invalid customer ID'),
  salon_id: z.string().uuid('Invalid salon ID').optional(),
  context: z.enum(recommendationContexts),
  recommendation_type: z.enum(recommendationTypes),
  limit: z.number()
    .min(1, 'Must request at least 1 recommendation')
    .max(50, 'Cannot request more than 50 recommendations')
    .default(10),
  filters: z.object({
    price_min: z.number().min(0).optional(),
    price_max: z.number().min(0).optional(),
    duration_min: z.number().min(0).optional(),
    duration_max: z.number().min(0).optional(),
    categories: z.array(z.string()).optional(),
    exclude_booked: z.boolean().default(true),
    available_only: z.boolean().default(true),
  }).optional(),
  preferences: z.object({
    preferred_staff: z.array(z.string().uuid()).optional(),
    preferred_times: z.array(z.string()).optional(),
    preferred_days: z.array(z.number().min(0).max(6)).optional(),
  }).optional(),
  session_data: z.object({
    current_service_id: z.string().uuid().optional(),
    cart_items: z.array(z.string().uuid()).optional(),
    viewed_services: z.array(z.string().uuid()).optional(),
    search_query: z.string().optional(),
  }).optional(),
})
export type CreateRecommendationRequestInput = z.infer<typeof createRecommendationRequestSchema>
export const trackRecommendationInteractionSchema = z.object({
  recommendation_id: z.string().uuid('Invalid recommendation ID'),
  interaction_type: z.enum([
    'view',
    'click',
    'add_to_cart',
    'book',
    'dismiss',
    'like',
    'dislike',
  ]),
  customer_id: z.string().uuid('Invalid customer ID'),
  session_id: z.string().optional(),
  context_data: z.record(z.string(), z.any()).optional(),
})
export type TrackRecommendationInteractionInput = z.infer<typeof trackRecommendationInteractionSchema>
/**
 * Loyalty Program Schemas
 */
export const loyaltyTiers = [
  'bronze',
  'silver',
  'gold',
  'platinum',
  'diamond',
] as const
export const pointsTransactionTypes = [
  'earned_booking',
  'earned_referral',
  'earned_review',
  'earned_social',
  'earned_bonus',
  'redeemed_discount',
  'redeemed_service',
  'redeemed_product',
  'expired',
  'adjusted',
] as const
export const createLoyaltyProgramSchema = z.object({
  salon_id: z.string().uuid('Invalid salon ID'),
  name: z.string()
    .min(1, 'Program name is required')
    .max(100, 'Name must be less than 100 characters'),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  is_active: z.boolean().default(true),
  points_config: z.object({
    points_per_dollar: z.number()
      .min(0.1, 'Points per dollar must be at least 0.1')
      .max(100, 'Points per dollar cannot exceed 100')
      .default(1),
    points_value: z.number()
      .min(0.001, 'Point value must be positive')
      .max(1, 'Point value cannot exceed $1')
      .default(0.01),
    minimum_redemption: z.number()
      .min(0, 'Minimum redemption must be non-negative')
      .default(100),
    maximum_redemption_percentage: z.number()
      .min(0)
      .max(100)
      .default(50),
    expiration_days: z.number()
      .min(0, 'Expiration days must be non-negative')
      .optional(),
  }),
  tier_config: z.array(z.object({
    tier: z.enum(loyaltyTiers),
    name: z.string()
      .max(50, 'Tier name must be less than 50 characters'),
    points_required: z.number()
      .min(0, 'Points required must be non-negative'),
    benefits: z.array(z.object({
      type: z.enum(['points_multiplier', 'discount', 'free_service', 'priority_booking', 'exclusive_access']),
      value: z.number().optional(),
      description: z.string(),
    })),
    badge_color: z.string()
      .regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color')
      .optional(),
  })).min(1, 'At least one tier is required'),
  earning_rules: z.array(z.object({
    action: z.enum(['booking', 'referral', 'review', 'birthday', 'signup', 'social_share']),
    points: z.number().min(0),
    conditions: z.record(z.string(), z.any()).optional(),
  })).optional(),
  redemption_rules: z.array(z.object({
    type: z.enum(['discount', 'free_service', 'product', 'upgrade']),
    points_required: z.number().min(1),
    value: z.number().optional(),
    description: z.string(),
    restrictions: z.record(z.string(), z.any()).optional(),
  })).optional(),
})
export type CreateLoyaltyProgramInput = z.infer<typeof createLoyaltyProgramSchema>
export const enrollCustomerSchema = z.object({
  customer_id: z.string().uuid('Invalid customer ID'),
  program_id: z.string().uuid('Invalid program ID'),
  referral_code: z.string().optional(),
  initial_points: z.number()
    .min(0, 'Initial points must be non-negative')
    .default(0),
  consent_marketing: z.boolean().default(false),
})
export type EnrollCustomerInput = z.infer<typeof enrollCustomerSchema>
export const addPointsSchema = z.object({
  customer_id: z.string().uuid('Invalid customer ID'),
  program_id: z.string().uuid('Invalid program ID'),
  points: z.number()
    .min(1, 'Points must be positive'),
  transaction_type: z.enum(pointsTransactionTypes),
  description: z.string()
    .max(200, 'Description must be less than 200 characters'),
  reference_id: z.string().uuid().optional(),
  expires_at: z.string().datetime().optional(),
})
export type AddPointsInput = z.infer<typeof addPointsSchema>
export const redeemPointsSchema = z.object({
  customer_id: z.string().uuid('Invalid customer ID'),
  program_id: z.string().uuid('Invalid program ID'),
  points: z.number()
    .min(1, 'Points must be positive'),
  redemption_type: z.enum(['discount', 'service', 'product', 'custom']),
  booking_id: z.string().uuid().optional(),
  value: z.number()
    .min(0, 'Value must be non-negative'),
  description: z.string()
    .max(200, 'Description must be less than 200 characters'),
})
export type RedeemPointsInput = z.infer<typeof redeemPointsSchema>
/**
 * Gift Card Schemas
 */
export const giftCardTypes = [
  'digital',
  'physical',
] as const
export const giftCardStatuses = [
  'active',
  'redeemed',
  'expired',
  'cancelled',
  'pending',
] as const
export const createGiftCardSchema = z.object({
  salon_id: z.string().uuid('Invalid salon ID'),
  type: z.enum(giftCardTypes),
  amount: z.number()
    .min(5, 'Gift card amount must be at least $5')
    .max(5000, 'Gift card amount cannot exceed $5000'),
  currency: z.string().length(3).default('USD'),
  purchaser_name: z.string()
    .min(1, 'Purchaser name is required')
    .max(100, 'Name must be less than 100 characters'),
  purchaser_email: z.string()
    .email('Invalid purchaser email'),
  purchaser_phone: z.string().optional(),
  recipient_name: z.string()
    .min(1, 'Recipient name is required')
    .max(100, 'Name must be less than 100 characters'),
  recipient_email: z.string()
    .email('Invalid recipient email')
    .optional(),
  recipient_phone: z.string().optional(),
  message: z.string()
    .max(500, 'Message must be less than 500 characters')
    .optional(),
  delivery_date: z.string()
    .datetime()
    .optional()
    .refine((date) => {
      if (!date) return true
      return new Date(date) >= new Date()
    }, 'Delivery date must be in the future'),
  expires_at: z.string()
    .datetime()
    .optional()
    .refine((date) => {
      if (!date) return true
      return new Date(date) > new Date()
    }, 'Expiration date must be in the future'),
  design_template: z.string().optional(),
  custom_image_url: z.string().url().optional(),
})
export type CreateGiftCardInput = z.infer<typeof createGiftCardSchema>
export const purchaseGiftCardSchema = createGiftCardSchema.extend({
  payment_method_id: z.string(),
  billing_address: z.object({
    line1: z.string(),
    line2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    postal_code: z.string(),
    country: z.string().default('US'),
  }).optional(),
})
export type PurchaseGiftCardInput = z.infer<typeof purchaseGiftCardSchema>
export const redeemGiftCardSchema = z.object({
  code: z.string()
    .min(1, 'Gift card code is required')
    .transform(val => val.toUpperCase()),
  booking_id: z.string().uuid('Invalid booking ID').optional(),
  amount: z.number()
    .min(0.01, 'Amount must be positive')
    .optional(),
  customer_id: z.string().uuid('Invalid customer ID'),
})
export type RedeemGiftCardInput = z.infer<typeof redeemGiftCardSchema>
export const checkGiftCardBalanceSchema = z.object({
  code: z.string()
    .min(1, 'Gift card code is required')
    .transform(val => val.toUpperCase()),
})
export type CheckGiftCardBalanceInput = z.infer<typeof checkGiftCardBalanceSchema>
/**
 * Referral Program Schemas
 */
export const createReferralSchema = z.object({
  referrer_id: z.string().uuid('Invalid referrer ID'),
  referred_email: z.string()
    .email('Invalid email address'),
  referred_name: z.string()
    .max(100, 'Name must be less than 100 characters')
    .optional(),
  message: z.string()
    .max(500, 'Message must be less than 500 characters')
    .optional(),
  incentive_type: z.enum(['percentage', 'fixed', 'points', 'service']),
  incentive_value: z.number()
    .min(0, 'Incentive value must be non-negative'),
  incentive_description: z.string()
    .max(200, 'Description must be less than 200 characters'),
  expires_at: z.string()
    .datetime()
    .optional(),
})
export type CreateReferralInput = z.infer<typeof createReferralSchema>
export const trackReferralSchema = z.object({
  referral_code: z.string()
    .min(1, 'Referral code is required'),
  action: z.enum(['clicked', 'signed_up', 'booked', 'completed']),
  customer_id: z.string().uuid().optional(),
  booking_id: z.string().uuid().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
})
export type TrackReferralInput = z.infer<typeof trackReferralSchema>
/**
 * Membership/Subscription Schemas
 */
export const createMembershipPlanSchema = z.object({
  salon_id: z.string().uuid('Invalid salon ID'),
  name: z.string()
    .min(1, 'Plan name is required')
    .max(100, 'Name must be less than 100 characters'),
  description: z.string()
    .max(500, 'Description must be less than 500 characters'),
  price: z.number()
    .min(0, 'Price must be non-negative'),
  billing_period: z.enum(['monthly', 'quarterly', 'yearly']),
  benefits: z.array(z.object({
    type: z.enum(['discount', 'free_service', 'priority_booking', 'exclusive_access', 'points_bonus']),
    value: z.number().optional(),
    description: z.string(),
    service_ids: z.array(z.string().uuid()).optional(),
  })).min(1, 'At least one benefit is required'),
  is_active: z.boolean().default(true),
  max_members: z.number()
    .min(0, 'Max members must be non-negative')
    .optional(),
  trial_days: z.number()
    .min(0, 'Trial days must be non-negative')
    .default(0),
})
export type CreateMembershipPlanInput = z.infer<typeof createMembershipPlanSchema>
export const subscribeMembershipSchema = z.object({
  customer_id: z.string().uuid('Invalid customer ID'),
  plan_id: z.string().uuid('Invalid plan ID'),
  payment_method_id: z.string(),
  start_date: z.string()
    .datetime()
    .optional(),
  promo_code: z.string().optional(),
})
export type SubscribeMembershipInput = z.infer<typeof subscribeMembershipSchema>