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
export const SendNotificationSchema = z.object({
  user_id: z.string().uuid('Invalid user ID').optional(),
  type: z.string().min(1, 'Type is required'),
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  message: z.string().min(1, 'Message is required').max(500, 'Message too long'),
  action_url: z.string().url('Invalid URL').optional(),
  action_label: z.string().max(50, 'Label too long').optional(),
  entity_type: z.string().optional(),
  entity_id: z.string().uuid('Invalid entity ID').optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  category: z.string().optional(),
  channels: z.array(z.enum(['email', 'sms', 'push', 'in_app'])).optional(),
  data: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
  expires_at: z.string().datetime().optional()
})

export const NotificationFiltersSchema = z.object({
  user_id: z.string().uuid().optional(),
  type: z.string().optional(),
  category: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  is_read: z.boolean().optional(),
  is_archived: z.boolean().optional(),
  entity_type: z.string().optional(),
  entity_id: z.string().uuid().optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0)
})

export const NotificationPreferencesSchema = z.object({
  email_enabled: z.boolean().optional(),
  sms_enabled: z.boolean().optional(),
  push_enabled: z.boolean().optional(),
  quiet_hours_start: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)').optional(),
  quiet_hours_end: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)').optional(),
  categories: z.record(z.boolean()).optional()
})