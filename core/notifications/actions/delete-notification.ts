'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { getUserContext, logSecurityEvent } from '@/core/auth/actions/auth-helpers'
import { deleteNotification, bulkDeleteNotifications } from '../dal/notifications-mutations'
import { getNotificationById } from '../dal/notifications-queries'
import { ActionResponse } from './notification-types'

/**
 * Delete a notification
 */
export async function deleteNotificationAction(
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
      await logSecurityEvent({
        action: 'delete_notification_unauthorized',
        resource_id: notificationId,
        details: 'User attempted to delete notification they do not own'
      })
      return {
        success: false,
        error: 'You can only delete your own notifications',
        code: 'PERMISSION_DENIED'
      }
    }

    // Delete through DAL
    await deleteNotification(notificationId)

    // Cache Invalidation
    revalidatePath('/notifications')
    revalidateTag(`notifications-${user.id}`)

    return {
      success: true,
      message: 'Notification deleted'
    }

  } catch (error) {
    console.error('[Server Action Error - deleteNotificationAction]:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete notification',
      code: 'OPERATION_FAILED'
    }
  }
}

/**
 * Bulk delete notifications
 */
export async function bulkDeleteNotificationsAction(
  ids: string[]
): Promise<ActionResponse<{ deleted: number }>> {
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
    // Verify ownership of all notifications
    for (const id of ids) {
      const notification = await getNotificationById(id)
      if (notification && notification.user_id !== user.id) {
        return {
          success: false,
          error: 'You can only delete your own notifications',
          code: 'PERMISSION_DENIED'
        }
      }
    }

    const deletedCount = await bulkDeleteNotifications(ids)

    // Log bulk operation
    await logSecurityEvent({
      action: 'bulk_notifications_deleted',
      details: {
        deleted_count: deletedCount,
        total_attempted: ids.length,
        deleted_by: user.id
      }
    })

    // Cache Invalidation
    revalidatePath('/notifications')
    revalidateTag(`notifications-${user.id}`)

    return {
      success: true,
      data: { deleted: deletedCount },
      message: `Successfully deleted ${deletedCount} notifications`
    }

  } catch (error) {
    console.error('[Server Action Error - bulkDeleteNotificationsAction]:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete notifications',
      code: 'OPERATION_FAILED'
    }
  }
}