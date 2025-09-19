'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import { createSalon } from '../dal/salons-mutations'
import { getSalonBySlug } from '../dal/salons-queries'
import type { SalonInsert } from '../dal/salons-types'
import { requireAdminRole, logSecurityEvent } from '@/core/auth/actions/auth-helpers'
import type { ActionResponse } from './crud'

// Validation schema
const CreateSalonSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string()
    .min(3, 'Slug must be at least 3 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  business_name: z.string().optional(),
  business_type: z.enum(['salon', 'barbershop', 'spa', 'wellness_center', 'nail_salon']).optional(),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  description: z.string().optional(),
  short_description: z.string().max(160, 'Short description too long').optional(),
  address: z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    postal_code: z.string().min(1, 'Postal code is required'),
    country: z.string().default('US')
  }),
  timezone: z.string().default('America/New_York'),
  currency_code: z.string().default('USD'),
  language_code: z.string().default('en'),
  booking_lead_time_hours: z.number().min(0).default(24),
  cancellation_hours: z.number().min(0).default(24),
  features: z.array(z.string()).optional()
})

/**
 * Create a new salon
 */
export async function createSalonAction(
  data: FormData | z.infer<typeof CreateSalonSchema>
): Promise<ActionResponse<{ id: string }>> {
  try {
    // 1. Authentication - only admins can create salons
    const authResult = await requireAdminRole()
    if ('error' in authResult) {
      return authResult
    }

    // 2. Parse and validate input
    const rawData = data instanceof FormData ? {
      name: data.get('name'),
      slug: data.get('slug'),
      business_name: data.get('business_name') || undefined,
      business_type: data.get('business_type') || undefined,
      email: data.get('email'),
      phone: data.get('phone'),
      website: data.get('website') || undefined,
      description: data.get('description') || undefined,
      short_description: data.get('short_description') || undefined,
      address: data.get('address') ? JSON.parse(data.get('address') as string) : undefined,
      timezone: data.get('timezone') || 'America/New_York',
      currency_code: data.get('currency_code') || 'USD',
      language_code: data.get('language_code') || 'en',
      booking_lead_time_hours: data.get('booking_lead_time_hours')
        ? parseInt(data.get('booking_lead_time_hours') as string)
        : 24,
      cancellation_hours: data.get('cancellation_hours')
        ? parseInt(data.get('cancellation_hours') as string)
        : 24,
      features: data.get('features') ? JSON.parse(data.get('features') as string) : undefined
    } : data

    const validatedData = CreateSalonSchema.parse(rawData)

    // 3. Check if slug is unique
    const existingSalon = await getSalonBySlug(validatedData.slug)
    if (existingSalon) {
      return {
        success: false,
        error: 'A salon with this slug already exists',
        code: 'SLUG_EXISTS'
      }
    }

    // 4. Create salon
    const salonData: SalonInsert = {
      ...validatedData,
      owner_id: authResult.user.id,
      is_active: true,
      is_verified: false,
      is_featured: false,
      subscription_tier: 'free',
      max_staff: 5,
      max_services: 20,
      max_bookings_per_day: 50
    }

    const salonId = await createSalon(salonData)

    // 5. Log security event
    await logSecurityEvent({
      action: 'salon.created',
      resource_type: 'salon',
      resource_id: salonId,
      details: {
        name: validatedData.name,
        slug: validatedData.slug,
        created_by: authResult.user.id
      }
    })

    // 6. Invalidate cache
    revalidatePath('/admin/salons')
    revalidatePath('/dashboard')
    revalidateTag('salons')

    return {
      success: true,
      data: { id: salonId },
      message: 'Salon created successfully'
    }

  } catch (error) {
    console.error('[Server Action Error - createSalon]:', error)

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
      error: error instanceof Error ? error.message : 'Failed to create salon',
      code: 'OPERATION_FAILED'
    }
  }
}
