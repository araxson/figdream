'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import { createService } from '../dal/services-mutations'
import { ServiceInsert } from '../dal/services-types'
import { requireSalonContext, logSecurityEvent } from '@/core/auth/actions'
import type { ActionResponse } from './crud'

// Validation schema
const CreateServiceSchema = z.object({
  name: z.string().min(1, 'Service name is required').max(100, 'Name too long'),
  description: z.string().optional(),
  short_description: z.string().max(200, 'Short description too long').optional(),
  category_id: z.string().uuid('Invalid category ID').optional(),
  duration_minutes: z.number().min(5, 'Duration must be at least 5 minutes').max(480, 'Duration too long'),
  buffer_minutes: z.number().min(0).max(60, 'Buffer time too long').default(0),
  base_price: z.number().min(0, 'Price cannot be negative'),
  sale_price: z.number().min(0, 'Sale price cannot be negative').optional(),
  is_active: z.boolean().default(true),
  is_bookable: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  is_package: z.boolean().default(false),
  requires_deposit: z.boolean().default(false),
  deposit_amount: z.number().min(0).optional(),
  requires_consultation: z.boolean().default(false),
  max_capacity: z.number().min(1).max(50).default(1)
})

/**
 * Create a new service with full authentication and validation
 */
export async function createServiceAction(
  data: FormData | ServiceInsert
): Promise<ActionResponse<{ id: string }>> {
  try {
    // 1. MANDATORY: Authentication and salon context
    const context = await requireSalonContext()

    // 2. Parse and validate input
    const rawData = data instanceof FormData ? {
      name: data.get('name'),
      description: data.get('description') || undefined,
      short_description: data.get('short_description') || undefined,
      category_id: data.get('category_id') || undefined,
      duration_minutes: parseInt(data.get('duration_minutes') as string || '30'),
      buffer_minutes: parseInt(data.get('buffer_minutes') as string || '0'),
      base_price: parseFloat(data.get('base_price') as string || '0'),
      sale_price: data.get('sale_price') ? parseFloat(data.get('sale_price') as string) : undefined,
      is_active: data.get('is_active') === 'true',
      is_bookable: data.get('is_bookable') === 'true',
      is_featured: data.get('is_featured') === 'true',
      is_package: data.get('is_package') === 'true',
      requires_deposit: data.get('requires_deposit') === 'true',
      deposit_amount: data.get('deposit_amount') ? parseFloat(data.get('deposit_amount') as string) : undefined,
      requires_consultation: data.get('requires_consultation') === 'true',
      max_capacity: parseInt(data.get('max_capacity') as string || '1')
    } : data

    const validatedData = CreateServiceSchema.parse(rawData)

    // 3. Create service with salon context
    const serviceData: ServiceInsert = {
      ...validatedData,
      salon_id: context.salonId,
      currency_code: 'USD',
      slug: validatedData.name.toLowerCase().replace(/\s+/g, '-'),
      is_addon: false,
      is_taxable: true
    }

    const serviceId = await createService(serviceData)

    // 4. Log the action for audit
    await logSecurityEvent('service.create', {
      service_id: serviceId,
      salon_id: context.salonId,
      name: validatedData.name,
      user_id: context.user.id
    })

    // 5. Revalidate caches
    revalidatePath('/dashboard/services')
    revalidatePath('/admin/services')
    revalidateTag(`services-${context.salonId}`)

    return {
      success: true,
      data: { id: serviceId },
      message: 'Service created successfully'
    }

  } catch (error) {
    console.error('[Server Action Error - createService]:', error)

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation failed. Please check your input.',
        fieldErrors: error.flatten().fieldErrors,
        code: 'VALIDATION_ERROR'
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create service',
      code: 'OPERATION_FAILED'
    }
  }
}
