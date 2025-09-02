/**
 * Marketing Campaign Validation Schemas for FigDream
 * Comprehensive validation for marketing campaigns, segments, and analytics
 */

import { z } from 'zod'

/**
 * Campaign types
 */
export const campaignTypes = [
  'email',
  'sms',
  'push',
  'in_app',
] as const

export const campaignStatuses = [
  'draft',
  'scheduled',
  'active',
  'paused',
  'completed',
  'cancelled',
] as const

export const segmentOperators = [
  'equals',
  'not_equals',
  'contains',
  'not_contains',
  'greater_than',
  'less_than',
  'between',
  'in',
  'not_in',
] as const

/**
 * Campaign creation schema
 */
export const createCampaignSchema = z.object({
  name: z.string()
    .min(1, 'Campaign name is required')
    .max(100, 'Campaign name must be less than 100 characters'),
  
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  
  type: z.enum(campaignTypes, {
    message: 'Invalid campaign type',
  }),
  
  status: z.enum(campaignStatuses).default('draft'),
  
  salon_id: z.string().uuid('Invalid salon ID'),
  
  location_ids: z.array(z.string().uuid()).optional(),
  
  subject: z.string()
    .min(1, 'Subject is required for email campaigns')
    .max(150, 'Subject must be less than 150 characters')
    .optional(),
  
  content: z.string()
    .min(1, 'Content is required')
    .max(10000, 'Content must be less than 10000 characters'),
  
  preview_text: z.string()
    .max(200, 'Preview text must be less than 200 characters')
    .optional(),
  
  from_name: z.string()
    .max(50, 'From name must be less than 50 characters')
    .optional(),
  
  from_email: z.string()
    .email('Invalid from email address')
    .optional(),
  
  reply_to: z.string()
    .email('Invalid reply-to email address')
    .optional(),
  
  scheduled_at: z.string()
    .datetime()
    .optional()
    .refine((date) => {
      if (!date) return true
      return new Date(date) > new Date()
    }, 'Scheduled date must be in the future'),
  
  segment_id: z.string().uuid().optional(),
  
  tags: z.array(z.string()).max(10, 'Maximum 10 tags allowed').optional(),
  
  metadata: z.record(z.string(), z.any()).optional(),
})

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>

/**
 * Campaign update schema
 */
export const updateCampaignSchema = createCampaignSchema.partial().extend({
  id: z.string().uuid('Invalid campaign ID'),
})

export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>

/**
 * Audience segment schema
 */
export const createSegmentSchema = z.object({
  name: z.string()
    .min(1, 'Segment name is required')
    .max(100, 'Segment name must be less than 100 characters'),
  
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  
  salon_id: z.string().uuid('Invalid salon ID'),
  
  conditions: z.array(z.object({
    field: z.string()
      .min(1, 'Field is required'),
    
    operator: z.enum(segmentOperators),
    
    value: z.union([
      z.string(),
      z.number(),
      z.boolean(),
      z.array(z.any()),
    ]),
    
    conjunction: z.enum(['and', 'or']).default('and'),
  })).min(1, 'At least one condition is required'),
  
  is_dynamic: z.boolean().default(true),
  
  tags: z.array(z.string()).optional(),
})

export type CreateSegmentInput = z.infer<typeof createSegmentSchema>

/**
 * Email template schema
 */
export const createEmailTemplateSchema = z.object({
  name: z.string()
    .min(1, 'Template name is required')
    .max(100, 'Template name must be less than 100 characters'),
  
  subject: z.string()
    .min(1, 'Subject is required')
    .max(150, 'Subject must be less than 150 characters'),
  
  html_content: z.string()
    .min(1, 'HTML content is required')
    .max(50000, 'HTML content must be less than 50000 characters'),
  
  text_content: z.string()
    .max(10000, 'Text content must be less than 10000 characters')
    .optional(),
  
  category: z.enum([
    'promotional',
    'transactional',
    'newsletter',
    'welcome',
    'reminder',
    'review_request',
    'loyalty',
    'birthday',
    'custom',
  ]),
  
  variables: z.array(z.object({
    key: z.string(),
    description: z.string().optional(),
    default_value: z.string().optional(),
    required: z.boolean().default(false),
  })).optional(),
  
  salon_id: z.string().uuid('Invalid salon ID'),
  
  is_active: z.boolean().default(true),
})

export type CreateEmailTemplateInput = z.infer<typeof createEmailTemplateSchema>

/**
 * SMS template schema
 */
export const createSmsTemplateSchema = z.object({
  name: z.string()
    .min(1, 'Template name is required')
    .max(100, 'Template name must be less than 100 characters'),
  
  content: z.string()
    .min(1, 'Content is required')
    .max(1600, 'SMS content must be less than 1600 characters'),
  
  category: z.enum([
    'promotional',
    'transactional',
    'reminder',
    'confirmation',
    'alert',
    'custom',
  ]),
  
  variables: z.array(z.object({
    key: z.string(),
    description: z.string().optional(),
    default_value: z.string().optional(),
  })).optional(),
  
  salon_id: z.string().uuid('Invalid salon ID'),
  
  is_active: z.boolean().default(true),
})

export type CreateSmsTemplateInput = z.infer<typeof createSmsTemplateSchema>

/**
 * Campaign metrics schema
 */
export const campaignMetricsSchema = z.object({
  campaign_id: z.string().uuid('Invalid campaign ID'),
  
  sent_count: z.number().int().min(0).default(0),
  delivered_count: z.number().int().min(0).default(0),
  opened_count: z.number().int().min(0).default(0),
  clicked_count: z.number().int().min(0).default(0),
  bounced_count: z.number().int().min(0).default(0),
  unsubscribed_count: z.number().int().min(0).default(0),
  complained_count: z.number().int().min(0).default(0),
  
  open_rate: z.number().min(0).max(100).optional(),
  click_rate: z.number().min(0).max(100).optional(),
  bounce_rate: z.number().min(0).max(100).optional(),
  
  revenue_generated: z.number().min(0).optional(),
  conversions: z.number().int().min(0).optional(),
  
  last_updated: z.string().datetime(),
})

export type CampaignMetrics = z.infer<typeof campaignMetricsSchema>

/**
 * A/B test schema
 */
export const createAbTestSchema = z.object({
  name: z.string()
    .min(1, 'Test name is required')
    .max(100, 'Test name must be less than 100 characters'),
  
  campaign_id: z.string().uuid('Invalid campaign ID'),
  
  variants: z.array(z.object({
    name: z.string()
      .min(1, 'Variant name is required')
      .max(50, 'Variant name must be less than 50 characters'),
    
    subject: z.string().optional(),
    content: z.string().optional(),
    from_name: z.string().optional(),
    
    percentage: z.number()
      .min(0, 'Percentage must be at least 0')
      .max(100, 'Percentage cannot exceed 100'),
  })).min(2, 'At least 2 variants are required for A/B testing'),
  
  test_size: z.number()
    .min(10, 'Test size must be at least 10%')
    .max(50, 'Test size cannot exceed 50%'),
  
  winning_metric: z.enum(['open_rate', 'click_rate', 'conversion_rate']),
  
  test_duration_hours: z.number()
    .min(1, 'Test duration must be at least 1 hour')
    .max(168, 'Test duration cannot exceed 7 days'),
})

export type CreateAbTestInput = z.infer<typeof createAbTestSchema>

/**
 * Automation workflow schema
 */
export const createAutomationSchema = z.object({
  name: z.string()
    .min(1, 'Automation name is required')
    .max(100, 'Automation name must be less than 100 characters'),
  
  trigger_type: z.enum([
    'booking_created',
    'booking_completed',
    'booking_cancelled',
    'customer_birthday',
    'customer_signup',
    'review_received',
    'loyalty_milestone',
    'custom_event',
    'time_based',
  ]),
  
  trigger_conditions: z.record(z.string(), z.any()).optional(),
  
  actions: z.array(z.object({
    type: z.enum(['send_email', 'send_sms', 'add_tag', 'remove_tag', 'wait', 'webhook']),
    
    delay_minutes: z.number().min(0).optional(),
    
    template_id: z.string().uuid().optional(),
    
    webhook_url: z.string().url().optional(),
    
    tag: z.string().optional(),
  })).min(1, 'At least one action is required'),
  
  salon_id: z.string().uuid('Invalid salon ID'),
  
  is_active: z.boolean().default(false),
})

export type CreateAutomationInput = z.infer<typeof createAutomationSchema>

/**
 * Subscriber preferences schema
 */
export const updateSubscriberPreferencesSchema = z.object({
  customer_id: z.string().uuid('Invalid customer ID'),
  
  email_enabled: z.boolean().optional(),
  sms_enabled: z.boolean().optional(),
  push_enabled: z.boolean().optional(),
  
  email_frequency: z.enum(['immediate', 'daily', 'weekly', 'monthly']).optional(),
  
  categories: z.object({
    promotional: z.boolean().optional(),
    transactional: z.boolean().optional(),
    reminders: z.boolean().optional(),
    newsletters: z.boolean().optional(),
    reviews: z.boolean().optional(),
    loyalty: z.boolean().optional(),
  }).optional(),
  
  quiet_hours: z.object({
    enabled: z.boolean(),
    start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    end_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  }).optional(),
  
  preferred_language: z.string().length(2).optional(),
})

export type UpdateSubscriberPreferencesInput = z.infer<typeof updateSubscriberPreferencesSchema>

/**
 * Campaign sending schema
 */
export const sendCampaignSchema = z.object({
  campaign_id: z.string().uuid('Invalid campaign ID'),
  
  test_mode: z.boolean().default(false),
  
  test_recipients: z.array(z.string().email())
    .max(10, 'Maximum 10 test recipients allowed')
    .optional(),
  
  exclude_unsubscribed: z.boolean().default(true),
  
  exclude_bounced: z.boolean().default(true),
  
  respect_quiet_hours: z.boolean().default(true),
  
  batch_size: z.number()
    .min(1, 'Batch size must be at least 1')
    .max(1000, 'Batch size cannot exceed 1000')
    .default(100),
  
  delay_between_batches: z.number()
    .min(0, 'Delay cannot be negative')
    .max(3600, 'Delay cannot exceed 1 hour')
    .default(0),
})

export type SendCampaignInput = z.infer<typeof sendCampaignSchema>

/**
 * Analytics query schema
 */
export const analyticsQuerySchema = z.object({
  salon_id: z.string().uuid('Invalid salon ID'),
  
  start_date: z.string().datetime(),
  
  end_date: z.string().datetime(),
  
  metrics: z.array(z.enum([
    'sent',
    'delivered',
    'opened',
    'clicked',
    'bounced',
    'unsubscribed',
    'revenue',
    'conversions',
  ])).min(1, 'At least one metric is required'),
  
  group_by: z.enum(['day', 'week', 'month', 'campaign', 'location']).optional(),
  
  campaign_ids: z.array(z.string().uuid()).optional(),
  
  location_ids: z.array(z.string().uuid()).optional(),
})

export type AnalyticsQueryInput = z.infer<typeof analyticsQuerySchema>