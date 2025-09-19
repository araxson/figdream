'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { getUserContext } from '@/core/auth/actions/auth-helpers'
import {
  markNotificationAsRead,
  markNotificationAsArchived,
  markAllAsRead,
  markAllAsArchived
} from '../dal/notifications-mutations'
import { getNotificationById } from '../dal/notifications-queries'
import { ActionResponse } from './notification-types'

/**
 * Mark a notification as read
 */
export async function markAsRead(
  notificationId: string
): Promise<ActionResponse<void>> {
  const userContext = await getUserContext()

  if (!userContext || 'error' in userContext) {
    return {
      success: false,
      error: 'Authentication required',
      code: 'AUTH_REQUIRED'
    }
  }

  const { user } = userContext

  try {
    // Verify ownership
    const notification = await getNotificationById(notificationId)
    if (!notification) {
      return {
        success: false,
        error: 'Notification not found',
        code: 'NOT_FOUND'
      }
    }

    if (notification.user_id !== user.id) {
      return {
        success: false,
        error: 'You can only mark your own notifications as read',
        code: 'PERMISSION_DENIED'
      }
    }

    // Mark as read through DAL
    await markNotificationAsRead(notificationId)

    // Cache Invalidation
    revalidatePath('/notifications')
    revalidateTag(`notifications-${user.id}`)
    revalidateTag('notification-count')

    return {
      success: true,
      message: 'Notification marked as read'
    }

  } catch (error) {
    console.error('[Server Action Error - markAsRead]:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to mark as read',
      code: 'OPERATION_FAILED'
    }
  }
}

/**
 * Mark all notifications as read for the current user
 */
export async function markAllNotificationsAsRead(): Promise<ActionResponse<{ updated: number }>> {
  const userContext = await getUserContext()

  if (!userContext || 'error' in userContext) {
    return {
      success: false,
      error: 'Authentication required',
      code: 'AUTH_REQUIRED'
    }
  }

  const { user } = userContext

  try {
    const updatedCount = await markAllAsRead(user.id)

    // Cache Invalidation
    revalidatePath('/notifications')
    revalidateTag(`notifications-${user.id}`)
    revalidateTag('notification-count')

    return {
      success: true,
      data: { updated: updatedCount },
      message: `Marked ${updatedCount} notifications as read`
    }

  } catch (error) {
    console.error('[Server Action Error - markAllNotificationsAsRead]:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to mark all as read',
      code: 'OPERATION_FAILED'
    }
  }
}

/**
 * Archive a notification
 */
export async function archiveNotification(
  notificationId: string
): Promise<ActionResponse<void>> {
  const userContext = await getUserContext()

  if (!userContext || 'error' in userContext) {
    return {
      success: false,
      error: 'Authentication required',
      code: 'AUTH_REQUIRED'
    }
  }

  const { user } = userContext

  try {
    // Verify ownership
    const notification = await getNotificationById(notificationId)
    if (!notification) {
      return {
        success: false,
        error: 'Notification not found',
        code: 'NOT_FOUND'
      }
    }

    if (notification.user_id !== user.id) {
      return {
        success: false,
        error: 'You can only archive your own notifications',
        code: 'PERMISSION_DENIED'
      }
    }

    // Archive through DAL
    await markNotificationAsArchived(notificationId)

    // Cache Invalidation
    revalidatePath('/notifications')
    revalidateTag(`notifications-${user.id}`)

    return {
      success: true,
      message: 'Notification archived'
    }

  } catch (error) {
    console.error('[Server Action Error - archiveNotification]:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to archive notification',
      code: 'OPERATION_FAILED'
    }
  }
}

/**
 * Archive all notifications for the current user
 */
export async function archiveAllNotifications(): Promise<ActionResponse<{ updated: number }>> {
  const userContext = await getUserContext()

  if (!userContext || 'error' in userContext) {
    return {
      success: false,
      error: 'Authentication required',
      code: 'AUTH_REQUIRED'
    }
  }

  const { user } = userContext

  try {
    const updatedCount = await markAllAsArchived(user.id)

    // Cache Invalidation
    revalidatePath('/notifications')
    revalidateTag(`notifications-${user.id}`)

    return {
      success: true,
      data: { updated: updatedCount },
      message: `Archived ${updatedCount} notifications`
    }

  } catch (error) {
    console.error('[Server Action Error - archiveAllNotifications]:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to archive all notifications',
      code: 'OPERATION_FAILED'
    }
  }
}