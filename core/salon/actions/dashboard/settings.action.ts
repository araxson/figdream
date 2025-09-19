'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import {
  updateSalon,
  updateSalonSettings
} from '../dal/salons-mutations'
import { getSalonById } from '../dal/salons-queries'
import { requireAuth, requireAdminRole, logSecurityEvent } from '@/core/auth/actions'
import type { ActionResponse } from './crud'

// Validation schemas
const SalonSettingsSchema = z.object({
  booking_settings: z.object({
    enable_online_booking: z.boolean().default(true),
    require_deposit: z.boolean().default(false),
    deposit_percentage: z.number().min(0).max(100).optional(),
    auto_confirm_bookings: z.boolean().default(false),
    allow_walk_ins: z.boolean().default(true),
    max_advance_booking_days: z.number().min(1).max(365).default(90),
    min_advance_booking_hours: z.number().min(0).default(24),
    buffer_time_minutes: z.number().min(0).max(60).default(0)
  }).optional(),
  notification_settings: z.object({
    send_booking_confirmations: z.boolean().default(true),
    send_reminders: z.boolean().default(true),
    reminder_hours_before: z.number().min(1).max(72).default(24),
    send_follow_ups: z.boolean().default(false),
    send_marketing: z.boolean().default(false)
  }).optional(),
  payment_settings: z.object({
    accept_cash: z.boolean().default(true),
    accept_card: z.boolean().default(true),
    accept_digital_wallets: z.boolean().default(false),
    tax_rate: z.number().min(0).max(30).optional(),
    tip_suggestions: z.array(z.number()).optional()
  }).optional(),
  staff_settings: z.object({
    allow_staff_login: z.boolean().default(true),
    allow_staff_booking_management: z.boolean().default(false),
    commission_based_pay: z.boolean().default(false),
    default_commission_rate: z.number().min(0).max(100).optional()
  }).optional()
})

// Note: updateBusinessHoursAction should be imported directly from './business-hours'

/**
 * Update salon settings
 */
export async function updateSalonSettingsAction(
  salonId: string,
  data: FormData | z.infer<typeof SalonSettingsSchema>
): Promise<ActionResponse> {
  try {
    // 1. Authentication - salon owners and admins can update settings
    const authResult = await requireAuth()
    if ('error' in authResult) {
      return authResult
    }

    // 2. Check permissions
    const salon = await getSalonById(salonId)
    if (!salon) {
      return {
        success: false,
        error: 'Salon not found',
        code: 'NOT_FOUND'
      }
    }

    const isOwner = salon.owner_id === authResult.user.id
    const isAdmin = authResult.role === 'admin' || authResult.role === 'super_admin'

    if (!isOwner && !isAdmin) {
      return {
        success: false,
        error: 'You do not have permission to update settings',
        code: 'PERMISSION_DENIED'
      }
    }

    // 3. Parse and validate input
    const rawData = data instanceof FormData
      ? JSON.parse(data.get('settings') as string)
      : data

    const validatedData = SalonSettingsSchema.parse(rawData)

    // 4. Update settings
    await updateSalonSettings(salonId, validatedData)

    // 5. Log security event
    await logSecurityEvent({
      action: 'salon.settings_updated',
      resource_type: 'salon',
      resource_id: salonId,
      details: {
        updated_sections: Object.keys(validatedData),
        updated_by: authResult.user.id
      }
    })

    // 6. Invalidate cache
    revalidatePath(`/dashboard/settings`)
    revalidateTag(`salon-${salonId}-settings`)

    return {
      success: true,
      message: 'Settings updated successfully'
    }

  } catch (error) {
    console.error('[Server Action Error - updateSettings]:', error)

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
      error: error instanceof Error ? error.message : 'Failed to update settings',
      code: 'OPERATION_FAILED'
    }
  }
}

/**
 * Toggle salon status (active/inactive)
 */
export async function toggleSalonStatusAction(
  salonId: string
): Promise<ActionResponse> {
  try {
    // 1. Authentication - only admins can toggle salon status
    const authResult = await requireAdminRole()
    if ('error' in authResult) {
      return authResult
    }

    // 2. Get current status
    const salon = await getSalonById(salonId)
    if (!salon) {
      return {
        success: false,
        error: 'Salon not found',
        code: 'NOT_FOUND'
      }
    }

    // 3. Toggle status
    const newStatus = !salon.is_active
    await updateSalon(salonId, { is_active: newStatus })

    // 4. Log security event
    await logSecurityEvent({
      action: newStatus ? 'salon.activated' : 'salon.deactivated',
      resource_type: 'salon',
      resource_id: salonId,
      details: {
        updated_by: authResult.user.id
      }
    })

    // 5. Invalidate cache
    revalidatePath('/admin/salons')
    revalidateTag(`salon-${salonId}`)

    return {
      success: true,
      message: `Salon ${newStatus ? 'activated' : 'deactivated'} successfully`
    }

  } catch (error) {
    console.error('[Server Action Error - toggleStatus]:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to toggle status',
      code: 'OPERATION_FAILED'
    }
  }
}

