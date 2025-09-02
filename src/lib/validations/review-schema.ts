/**
 * Review System Validation Schemas for FigDream
 * Comprehensive validation for reviews, ratings, and moderation
 */

import { z } from 'zod'

/**
 * Review status types
 */
export const reviewStatuses = [
  'pending',
  'approved',
  'rejected',
  'flagged',
  'hidden',
] as const

export const reviewSources = [
  'website',
  'email',
  'sms',
  'google',
  'facebook',
  'instagram',
  'yelp',
  'import',
] as const

export const moderationReasons = [
  'inappropriate_content',
  'spam',
  'fake_review',
  'offensive_language',
  'personal_information',
  'competitor_mention',
  'off_topic',
  'duplicate',
  'other',
] as const

export const responseTypes = [
  'thank_you',
  'apology',
  'explanation',
  'follow_up',
  'custom',
] as const

/**
 * Create review schema
 */
export const createReviewSchema = z.object({
  booking_id: z.string().uuid('Invalid booking ID').optional(),
  
  salon_id: z.string().uuid('Invalid salon ID'),
  
  location_id: z.string().uuid('Invalid location ID').optional(),
  
  service_id: z.string().uuid('Invalid service ID').optional(),
  
  staff_id: z.string().uuid('Invalid staff ID').optional(),
  
  customer_id: z.string().uuid('Invalid customer ID'),
  
  rating: z.number()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5')
    .multipleOf(0.5, 'Rating must be in 0.5 increments'),
  
  title: z.string()
    .min(1, 'Review title is required')
    .max(100, 'Title must be less than 100 characters')
    .optional(),
  
  content: z.string()
    .min(10, 'Review must be at least 10 characters')
    .max(2000, 'Review must be less than 2000 characters'),
  
  service_rating: z.number()
    .min(1)
    .max(5)
    .multipleOf(0.5)
    .optional(),
  
  staff_rating: z.number()
    .min(1)
    .max(5)
    .multipleOf(0.5)
    .optional(),
  
  cleanliness_rating: z.number()
    .min(1)
    .max(5)
    .multipleOf(0.5)
    .optional(),
  
  value_rating: z.number()
    .min(1)
    .max(5)
    .multipleOf(0.5)
    .optional(),
  
  photos: z.array(z.object({
    url: z.string().url('Invalid photo URL'),
    caption: z.string().max(200).optional(),
    width: z.number().optional(),
    height: z.number().optional(),
  })).max(10, 'Maximum 10 photos allowed').optional(),
  
  tags: z.array(z.string()).max(10, 'Maximum 10 tags allowed').optional(),
  
  is_anonymous: z.boolean().default(false),
  
  source: z.enum(reviewSources).default('website'),
  
  verified_purchase: z.boolean().default(false),
  
  would_recommend: z.boolean().optional(),
  
  visited_date: z.string().datetime().optional(),
  
  metadata: z.record(z.string(), z.any()).optional(),
})

export type CreateReviewInput = z.infer<typeof createReviewSchema>

/**
 * Update review schema
 */
export const updateReviewSchema = createReviewSchema.partial().extend({
  id: z.string().uuid('Invalid review ID'),
  updated_reason: z.string().max(500).optional(),
})

export type UpdateReviewInput = z.infer<typeof updateReviewSchema>

/**
 * Moderate review schema
 */
export const moderateReviewSchema = z.object({
  review_id: z.string().uuid('Invalid review ID'),
  
  action: z.enum(['approve', 'reject', 'flag', 'hide']),
  
  reason: z.enum(moderationReasons).optional(),
  
  notes: z.string()
    .max(500, 'Notes must be less than 500 characters')
    .optional(),
  
  notify_customer: z.boolean().default(false),
  
  notification_message: z.string()
    .max(1000, 'Message must be less than 1000 characters')
    .optional(),
})

export type ModerateReviewInput = z.infer<typeof moderateReviewSchema>

/**
 * Review response schema
 */
export const createReviewResponseSchema = z.object({
  review_id: z.string().uuid('Invalid review ID'),
  
  response_type: z.enum(responseTypes),
  
  content: z.string()
    .min(10, 'Response must be at least 10 characters')
    .max(1000, 'Response must be less than 1000 characters'),
  
  is_public: z.boolean().default(true),
  
  respondent_name: z.string()
    .max(100, 'Name must be less than 100 characters')
    .optional(),
  
  respondent_title: z.string()
    .max(100, 'Title must be less than 100 characters')
    .optional(),
})

export type CreateReviewResponseInput = z.infer<typeof createReviewResponseSchema>

/**
 * Review request schema
 */
export const createReviewRequestSchema = z.object({
  booking_id: z.string().uuid('Invalid booking ID'),
  
  customer_id: z.string().uuid('Invalid customer ID'),
  
  salon_id: z.string().uuid('Invalid salon ID'),
  
  send_method: z.enum(['email', 'sms', 'both']),
  
  schedule_days_after: z.number()
    .min(0, 'Days must be non-negative')
    .max(30, 'Cannot schedule more than 30 days after')
    .default(1),
  
  template_id: z.string().uuid().optional(),
  
  custom_message: z.string()
    .max(500, 'Message must be less than 500 characters')
    .optional(),
  
  incentive_offered: z.boolean().default(false),
  
  incentive_details: z.string()
    .max(200, 'Incentive details must be less than 200 characters')
    .optional(),
  
  follow_up_enabled: z.boolean().default(true),
  
  follow_up_days: z.number()
    .min(1)
    .max(14)
    .default(7),
})

export type CreateReviewRequestInput = z.infer<typeof createReviewRequestSchema>

/**
 * Review filter schema
 */
export const reviewFilterSchema = z.object({
  salon_id: z.string().uuid().optional(),
  
  location_id: z.string().uuid().optional(),
  
  service_id: z.string().uuid().optional(),
  
  staff_id: z.string().uuid().optional(),
  
  customer_id: z.string().uuid().optional(),
  
  status: z.enum(reviewStatuses).optional(),
  
  min_rating: z.number().min(1).max(5).optional(),
  
  max_rating: z.number().min(1).max(5).optional(),
  
  has_photos: z.boolean().optional(),
  
  has_response: z.boolean().optional(),
  
  verified_only: z.boolean().optional(),
  
  date_from: z.string().datetime().optional(),
  
  date_to: z.string().datetime().optional(),
  
  search: z.string().max(100).optional(),
  
  sort_by: z.enum([
    'date_desc',
    'date_asc',
    'rating_desc',
    'rating_asc',
    'helpful_desc',
    'verified_first',
  ]).default('date_desc'),
  
  limit: z.number().min(1).max(100).default(20),
  
  offset: z.number().min(0).default(0),
})

export type ReviewFilterInput = z.infer<typeof reviewFilterSchema>

/**
 * Review analytics schema
 */
export const reviewAnalyticsSchema = z.object({
  salon_id: z.string().uuid('Invalid salon ID'),
  
  location_id: z.string().uuid().optional(),
  
  period: z.enum(['day', 'week', 'month', 'quarter', 'year', 'all']),
  
  start_date: z.string().datetime().optional(),
  
  end_date: z.string().datetime().optional(),
  
  metrics: z.array(z.enum([
    'total_reviews',
    'average_rating',
    'rating_distribution',
    'response_rate',
    'response_time',
    'sentiment_analysis',
    'keyword_frequency',
    'review_velocity',
    'nps_score',
  ])).min(1, 'At least one metric is required'),
  
  compare_to_previous: z.boolean().default(false),
  
  include_competitors: z.boolean().default(false),
})

export type ReviewAnalyticsInput = z.infer<typeof reviewAnalyticsSchema>

/**
 * Review import schema
 */
export const importReviewsSchema = z.object({
  salon_id: z.string().uuid('Invalid salon ID'),
  
  source: z.enum(['csv', 'json', 'google', 'facebook', 'yelp']),
  
  reviews: z.array(z.object({
    customer_name: z.string(),
    customer_email: z.string().email().optional(),
    rating: z.number().min(1).max(5),
    title: z.string().optional(),
    content: z.string(),
    date: z.string().datetime(),
    verified: z.boolean().default(false),
    response: z.string().optional(),
  })).min(1, 'At least one review is required'),
  
  auto_approve: z.boolean().default(false),
  
  skip_duplicates: z.boolean().default(true),
  
  notify_customers: z.boolean().default(false),
})

export type ImportReviewsInput = z.infer<typeof importReviewsSchema>

/**
 * Review widget configuration schema
 */
export const reviewWidgetConfigSchema = z.object({
  salon_id: z.string().uuid('Invalid salon ID'),
  
  widget_type: z.enum([
    'carousel',
    'grid',
    'list',
    'summary',
    'badge',
    'floating',
    'popup',
  ]),
  
  display_count: z.number()
    .min(1, 'Must display at least 1 review')
    .max(50, 'Cannot display more than 50 reviews')
    .default(10),
  
  min_rating: z.number().min(1).max(5).default(4),
  
  show_photos: z.boolean().default(true),
  
  show_responses: z.boolean().default(true),
  
  show_date: z.boolean().default(true),
  
  show_verified_badge: z.boolean().default(true),
  
  theme: z.enum(['light', 'dark', 'auto']).default('auto'),
  
  primary_color: z.string()
    .regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color')
    .default('#6366f1'),
  
  animation_enabled: z.boolean().default(true),
  
  auto_refresh: z.boolean().default(false),
  
  refresh_interval: z.number()
    .min(60, 'Refresh interval must be at least 60 seconds')
    .max(3600, 'Refresh interval cannot exceed 1 hour')
    .default(300),
  
  custom_css: z.string().max(5000).optional(),
  
  custom_js: z.string().max(2000).optional(),
})

export type ReviewWidgetConfigInput = z.infer<typeof reviewWidgetConfigSchema>

/**
 * Review report schema
 */
export const reportReviewSchema = z.object({
  review_id: z.string().uuid('Invalid review ID'),
  
  reason: z.enum([
    'fake',
    'inappropriate',
    'spam',
    'personal_info',
    'not_customer',
    'other',
  ]),
  
  details: z.string()
    .min(10, 'Please provide more details')
    .max(500, 'Details must be less than 500 characters'),
  
  reporter_email: z.string().email('Invalid email address'),
  
  reporter_name: z.string()
    .max(100, 'Name must be less than 100 characters')
    .optional(),
})

export type ReportReviewInput = z.infer<typeof reportReviewSchema>

/**
 * Review helpful vote schema
 */
export const voteReviewSchema = z.object({
  review_id: z.string().uuid('Invalid review ID'),
  
  vote_type: z.enum(['helpful', 'not_helpful']),
  
  user_id: z.string().uuid().optional(),
  
  session_id: z.string().optional(),
})

export type VoteReviewInput = z.infer<typeof voteReviewSchema>