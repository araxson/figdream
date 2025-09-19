'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import {
  upsertCustomerPreferences,
  toggleFavorite,
  addCustomerNote
} from '../dal/customers-mutations'
import type { FavoriteType } from '../dal/customers-types'
import { requireAuth, logSecurityEvent, getUserContext } from '@/core/auth/actions'
import {
  CustomerPreferencesSchema,
  CustomerNoteSchema,
  ActionResponse
} from '../../validators/customer.schemas'

/**
 * Update customer preferences
 */
export async function updateCustomerPreferencesAction(
  customerId: string,
  data: FormData | z.infer<typeof CustomerPreferencesSchema>
): Promise<ActionResponse> {
  try {
    // 1. Authentication
    let authUser: any
    try {
      authUser = await requireAuth()
    } catch (error) {
      return {
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      }
    }

    // 2. Parse and validate input
    const rawData = data instanceof FormData ? {
      notification_preferences: data.get('notification_preferences')
        ? JSON.parse(data.get('notification_preferences') as string)
        : undefined,
      booking_preferences: data.get('booking_preferences')
        ? JSON.parse(data.get('booking_preferences') as string)
        : undefined,
      service_preferences: data.get('service_preferences')
        ? JSON.parse(data.get('service_preferences') as string)
        : undefined,
      staff_preferences: data.get('staff_preferences')
        ? JSON.parse(data.get('staff_preferences') as string)
        : undefined
    } : data

    const validatedData = CustomerPreferencesSchema.parse(rawData)

    // 3. Update preferences
    const updated = await upsertCustomerPreferences(customerId, {
      preference_type: 'general',
      preference_value: validatedData as any
    })

    // 4. Log security event
    await logSecurityEvent({
      action: 'customer.preferences_updated',
      resource_type: 'customer',
      resource_id: customerId,
      details: {
        updated_by: authUser.user.id
      }
    })

    // 5. Invalidate cache
    revalidatePath(`/dashboard/customers/${customerId}`)
    revalidateTag(`customer-${customerId}`)

    return {
      success: true,
      data: updated,
      message: 'Preferences updated successfully'
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

/**
 * Add customer to favorites
 */
export async function addToFavoritesAction(
  customerId: string,
  targetId: string,
  type: FavoriteType
): Promise<ActionResponse> {
  try {
    // 1. Authentication
    let authUser: any
    try {
      authUser = await requireAuth()
    } catch (error) {
      return {
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      }
    }

    // 2. Toggle favorite
    const result = await toggleFavorite(customerId, targetId, type)

    // 3. Invalidate cache
    revalidatePath(`/dashboard/customers/${customerId}`)
    revalidateTag(`customer-${customerId}-favorites`)

    return {
      success: true,
      data: result,
      message: `${type} ${result.action === 'added' ? 'added to' : 'removed from'} favorites`
    }

  } catch (error) {
    console.error('[Server Action Error - addToFavorites]:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update favorites',
      code: 'OPERATION_FAILED'
    }
  }
}

/**
 * Add a note to customer profile
 */
export async function addCustomerNoteAction(
  customerId: string,
  data: FormData | z.infer<typeof CustomerNoteSchema>
): Promise<ActionResponse> {
  try {
    // 1. Authentication
    const context = await getUserContext()
    if ('success' in context && !context.success) {
      return context
    }
    if (!('user' in context)) {
      return {
        success: false,
        error: 'Invalid authentication context',
        code: 'AUTH_ERROR'
      }
    }

    // 2. Parse and validate input
    const rawData = data instanceof FormData ? {
      note: data.get('note'),
      is_private: data.get('is_private') === 'true',
      salon_id: data.get('salon_id') || context.staffProfile?.salon_id
    } : data

    const validatedData = CustomerNoteSchema.parse(rawData)

    // 3. Add note
    const note = await addCustomerNote({
      customer_id: customerId,
      note: validatedData.note,
      salon_id: validatedData.salon_id,
      staff_id: context.staffProfile?.id,
      created_by: context.user.id
    })

    // 4. Invalidate cache
    revalidatePath(`/dashboard/customers/${customerId}`)
    revalidateTag(`customer-${customerId}-notes`)

    return {
      success: true,
      data: note,
      message: 'Note added successfully'
    }

  } catch (error) {
    console.error('[Server Action Error - addNote]:', error)

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
      error: error instanceof Error ? error.message : 'Failed to add note',
      code: 'OPERATION_FAILED'
    }
  }
}