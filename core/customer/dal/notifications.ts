import { createServerClient } from '@/lib/supabase/server'
import type { Notification, NotificationPreferences } from '../types'

export async function getCustomerNotifications(
  userId: string,
  unreadOnly = false
): Promise<Notification[]> {
  const supabase = createServerClient()

  // Verify authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== userId) {
    throw new Error('Unauthorized')
  }

  let query = supabase
    .from('notifications')
    .select(`
      id,
      user_id,
      type,
      title,
      message,
      data,
      is_read,
      action_url,
      action_text,
      image_url,
      priority,
      scheduled_for,
      expires_at,
      created_at,
      read_at
    `)
    .eq('user_id', userId)

  if (unreadOnly) {
    query = query.eq('is_read', false)
  }

  // Filter out expired notifications
  query = query.or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())

  const { data, error } = await query
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    throw new Error(`Failed to fetch notifications: ${error.message}`)
  }

  return data?.map(notification => ({
    id: notification.id,
    userId: notification.user_id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    data: notification.data,
    isRead: notification.is_read,
    actionUrl: notification.action_url,
    actionText: notification.action_text,
    imageUrl: notification.image_url,
    priority: notification.priority || 'medium',
    scheduledFor: notification.scheduled_for ? new Date(notification.scheduled_for) : undefined,
    expiresAt: notification.expires_at ? new Date(notification.expires_at) : undefined,
    createdAt: new Date(notification.created_at),
    readAt: notification.read_at ? new Date(notification.read_at) : undefined
  })) || []
}

export async function markNotificationAsRead(
  userId: string,
  notificationId: string
): Promise<void> {
  const supabase = createServerClient()

  // Verify authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== userId) {
    throw new Error('Unauthorized')
  }

  const { error } = await supabase
    .from('notifications')
    .update({
      is_read: true,
      read_at: new Date().toISOString()
    })
    .eq('id', notificationId)
    .eq('user_id', userId)

  if (error) {
    throw new Error(`Failed to mark notification as read: ${error.message}`)
  }
}

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  const supabase = createServerClient()

  // Verify authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== userId) {
    throw new Error('Unauthorized')
  }

  const { error } = await supabase
    .from('notifications')
    .update({
      is_read: true,
      read_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .eq('is_read', false)

  if (error) {
    throw new Error(`Failed to mark all notifications as read: ${error.message}`)
  }
}

export async function deleteNotification(
  userId: string,
  notificationId: string
): Promise<void> {
  const supabase = createServerClient()

  // Verify authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== userId) {
    throw new Error('Unauthorized')
  }

  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId)
    .eq('user_id', userId)

  if (error) {
    throw new Error(`Failed to delete notification: ${error.message}`)
  }
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const supabase = createServerClient()

  // Verify authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== userId) {
    throw new Error('Unauthorized')
  }

  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false)
    .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())

  if (error) {
    throw new Error(`Failed to get unread count: ${error.message}`)
  }

  return count || 0
}

export async function getNotificationPreferences(userId: string): Promise<NotificationPreferences> {
  const supabase = createServerClient()

  // Verify authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== userId) {
    throw new Error('Unauthorized')
  }

  const { data, error } = await supabase
    .from('notification_settings')
    .select(`
      email_booking_reminders,
      email_booking_confirmations,
      email_cancellations,
      email_promotions,
      email_review_requests,
      email_loyalty_updates,
      email_newsletters,
      sms_booking_reminders,
      sms_booking_confirmations,
      sms_cancellations,
      sms_promotions,
      sms_urgent_updates,
      push_booking_reminders,
      push_booking_confirmations,
      push_cancellations,
      push_promotions,
      push_review_requests,
      push_loyalty_updates,
      push_general,
      quiet_hours_enabled,
      quiet_hours_start,
      quiet_hours_end,
      quiet_hours_timezone
    `)
    .eq('user_id', userId)
    .single()

  if (error) {
    // Return default preferences if none exist
    return getDefaultNotificationPreferences()
  }

  return {
    email: {
      bookingReminders: data.email_booking_reminders ?? true,
      bookingConfirmations: data.email_booking_confirmations ?? true,
      cancellations: data.email_cancellations ?? true,
      promotions: data.email_promotions ?? false,
      reviewRequests: data.email_review_requests ?? true,
      loyaltyUpdates: data.email_loyalty_updates ?? true,
      newsletters: data.email_newsletters ?? false
    },
    sms: {
      bookingReminders: data.sms_booking_reminders ?? true,
      bookingConfirmations: data.sms_booking_confirmations ?? true,
      cancellations: data.sms_cancellations ?? true,
      promotions: data.sms_promotions ?? false,
      urgentUpdates: data.sms_urgent_updates ?? true
    },
    push: {
      bookingReminders: data.push_booking_reminders ?? true,
      bookingConfirmations: data.push_booking_confirmations ?? true,
      cancellations: data.push_cancellations ?? true,
      promotions: data.push_promotions ?? false,
      reviewRequests: data.push_review_requests ?? true,
      loyaltyUpdates: data.push_loyalty_updates ?? true,
      general: data.push_general ?? true
    },
    quietHours: {
      enabled: data.quiet_hours_enabled ?? false,
      startTime: data.quiet_hours_start ?? '22:00',
      endTime: data.quiet_hours_end ?? '08:00',
      timezone: data.quiet_hours_timezone ?? 'America/New_York'
    }
  }
}

export async function updateNotificationPreferences(
  userId: string,
  preferences: NotificationPreferences
): Promise<NotificationPreferences> {
  const supabase = createServerClient()

  // Verify authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== userId) {
    throw new Error('Unauthorized')
  }

  const updateData = {
    user_id: userId,
    email_booking_reminders: preferences.email.bookingReminders,
    email_booking_confirmations: preferences.email.bookingConfirmations,
    email_cancellations: preferences.email.cancellations,
    email_promotions: preferences.email.promotions,
    email_review_requests: preferences.email.reviewRequests,
    email_loyalty_updates: preferences.email.loyaltyUpdates,
    email_newsletters: preferences.email.newsletters,
    sms_booking_reminders: preferences.sms.bookingReminders,
    sms_booking_confirmations: preferences.sms.bookingConfirmations,
    sms_cancellations: preferences.sms.cancellations,
    sms_promotions: preferences.sms.promotions,
    sms_urgent_updates: preferences.sms.urgentUpdates,
    push_booking_reminders: preferences.push.bookingReminders,
    push_booking_confirmations: preferences.push.bookingConfirmations,
    push_cancellations: preferences.push.cancellations,
    push_promotions: preferences.push.promotions,
    push_review_requests: preferences.push.reviewRequests,
    push_loyalty_updates: preferences.push.loyaltyUpdates,
    push_general: preferences.push.general,
    quiet_hours_enabled: preferences.quietHours.enabled,
    quiet_hours_start: preferences.quietHours.startTime,
    quiet_hours_end: preferences.quietHours.endTime,
    quiet_hours_timezone: preferences.quietHours.timezone,
    updated_at: new Date().toISOString()
  }

  const { error } = await supabase
    .from('notification_settings')
    .upsert(updateData, {
      onConflict: 'user_id'
    })

  if (error) {
    throw new Error(`Failed to update notification preferences: ${error.message}`)
  }

  return preferences
}

export async function createNotification(
  userId: string,
  type: Notification['type'],
  title: string,
  message: string,
  options: {
    data?: Record<string, any>
    actionUrl?: string
    actionText?: string
    imageUrl?: string
    priority?: Notification['priority']
    scheduledFor?: Date
    expiresAt?: Date
  } = {}
): Promise<Notification> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      type,
      title,
      message,
      data: options.data,
      action_url: options.actionUrl,
      action_text: options.actionText,
      image_url: options.imageUrl,
      priority: options.priority || 'medium',
      scheduled_for: options.scheduledFor?.toISOString(),
      expires_at: options.expiresAt?.toISOString(),
      is_read: false
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create notification: ${error.message}`)
  }

  return {
    id: data.id,
    userId: data.user_id,
    type: data.type,
    title: data.title,
    message: data.message,
    data: data.data,
    isRead: data.is_read,
    actionUrl: data.action_url,
    actionText: data.action_text,
    imageUrl: data.image_url,
    priority: data.priority || 'medium',
    scheduledFor: data.scheduled_for ? new Date(data.scheduled_for) : undefined,
    expiresAt: data.expires_at ? new Date(data.expires_at) : undefined,
    createdAt: new Date(data.created_at),
    readAt: data.read_at ? new Date(data.read_at) : undefined
  }
}

export async function sendBookingReminder(
  userId: string,
  appointmentId: string,
  salonName: string,
  appointmentTime: Date
): Promise<void> {
  const timeString = appointmentTime.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })

  await createNotification(
    userId,
    'booking_reminder',
    'Appointment Reminder',
    `Don't forget about your appointment at ${salonName} on ${timeString}`,
    {
      data: { appointmentId },
      actionUrl: `/customer/appointments/${appointmentId}`,
      actionText: 'View Appointment',
      priority: 'high',
      expiresAt: appointmentTime
    }
  )
}

export async function sendBookingConfirmation(
  userId: string,
  appointmentId: string,
  salonName: string,
  appointmentTime: Date
): Promise<void> {
  const timeString = appointmentTime.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })

  await createNotification(
    userId,
    'booking_confirmation',
    'Booking Confirmed',
    `Your appointment at ${salonName} has been confirmed for ${timeString}`,
    {
      data: { appointmentId },
      actionUrl: `/customer/appointments/${appointmentId}`,
      actionText: 'View Details',
      priority: 'high'
    }
  )
}

export async function sendCancellationNotification(
  userId: string,
  appointmentId: string,
  salonName: string,
  reason?: string
): Promise<void> {
  const message = reason
    ? `Your appointment at ${salonName} has been cancelled. Reason: ${reason}`
    : `Your appointment at ${salonName} has been cancelled.`

  await createNotification(
    userId,
    'cancellation',
    'Appointment Cancelled',
    message,
    {
      data: { appointmentId, reason },
      actionUrl: '/customer/book',
      actionText: 'Book Again',
      priority: 'high'
    }
  )
}

export async function sendReviewRequest(
  userId: string,
  appointmentId: string,
  salonName: string
): Promise<void> {
  await createNotification(
    userId,
    'review_request',
    'Share Your Experience',
    `How was your recent visit to ${salonName}? We'd love to hear about your experience!`,
    {
      data: { appointmentId },
      actionUrl: `/customer/appointments/${appointmentId}/review`,
      actionText: 'Write Review',
      priority: 'medium',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Expires in 7 days
    }
  )
}

function getDefaultNotificationPreferences(): NotificationPreferences {
  return {
    email: {
      bookingReminders: true,
      bookingConfirmations: true,
      cancellations: true,
      promotions: false,
      reviewRequests: true,
      loyaltyUpdates: true,
      newsletters: false
    },
    sms: {
      bookingReminders: true,
      bookingConfirmations: true,
      cancellations: true,
      promotions: false,
      urgentUpdates: true
    },
    push: {
      bookingReminders: true,
      bookingConfirmations: true,
      cancellations: true,
      promotions: false,
      reviewRequests: true,
      loyaltyUpdates: true,
      general: true
    },
    quietHours: {
      enabled: false,
      startTime: '22:00',
      endTime: '08:00',
      timezone: 'America/New_York'
    }
  }
}