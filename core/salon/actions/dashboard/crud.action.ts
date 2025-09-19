'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import {
  updateSalon,
  deleteSalon
} from '../dal/salons-mutations'
import { getSalonById } from '../dal/salons-queries'
import type { SalonUpdate } from '../dal/salons-types'
import { requireAuth, requireAdminRole, logSecurityEvent } from '@/core/auth/actions'

// Response types
export interface ActionResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  fieldErrors?: Record<string, string[] | undefined>
  code?: string
  message?: string
}

// Note: createSalonAction should be imported directly from './create'

// Validation schema for updates
const UpdateSalonSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  business_name: z.string().optional(),
  business_type: z.enum(['salon', 'barbershop', 'spa', 'wellness_center', 'nail_salon']).optional(),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').optional(),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')).optional(),
  description: z.string().optional(),
  short_description: z.string().max(160, 'Short description too long').optional(),
  address: z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    postal_code: z.string().min(1, 'Postal code is required'),
    country: z.string().default('US')
  }).optional(),
  timezone: z.string().optional(),
  currency_code: z.string().optional(),
  language_code: z.string().optional(),
  booking_lead_time_hours: z.number().min(0).optional(),
  cancellation_hours: z.number().min(0).optional(),
  features: z.array(z.string()).optional()
})

/**
 * Update salon information
 */
export async function updateSalonAction(
  salonId: string,
  data: FormData | SalonUpdate
): Promise<ActionResponse> {
  try {
    // 1. Authentication - salon owners and admins can update
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
        error: 'You do not have permission to update this salon',
        code: 'PERMISSION_DENIED'
      }
    }

    // 3. Parse and validate input
    const rawData = data instanceof FormData ? {
      name: data.get('name') || undefined,
      business_name: data.get('business_name') || undefined,
      business_type: data.get('business_type') || undefined,
      email: data.get('email') || undefined,
      phone: data.get('phone') || undefined,
      website: data.get('website') || undefined,
      description: data.get('description') || undefined,
      short_description: data.get('short_description') || undefined,
      address: data.has('address') ? JSON.parse(data.get('address') as string) : undefined,
      timezone: data.get('timezone') || undefined,
      currency_code: data.get('currency_code') || undefined,
      language_code: data.get('language_code') || undefined,
      booking_lead_time_hours: data.has('booking_lead_time_hours')
        ? parseInt(data.get('booking_lead_time_hours') as string)
        : undefined,
      cancellation_hours: data.has('cancellation_hours')
        ? parseInt(data.get('cancellation_hours') as string)
        : undefined,
      features: data.has('features') ? JSON.parse(data.get('features') as string) : undefined
    } : data

    const validatedData = UpdateSalonSchema.parse(rawData)

    // 4. Update salon
    await updateSalon(salonId, validatedData as SalonUpdate)

    // 5. Log security event
    await logSecurityEvent({
      action: 'salon.updated',
      resource_type: 'salon',
      resource_id: salonId,
      details: {
        updated_fields: Object.keys(validatedData),
        updated_by: authResult.user.id
      }
    })

    // 6. Invalidate cache
    revalidatePath(`/dashboard/settings`)
    revalidatePath('/admin/salons')
    revalidateTag(`salon-${salonId}`)

    return {
      success: true,
      message: 'Salon updated successfully'
    }

  } catch (error) {
    console.error('[Server Action Error - updateSalon]:', error)

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
      error: error instanceof Error ? error.message : 'Failed to update salon',
      code: 'OPERATION_FAILED'
    }
  }
}

/**
 * Delete salon (soft delete)
 */
export async function deleteSalonAction(
  salonId: string
): Promise<ActionResponse> {
  try {
    // 1. Authentication - only admins can delete salons
    const authResult = await requireAdminRole()
    if ('error' in authResult) {
      return authResult
    }

    // 2. Check for active subscriptions and bookings
    const supabase = await createClient()
    const { data: activeBookings } = await supabase
      .from('appointments')
      .select('id')
      .eq('salon_id', salonId)
      .in('status', ['pending', 'confirmed'])
      .limit(1)

    if (activeBookings && activeBookings.length > 0) {
      return {
        success: false,
        error: 'Cannot delete salon with active bookings',
        code: 'HAS_ACTIVE_BOOKINGS'
      }
    }

    // 3. Soft delete salon
    await deleteSalon(salonId)

    // 4. Log security event
    await logSecurityEvent({
      action: 'salon.deleted',
      resource_type: 'salon',
      resource_id: salonId,
      details: {
        deleted_by: authResult.user.id
      }
    })

    // 5. Invalidate cache
    revalidatePath('/admin/salons')
    revalidateTag(`salon-${salonId}`)
    revalidateTag('salons')

    return {
      success: true,
      message: 'Salon deleted successfully'
    }

  } catch (error) {
    console.error('[Server Action Error - deleteSalon]:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete salon',
      code: 'OPERATION_FAILED'
    }
  }
}
