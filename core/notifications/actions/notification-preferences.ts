'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import { getUserContext, logSecurityEvent } from '@/core/auth/actions/auth-helpers'
import { updateNotificationPreferences } from '../dal/notifications-mutations'
import { getNotificationPreferences } from '../dal/notifications-queries'
import type { NotificationPreferences, NotificationPreferencesUpdate } from '../dal/notifications-types'
import { ActionResponse, NotificationPreferencesSchema } from './notification-types'

/**
 * Get user's notification preferences
 */
export async function fetchNotificationPreferences(): Promise<ActionResponse<NotificationPreferences | null>> {
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
    const preferences = await getNotificationPreferences(user.id)

    return {
      success: true,
      data: preferences
    }

  } catch (error) {
    console.error('[Server Action Error - fetchNotificationPreferences]:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch preferences',
      code: 'OPERATION_FAILED'
    }
  }
}

/**
 * Update notification preferences
 */
export async function updatePreferences(
  data: FormData | NotificationPreferencesUpdate
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
    const rawData = data instanceof FormData
      ? {
          email_enabled: data.get('email_enabled') === 'true',
          sms_enabled: data.get('sms_enabled') === 'true',
          push_enabled: data.get('push_enabled') === 'true',
          quiet_hours_start: data.get('quiet_hours_start') as string | undefined,
          quiet_hours_end: data.get('quiet_hours_end') as string | undefined,
          categories: data.get('categories') ? JSON.parse(data.get('categories') as string) : undefined
        }
      : data

    const validatedData = NotificationPreferencesSchema.parse(rawData)

    // Update preferences through DAL
    await updateNotificationPreferences(user.id, validatedData)

    // Log preference update
    await logSecurityEvent({
      action: 'notification_preferences_updated',
      details: { user_id: user.id, changes: Object.keys(validatedData) }
    })

    // Cache Invalidation
    revalidatePath('/settings/notifications')
    revalidateTag(`notification-preferences-${user.id}`)

    return {
      success: true,
      message: 'Notification preferences updated'
    }

  } catch (error) {
    console.error('[Server Action Error - updatePreferences]:', error)

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
      error: error instanceof Error ? error.message : 'Failed to update preferences',
      code: 'OPERATION_FAILED'
    }
  }
}