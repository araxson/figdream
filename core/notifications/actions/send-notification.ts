'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import { getUserContext, logSecurityEvent } from '@/core/auth/actions/auth-helpers'
import { createNotification } from '../dal/notifications-mutations'
import type { NotificationInsert, SendNotificationParams } from '../dal/notifications-types'
import { ActionResponse, SendNotificationSchema } from './notification-types'

/**
 * Send a notification to a user
 * Creates a new notification in the system
 */
export async function sendNotification(
  data: FormData | SendNotificationParams
): Promise<ActionResponse<{ id: string }>> {
  // 1. MANDATORY: Enterprise Authentication
  const userContext = await getUserContext()

  if (!userContext || 'error' in userContext) {
    return {
      success: false,
      error: 'Authentication required to send notification',
      code: 'AUTH_REQUIRED'
    }
  }

  const { user, role } = userContext

  try {
    // 2. Input Validation & Extraction
    const rawData = data instanceof FormData
      ? {
          user_id: data.get('user_id') as string | undefined,
          type: data.get('type') as string,
          title: data.get('title') as string,
          message: data.get('message') as string,
          action_url: data.get('action_url') as string | undefined,
          action_label: data.get('action_label') as string | undefined,
          entity_type: data.get('entity_type') as string | undefined,
          entity_id: data.get('entity_id') as string | undefined,
          priority: data.get('priority') as string || 'medium',
          category: data.get('category') as string | undefined,
          channels: data.get('channels') ? JSON.parse(data.get('channels') as string) : ['in_app'],
          data: data.get('data') ? JSON.parse(data.get('data') as string) : {},
          metadata: data.get('metadata') ? JSON.parse(data.get('metadata') as string) : {},
          expires_at: data.get('expires_at') as string | undefined
        }
      : data

    const validatedData = SendNotificationSchema.parse(rawData)

    // 3. Authorization check - only admins can send to other users
    const targetUserId = validatedData.user_id || user.id
    if (targetUserId !== user.id && role !== 'platform_admin' && role !== 'salon_admin') {
      await logSecurityEvent({
        action: 'send_notification_unauthorized',
        details: 'User attempted to send notification to another user without permission'
      })
      return {
        success: false,
        error: 'You can only send notifications to yourself',
        code: 'PERMISSION_DENIED'
      }
    }

    // 4. Prepare notification data
    const notificationData: NotificationInsert = {
      user_id: targetUserId,
      type: validatedData.type,
      title: validatedData.title,
      message: validatedData.message,
      action_url: validatedData.action_url,
      action_label: validatedData.action_label,
      entity_type: validatedData.entity_type,
      entity_id: validatedData.entity_id,
      priority: validatedData.priority,
      category: validatedData.category,
      channels: validatedData.channels || ['in_app'],
      is_read: false,
      is_archived: false,
      data: validatedData.data || {},
      metadata: {
        ...validatedData.metadata,
        sent_by: user.id,
        sent_at: new Date().toISOString()
      },
      expires_at: validatedData.expires_at
    }

    // 5. Create notification through DAL
    const notificationId = await createNotification(notificationData)

    // 6. Log security event
    await logSecurityEvent({
      action: 'notification_sent',
      resource_id: notificationId,
      details: {
        target_user: targetUserId,
        type: validatedData.type,
        priority: validatedData.priority
      }
    })

    // 7. Intelligent Cache Invalidation
    revalidatePath('/notifications')
    revalidatePath('/dashboard')
    revalidateTag(`notifications-${targetUserId}`)
    revalidateTag('notification-count')

    // 8. Success Response
    return {
      success: true,
      data: { id: notificationId },
      message: 'Notification sent successfully'
    }

  } catch (error) {
    // 9. Comprehensive Error Handling
    console.error('[Server Action Error - sendNotification]:', {
      error: error instanceof Error ? error.message : error,
      userId: user.id,
      timestamp: new Date().toISOString()
    })

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation failed',
        fieldErrors: error.flatten().fieldErrors,
        code: 'VALIDATION_ERROR'
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send notification',
      code: 'OPERATION_FAILED'
    }
  }
}

/**
 * Send bulk notifications (admin only)
 */
export async function sendBulkNotifications(
  userIds: string[],
  notificationData: Omit<SendNotificationParams, 'userId'>
): Promise<ActionResponse<{ sent: number }>> {
  const userContext = await getUserContext()

  if (!userContext || 'error' in userContext) {
    return {
      success: false,
      error: 'Authentication required',
      code: 'AUTH_REQUIRED'
    }
  }

  const { user, role } = userContext

  // Admin only operation
  if (role !== 'platform_admin' && role !== 'salon_admin') {
    return {
      success: false,
      error: 'Admin access required',
      code: 'PERMISSION_DENIED'
    }
  }

  try {
    let sentCount = 0

    for (const userId of userIds) {
      try {
        const data: NotificationInsert = {
          user_id: userId,
          type: notificationData.type,
          title: notificationData.title,
          message: notificationData.message,
          action_url: notificationData.actionUrl,
          action_label: notificationData.actionLabel,
          entity_type: notificationData.entityType,
          entity_id: notificationData.entityId,
          priority: notificationData.priority || 'medium',
          category: notificationData.category,
          channels: notificationData.channels || ['in_app'],
          is_read: false,
          is_archived: false,
          data: notificationData.data || {},
          metadata: {
            ...notificationData.metadata,
            sent_by: user.id,
            sent_at: new Date().toISOString(),
            bulk_send: true
          },
          expires_at: notificationData.expiresAt
        }

        await createNotification(data)
        sentCount++
      } catch (error) {
        console.error(`Failed to send notification to user ${userId}:`, error)
      }
    }

    // Log bulk operation
    await logSecurityEvent({
      action: 'bulk_notifications_sent',
      details: {
        sent_count: sentCount,
        total_attempted: userIds.length,
        sent_by: user.id,
        notification_type: notificationData.type
      }
    })

    // Cache Invalidation
    revalidatePath('/notifications')
    revalidatePath('/admin/notifications')
    revalidateTag('notifications')

    return {
      success: true,
      data: { sent: sentCount },
      message: `Successfully sent ${sentCount} of ${userIds.length} notifications`
    }

  } catch (error) {
    console.error('[Server Action Error - sendBulkNotifications]:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send bulk notifications',
      code: 'OPERATION_FAILED'
    }
  }
}