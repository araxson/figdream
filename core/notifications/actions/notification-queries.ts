'use server'

import { z } from 'zod'
import { getUserContext } from '@/core/auth/actions/auth-helpers'
import {
  getNotifications,
  getUnreadCount,
  getNotificationStats
} from '../dal/notifications-queries'
import type { Notification, NotificationFilters, NotificationStats } from '../dal/notifications-types'
import { ActionResponse, NotificationFiltersSchema } from './notification-types'

/**
 * Get notifications with filters
 */
export async function fetchNotifications(
  filters?: FormData | NotificationFilters
): Promise<ActionResponse<Notification[]>> {
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
    const rawFilters = filters instanceof FormData
      ? {
          type: filters.get('type') as string | undefined,
          category: filters.get('category') as string | undefined,
          priority: filters.get('priority') as string | undefined,
          is_read: filters.get('is_read') === 'true',
          is_archived: filters.get('is_archived') === 'true',
          entity_type: filters.get('entity_type') as string | undefined,
          entity_id: filters.get('entity_id') as string | undefined,
          limit: filters.get('limit') ? Number(filters.get('limit')) : 50,
          offset: filters.get('offset') ? Number(filters.get('offset')) : 0
        }
      : filters

    const validatedFilters = rawFilters
      ? NotificationFiltersSchema.parse(rawFilters)
      : {}

    // Always filter by current user
    const notifications = await getNotifications({
      ...validatedFilters,
      user_id: user.id
    })

    return {
      success: true,
      data: notifications
    }

  } catch (error) {
    console.error('[Server Action Error - fetchNotifications]:', error)

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Invalid filter parameters',
        fieldErrors: error.flatten().fieldErrors,
        code: 'VALIDATION_ERROR'
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch notifications',
      code: 'OPERATION_FAILED'
    }
  }
}

/**
 * Get unread notification count
 */
export async function getUnreadNotificationCount(): Promise<ActionResponse<number>> {
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
    const count = await getUnreadCount(user.id)

    return {
      success: true,
      data: count
    }

  } catch (error) {
    console.error('[Server Action Error - getUnreadNotificationCount]:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get unread count',
      code: 'OPERATION_FAILED'
    }
  }
}

/**
 * Get notification statistics
 */
export async function getNotificationStatistics(): Promise<ActionResponse<NotificationStats>> {
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
    const stats = await getNotificationStats(user.id)

    return {
      success: true,
      data: stats
    }

  } catch (error) {
    console.error('[Server Action Error - getNotificationStatistics]:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get statistics',
      code: 'OPERATION_FAILED'
    }
  }
}