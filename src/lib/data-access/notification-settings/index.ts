'use server'

import { createClient } from '@/lib/database/supabase/server'
import { Database } from '@/types/database.types'
import { revalidatePath } from 'next/cache'

type NotificationSettings = Database['public']['Tables']['notification_settings']['Row']
type NotificationSettingsInsert = Database['public']['Tables']['notification_settings']['Insert']
type NotificationSettingsUpdate = Database['public']['Tables']['notification_settings']['Update']

// Get notification settings for a user
export async function getNotificationSettings(userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('notification_settings')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') { // Ignore not found errors
    console.error('Error fetching notification settings:', error)
    throw new Error('Failed to fetch notification settings')
  }

  // If no settings exist, return default settings
  if (!data) {
    return getDefaultNotificationSettings(userId)
  }

  return data
}

// Create or update notification settings
export async function upsertNotificationSettings(
  userId: string,
  settings: Partial<NotificationSettingsUpdate>
) {
  const supabase = await createClient()
  
  // Check if settings exist
  const existing = await getNotificationSettings(userId)
  
  if (existing && 'id' in existing) {
    // Update existing settings
    const { data, error } = await supabase
      .from('notification_settings')
      .update({
        ...settings,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating notification settings:', error)
      throw new Error('Failed to update notification settings')
    }

    revalidatePath('/notifications/settings')
    revalidatePath('/customer/profile')
    revalidatePath('/staff/profile')
    revalidatePath('/salon-admin/profile')
    
    return data
  } else {
    // Create new settings
    const { data, error } = await supabase
      .from('notification_settings')
      .insert({
        user_id: userId,
        ...settings,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating notification settings:', error)
      throw new Error('Failed to create notification settings')
    }

    revalidatePath('/notifications/settings')
    revalidatePath('/customer/profile')
    revalidatePath('/staff/profile')
    revalidatePath('/salon-admin/profile')
    
    return data
  }
}

// Update specific notification channel
export async function updateNotificationChannel(
  userId: string,
  channel: 'email' | 'sms' | 'push',
  enabled: boolean
) {
  const updates: Partial<NotificationSettingsUpdate> = {}
  
  switch (channel) {
    case 'email':
      updates.email_enabled = enabled
      break
    case 'sms':
      updates.sms_enabled = enabled
      break
    case 'push':
      updates.push_enabled = enabled
      break
  }

  return upsertNotificationSettings(userId, updates)
}

// Update specific notification type
export async function updateNotificationType(
  userId: string,
  type: string,
  settings: {
    email?: boolean
    sms?: boolean
    push?: boolean
  }
) {
  const updates: Partial<NotificationSettingsUpdate> = {}
  
  // Map notification types to database columns
  const typeMapping: Record<string, { email?: string; sms?: string; push?: string }> = {
    booking_confirmation: {
      email: 'booking_confirmation_email',
      sms: 'booking_confirmation_sms',
      push: 'booking_confirmation_push'
    },
    booking_reminder: {
      email: 'booking_reminder_email',
      sms: 'booking_reminder_sms',
      push: 'booking_reminder_push'
    },
    booking_cancellation: {
      email: 'booking_cancellation_email',
      sms: 'booking_cancellation_sms',
      push: 'booking_cancellation_push'
    },
    review_request: {
      email: 'review_request_email',
      sms: 'review_request_sms',
      push: 'review_request_push'
    },
    marketing: {
      email: 'marketing_email',
      sms: 'marketing_sms',
      push: 'marketing_push'
    },
    loyalty_updates: {
      email: 'loyalty_updates_email',
      sms: 'loyalty_updates_sms',
      push: 'loyalty_updates_push'
    },
    staff_updates: {
      email: 'staff_updates_email',
      sms: 'staff_updates_sms',
      push: 'staff_updates_push'
    },
    system_updates: {
      email: 'system_updates_email',
      sms: 'system_updates_sms',
      push: 'system_updates_push'
    }
  }

  const mapping = typeMapping[type]
  if (!mapping) {
    throw new Error(`Unknown notification type: ${type}`)
  }

  if (settings.email !== undefined && mapping.email) {
    updates[mapping.email as keyof NotificationSettingsUpdate] = settings.email as any
  }
  if (settings.sms !== undefined && mapping.sms) {
    updates[mapping.sms as keyof NotificationSettingsUpdate] = settings.sms as any
  }
  if (settings.push !== undefined && mapping.push) {
    updates[mapping.push as keyof NotificationSettingsUpdate] = settings.push as any
  }

  return upsertNotificationSettings(userId, updates)
}

// Enable/disable all notifications
export async function toggleAllNotifications(userId: string, enabled: boolean) {
  const updates: Partial<NotificationSettingsUpdate> = {
    email_enabled: enabled,
    sms_enabled: enabled,
    push_enabled: enabled,
    // Set all notification types
    booking_confirmation_email: enabled,
    booking_confirmation_sms: enabled,
    booking_confirmation_push: enabled,
    booking_reminder_email: enabled,
    booking_reminder_sms: enabled,
    booking_reminder_push: enabled,
    booking_cancellation_email: enabled,
    booking_cancellation_sms: enabled,
    booking_cancellation_push: enabled,
    review_request_email: enabled,
    review_request_sms: enabled,
    review_request_push: enabled,
    marketing_email: enabled,
    marketing_sms: enabled,
    marketing_push: enabled,
    loyalty_updates_email: enabled,
    loyalty_updates_sms: enabled,
    loyalty_updates_push: enabled,
    staff_updates_email: enabled,
    staff_updates_sms: enabled,
    staff_updates_push: enabled,
    system_updates_email: enabled,
    system_updates_sms: enabled,
    system_updates_push: enabled,
  }

  return upsertNotificationSettings(userId, updates)
}

// Get default notification settings
function getDefaultNotificationSettings(userId: string): NotificationSettings {
  return {
    id: '',
    user_id: userId,
    email_enabled: true,
    sms_enabled: false,
    push_enabled: false,
    // Essential notifications default to enabled
    booking_confirmation_email: true,
    booking_confirmation_sms: false,
    booking_confirmation_push: false,
    booking_reminder_email: true,
    booking_reminder_sms: false,
    booking_reminder_push: false,
    booking_cancellation_email: true,
    booking_cancellation_sms: false,
    booking_cancellation_push: false,
    // Optional notifications default to disabled
    review_request_email: false,
    review_request_sms: false,
    review_request_push: false,
    marketing_email: false,
    marketing_sms: false,
    marketing_push: false,
    loyalty_updates_email: false,
    loyalty_updates_sms: false,
    loyalty_updates_push: false,
    staff_updates_email: false,
    staff_updates_sms: false,
    staff_updates_push: false,
    system_updates_email: true,
    system_updates_sms: false,
    system_updates_push: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

// Notification preference templates
export const NOTIFICATION_CATEGORIES = [
  {
    id: 'bookings',
    label: 'Booking Notifications',
    description: 'Updates about your appointments',
    types: [
      {
        id: 'booking_confirmation',
        label: 'Booking Confirmations',
        description: 'When an appointment is booked',
      },
      {
        id: 'booking_reminder',
        label: 'Booking Reminders',
        description: 'Reminders before appointments',
      },
      {
        id: 'booking_cancellation',
        label: 'Cancellations',
        description: 'When appointments are cancelled',
      },
    ],
  },
  {
    id: 'engagement',
    label: 'Engagement',
    description: 'Reviews and loyalty programs',
    types: [
      {
        id: 'review_request',
        label: 'Review Requests',
        description: 'Requests to review services',
      },
      {
        id: 'loyalty_updates',
        label: 'Loyalty Updates',
        description: 'Points and rewards updates',
      },
    ],
  },
  {
    id: 'marketing',
    label: 'Marketing',
    description: 'Promotions and offers',
    types: [
      {
        id: 'marketing',
        label: 'Marketing Messages',
        description: 'Special offers and promotions',
      },
    ],
  },
  {
    id: 'updates',
    label: 'Updates',
    description: 'Staff and system updates',
    types: [
      {
        id: 'staff_updates',
        label: 'Staff Updates',
        description: 'Updates from your service providers',
      },
      {
        id: 'system_updates',
        label: 'System Updates',
        description: 'Important system notifications',
      },
    ],
  },
]