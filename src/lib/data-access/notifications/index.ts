'use server'

import { createClient } from '@/lib/database/supabase/server'
import type { Database } from '@/types/database.types'
import { getUserWithRole } from '../auth/verify'

// ULTRA-TYPES: Comprehensive notification types
type Notification = Database['public']['Tables']['notifications']['Row']
type NotificationInsert = Database['public']['Tables']['notifications']['Insert']
type NotificationUpdate = Database['public']['Tables']['notifications']['Update']

type NotificationSettings = Database['public']['Tables']['notification_settings']['Row']
type NotificationSettingsInsert = Database['public']['Tables']['notification_settings']['Insert']
type NotificationSettingsUpdate = Database['public']['Tables']['notification_settings']['Update']

// ULTRA-INTERFACES: Extended notification types
export interface NotificationWithMetadata extends Notification {
  sender?: {
    id: string
    name?: string
    avatar?: string
  }
  action_url?: string
  action_label?: string
  category?: string
}

export interface NotificationPreferences {
  email: {
    appointments: boolean
    marketing: boolean
    reviews: boolean
    staff_updates: boolean
    system_alerts: boolean
  }
  sms: {
    appointments: boolean
    reminders: boolean
    confirmations: boolean
    marketing: boolean
  }
  push: {
    enabled: boolean
    appointments: boolean
    messages: boolean
    alerts: boolean
  }
  quiet_hours: {
    enabled: boolean
    start_time: string
    end_time: string
    timezone: string
  }
}

// ULTRA-RESULTS: Standardized result types
export interface NotificationResult {
  data: Notification | null
  error: string | null
}

export interface NotificationsResult {
  data: NotificationWithMetadata[] | null
  error: string | null
  unread_count?: number
}

export interface NotificationSettingsResult {
  data: NotificationSettings | null
  error: string | null
}

// ULTRA-CONSTANTS: Notification types and channels
export const NOTIFICATION_TYPES = {
  APPOINTMENT_CONFIRMED: 'appointment_confirmed',
  APPOINTMENT_REMINDER: 'appointment_reminder',
  APPOINTMENT_CANCELLED: 'appointment_cancelled',
  APPOINTMENT_RESCHEDULED: 'appointment_rescheduled',
  REVIEW_REQUEST: 'review_request',
  REVIEW_RECEIVED: 'review_received',
  STAFF_ASSIGNED: 'staff_assigned',
  STAFF_MESSAGE: 'staff_message',
  MARKETING_CAMPAIGN: 'marketing_campaign',
  LOYALTY_POINTS: 'loyalty_points',
  SYSTEM_ALERT: 'system_alert',
  PAYMENT_RECEIVED: 'payment_received',
  SUBSCRIPTION_UPDATE: 'subscription_update'
} as const

export const NOTIFICATION_CHANNELS = {
  IN_APP: 'in_app',
  EMAIL: 'email',
  SMS: 'sms',
  PUSH: 'push'
} as const

// ULTRA-FUNCTION: Get user notifications with metadata
export async function getUserNotifications(
  filters?: {
    unread_only?: boolean
    type?: string
    limit?: number
    offset?: number
  }
): Promise<NotificationsResult> {
  try {
    const { user, error: authError } = await getUserWithRole()
    
    if (authError || !user) {
      return { data: null, error: authError || 'Not authenticated' }
    }

    const supabase = await createClient()

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (filters?.unread_only) {
      query = query.eq('is_read', false)
    }
    
    if (filters?.type) {
      query = query.eq('type', filters.type)
    }

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
    }

    const { data: notifications, error } = await query

    if (error) {
      return { data: null, error: error.message }
    }

    // Get unread count
    const { count: unreadCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false)

    // Process notifications with metadata
    const processedNotifications = (notifications || []).map(notif => ({
      ...notif,
      category: getCategoryFromType(notif.type),
      action_url: getActionUrl(notif),
      action_label: getActionLabel(notif.type)
    }))

    return { 
      data: processedNotifications, 
      error: null,
      unread_count: unreadCount || 0
    }
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return { data: null, error: 'Failed to fetch notifications' }
  }
}

// ULTRA-FUNCTION: Get notification settings
export async function getNotificationSettings(): Promise<NotificationSettingsResult> {
  try {
    const { user, error: authError } = await getUserWithRole()
    
    if (authError || !user) {
      return { data: null, error: authError || 'Not authenticated' }
    }

    const supabase = await createClient()

    const { data: settings, error } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code === 'PGRST116') {
      // No settings found, create default
      const defaultSettings = await createDefaultSettings(user.id)
      return { data: defaultSettings, error: null }
    }

    if (error) {
      return { data: null, error: error.message }
    }

    return { data: settings, error: null }
  } catch (error) {
    console.error('Error fetching notification settings:', error)
    return { data: null, error: 'Failed to fetch notification settings' }
  }
}

// ULTRA-FUNCTION: Update notification settings
export async function updateNotificationSettings(
  updates: NotificationSettingsUpdate
): Promise<NotificationSettingsResult> {
  try {
    const { user, error: authError } = await getUserWithRole()
    
    if (authError || !user) {
      return { data: null, error: authError || 'Not authenticated' }
    }

    const supabase = await createClient()

    // Check if settings exist
    const { data: existing } = await supabase
      .from('notification_settings')
      .select('id')
      .eq('user_id', user.id)
      .single()

    let settings;

    if (existing) {
      // Update existing settings
      const { data, error } = await supabase
        .from('notification_settings')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        return { data: null, error: error.message }
      }
      settings = data
    } else {
      // Create new settings
      const { data, error } = await supabase
        .from('notification_settings')
        .insert({
          user_id: user.id,
          ...updates,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        return { data: null, error: error.message }
      }
      settings = data
    }

    return { data: settings, error: null }
  } catch (error) {
    console.error('Error updating notification settings:', error)
    return { data: null, error: 'Failed to update notification settings' }
  }
}

// ULTRA-FUNCTION: Mark notification as read
export async function markNotificationAsRead(
  notificationId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { user, error: authError } = await getUserWithRole()
    
    if (authError || !user) {
      return { success: false, error: authError || 'Not authenticated' }
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from('notifications')
      .update({ 
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('id', notificationId)
      .eq('user_id', user.id) // Ensure user owns the notification

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, error: null }
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return { success: false, error: 'Failed to mark notification as read' }
  }
}

// ULTRA-FUNCTION: Mark all notifications as read
export async function markAllNotificationsAsRead(): Promise<{ 
  success: boolean
  error: string | null
  updated_count?: number 
}> {
  try {
    const { user, error: authError } = await getUserWithRole()
    
    if (authError || !user) {
      return { success: false, error: authError || 'Not authenticated' }
    }

    const supabase = await createClient()

    const { error, count } = await supabase
      .from('notifications')
      .update({ 
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .eq('is_read', false)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, error: null, updated_count: count || 0 }
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    return { success: false, error: 'Failed to mark all notifications as read' }
  }
}

// ULTRA-FUNCTION: Delete notification
export async function deleteNotification(
  notificationId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { user, error: authError } = await getUserWithRole()
    
    if (authError || !user) {
      return { success: false, error: authError || 'Not authenticated' }
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', user.id) // Ensure user owns the notification

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, error: null }
  } catch (error) {
    console.error('Error deleting notification:', error)
    return { success: false, error: 'Failed to delete notification' }
  }
}

// ULTRA-FUNCTION: Create notification (internal use)
export async function createNotification(
  notificationData: NotificationInsert
): Promise<NotificationResult> {
  try {
    const supabase = await createClient()

    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        ...notificationData,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    // Check user preferences and send to appropriate channels
    const { data: settings } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', notificationData.user_id)
      .single()

    if (settings) {
      await sendToChannels(notification, settings)
    }

    return { data: notification, error: null }
  } catch (error) {
    console.error('Error creating notification:', error)
    return { data: null, error: 'Failed to create notification' }
  }
}

// ULTRA-HELPER: Create default notification settings
async function createDefaultSettings(userId: string): Promise<NotificationSettings | null> {
  try {
    const supabase = await createClient()

    const defaultSettings = {
      user_id: userId,
      email_notifications: true,
      email_appointments: true,
      email_marketing: false,
      email_reviews: true,
      email_staff_updates: true,
      email_system_alerts: true,
      sms_notifications: true,
      sms_appointments: true,
      sms_reminders: true,
      sms_confirmations: true,
      sms_marketing: false,
      push_notifications: true,
      push_appointments: true,
      push_messages: true,
      push_alerts: true,
      quiet_hours_enabled: false,
      quiet_hours_start: '22:00',
      quiet_hours_end: '08:00',
      timezone: 'America/New_York',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('notification_settings')
      .insert(defaultSettings)
      .select()
      .single()

    if (error) {
      console.error('Error creating default settings:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in createDefaultSettings:', error)
    return null
  }
}

// ULTRA-HELPER: Get category from notification type
function getCategoryFromType(type: string): string {
  if (type.includes('appointment')) return 'appointments'
  if (type.includes('review')) return 'reviews'
  if (type.includes('staff')) return 'staff'
  if (type.includes('marketing')) return 'marketing'
  if (type.includes('loyalty')) return 'loyalty'
  if (type.includes('payment') || type.includes('subscription')) return 'billing'
  return 'system'
}

// ULTRA-HELPER: Get action URL for notification
function getActionUrl(notification: Notification): string | undefined {
  const metadata = notification.metadata as any
  
  switch (notification.type) {
    case NOTIFICATION_TYPES.APPOINTMENT_CONFIRMED:
    case NOTIFICATION_TYPES.APPOINTMENT_REMINDER:
      return metadata?.appointment_id ? `/appointments/${metadata.appointment_id}` : undefined
    case NOTIFICATION_TYPES.REVIEW_REQUEST:
      return '/reviews/new'
    case NOTIFICATION_TYPES.REVIEW_RECEIVED:
      return metadata?.review_id ? `/reviews/${metadata.review_id}` : '/reviews'
    case NOTIFICATION_TYPES.LOYALTY_POINTS:
      return '/loyalty'
    case NOTIFICATION_TYPES.SUBSCRIPTION_UPDATE:
      return '/settings/subscription'
    default:
      return undefined
  }
}

// ULTRA-HELPER: Get action label for notification type
function getActionLabel(type: string): string {
  switch (type) {
    case NOTIFICATION_TYPES.APPOINTMENT_CONFIRMED:
    case NOTIFICATION_TYPES.APPOINTMENT_REMINDER:
      return 'View Appointment'
    case NOTIFICATION_TYPES.REVIEW_REQUEST:
      return 'Write Review'
    case NOTIFICATION_TYPES.REVIEW_RECEIVED:
      return 'View Review'
    case NOTIFICATION_TYPES.LOYALTY_POINTS:
      return 'View Points'
    case NOTIFICATION_TYPES.SUBSCRIPTION_UPDATE:
      return 'View Subscription'
    default:
      return 'View Details'
  }
}

// ULTRA-HELPER: Send notification to appropriate channels
async function sendToChannels(
  notification: Notification,
  settings: NotificationSettings
): Promise<void> {
  // This would integrate with email, SMS, and push notification services
  // For now, we just log the intent
  console.log('Sending notification to channels:', {
    notification_id: notification.id,
    type: notification.type,
    channels: {
      email: shouldSendEmail(notification.type, settings),
      sms: shouldSendSMS(notification.type, settings),
      push: shouldSendPush(notification.type, settings)
    }
  })
}

// ULTRA-HELPER: Check if email should be sent
function shouldSendEmail(type: string, settings: NotificationSettings): boolean {
  if (!settings.email_notifications) return false
  
  if (type.includes('appointment')) return settings.email_appointments
  if (type.includes('marketing')) return settings.email_marketing
  if (type.includes('review')) return settings.email_reviews
  if (type.includes('staff')) return settings.email_staff_updates
  if (type.includes('system')) return settings.email_system_alerts
  
  return true
}

// ULTRA-HELPER: Check if SMS should be sent
function shouldSendSMS(type: string, settings: NotificationSettings): boolean {
  if (!settings.sms_notifications) return false
  
  if (type === NOTIFICATION_TYPES.APPOINTMENT_CONFIRMED) return settings.sms_confirmations
  if (type === NOTIFICATION_TYPES.APPOINTMENT_REMINDER) return settings.sms_reminders
  if (type.includes('appointment')) return settings.sms_appointments
  if (type.includes('marketing')) return settings.sms_marketing
  
  return false
}

// ULTRA-HELPER: Check if push notification should be sent
function shouldSendPush(type: string, settings: NotificationSettings): boolean {
  if (!settings.push_notifications) return false
  
  if (type.includes('appointment')) return settings.push_appointments
  if (type.includes('message')) return settings.push_messages
  if (type.includes('alert')) return settings.push_alerts
  
  return true
}