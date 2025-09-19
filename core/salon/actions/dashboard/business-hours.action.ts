'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import { updateBusinessHours } from '../dal/salons-mutations'
import { getSalonById } from '../dal/salons-queries'
import type { BusinessHours } from '../dal/salons-types'
import { requireAuth, logSecurityEvent } from '@/core/auth/actions'
import type { ActionResponse } from './crud'

// Validation schema
const BusinessHoursSchema = z.object({
  monday: z.object({
    open: z.boolean(),
    open_time: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
    close_time: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format')
  }),
  tuesday: z.object({
    open: z.boolean(),
    open_time: z.string().regex(/^\d{2}:\d{2}$/),
    close_time: z.string().regex(/^\d{2}:\d{2}$/)
  }),
  wednesday: z.object({
    open: z.boolean(),
    open_time: z.string().regex(/^\d{2}:\d{2}$/),
    close_time: z.string().regex(/^\d{2}:\d{2}$/)
  }),
  thursday: z.object({
    open: z.boolean(),
    open_time: z.string().regex(/^\d{2}:\d{2}$/),
    close_time: z.string().regex(/^\d{2}:\d{2}$/)
  }),
  friday: z.object({
    open: z.boolean(),
    open_time: z.string().regex(/^\d{2}:\d{2}$/),
    close_time: z.string().regex(/^\d{2}:\d{2}$/)
  }),
  saturday: z.object({
    open: z.boolean(),
    open_time: z.string().regex(/^\d{2}:\d{2}$/),
    close_time: z.string().regex(/^\d{2}:\d{2}$/)
  }),
  sunday: z.object({
    open: z.boolean(),
    open_time: z.string().regex(/^\d{2}:\d{2}$/),
    close_time: z.string().regex(/^\d{2}:\d{2}$/)
  })
})

/**
 * Update business hours
 */
export async function updateBusinessHoursAction(
  salonId: string,
  data: FormData | z.infer<typeof BusinessHoursSchema>
): Promise<ActionResponse> {
  try {
    // 1. Authentication - salon owners and admins can update hours
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
        error: 'You do not have permission to update business hours',
        code: 'PERMISSION_DENIED'
      }
    }

    // 3. Parse and validate input
    const rawData = data instanceof FormData
      ? JSON.parse(data.get('hours') as string)
      : data

    const validatedData = BusinessHoursSchema.parse(rawData)

    // 4. Update business hours
    await updateBusinessHours(salonId, validatedData as BusinessHours)

    // 5. Log security event
    await logSecurityEvent({
      action: 'salon.hours_updated',
      resource_type: 'salon',
      resource_id: salonId,
      details: {
        updated_by: authResult.user.id
      }
    })

    // 6. Invalidate cache
    revalidatePath(`/dashboard/settings`)
    revalidateTag(`salon-${salonId}-hours`)
    revalidateTag(`salon-${salonId}-availability`)

    return {
      success: true,
      message: 'Business hours updated successfully'
    }

  } catch (error) {
    console.error('[Server Action Error - updateBusinessHours]:', error)

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
      error: error instanceof Error ? error.message : 'Failed to update business hours',
      code: 'OPERATION_FAILED'
    }
  }
}
