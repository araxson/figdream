'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import {
  updateService,
  deleteService,
  duplicateService
} from '../dal/services-mutations'
import { ServiceUpdate } from '../dal/services-types'
import { requireSalonContext, logSecurityEvent } from '@/core/auth/actions'

// Response types for consistent API
export interface ActionResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  fieldErrors?: Record<string, string[] | undefined>
  code?: string
  message?: string
}

// Re-export create action
export { createServiceAction } from './create'

// Validation schema for updates
const UpdateServiceSchema = z.object({
  name: z.string().min(1, 'Service name is required').max(100, 'Name too long').optional(),
  description: z.string().optional(),
  short_description: z.string().max(200, 'Short description too long').optional(),
  category_id: z.string().uuid('Invalid category ID').optional(),
  duration_minutes: z.number().min(5, 'Duration must be at least 5 minutes').max(480, 'Duration too long').optional(),
  buffer_minutes: z.number().min(0).max(60, 'Buffer time too long').optional(),
  base_price: z.number().min(0, 'Price cannot be negative').optional(),
  sale_price: z.number().min(0, 'Sale price cannot be negative').optional(),
  is_active: z.boolean().optional(),
  is_bookable: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  is_package: z.boolean().optional(),
  requires_deposit: z.boolean().optional(),
  deposit_amount: z.number().min(0).optional(),
  requires_consultation: z.boolean().optional(),
  max_capacity: z.number().min(1).max(50).optional()
})

/**
 * Update an existing service
 */
export async function updateServiceAction(
  id: string,
  data: FormData | ServiceUpdate
): Promise<ActionResponse> {
  try {
    // 1. MANDATORY: Authentication and salon context
    const context = await requireSalonContext()

    // 2. Parse and validate input
    const rawData = data instanceof FormData ? {
      name: data.get('name'),
      description: data.get('description') || undefined,
      short_description: data.get('short_description') || undefined,
      category_id: data.get('category_id') || undefined,
      duration_minutes: data.has('duration_minutes') ? parseInt(data.get('duration_minutes') as string) : undefined,
      buffer_minutes: data.has('buffer_minutes') ? parseInt(data.get('buffer_minutes') as string) : undefined,
      base_price: data.has('base_price') ? parseFloat(data.get('base_price') as string) : undefined,
      sale_price: data.has('sale_price') ? parseFloat(data.get('sale_price') as string) : undefined,
      is_active: data.has('is_active') ? data.get('is_active') === 'true' : undefined,
      is_bookable: data.has('is_bookable') ? data.get('is_bookable') === 'true' : undefined,
      is_featured: data.has('is_featured') ? data.get('is_featured') === 'true' : undefined,
      requires_deposit: data.has('requires_deposit') ? data.get('requires_deposit') === 'true' : undefined,
      deposit_amount: data.has('deposit_amount') ? parseFloat(data.get('deposit_amount') as string) : undefined,
      requires_consultation: data.has('requires_consultation') ? data.get('requires_consultation') === 'true' : undefined,
      max_capacity: data.has('max_capacity') ? parseInt(data.get('max_capacity') as string) : undefined
    } : data

    // Remove undefined values
    const cleanData = Object.fromEntries(
      Object.entries(rawData).filter(([_, v]) => v !== undefined)
    )

    const validatedData = UpdateServiceSchema.parse(cleanData)

    // 3. Update service
    await updateService(id, validatedData)

    // 4. Log the action
    await logSecurityEvent('service.update', {
      service_id: id,
      salon_id: context.salonId,
      changes: validatedData,
      user_id: context.user.id
    })

    // 5. Revalidate caches
    revalidatePath('/dashboard/services')
    revalidatePath('/admin/services')
    revalidatePath(`/services/${id}`)
    revalidateTag(`services-${context.salonId}`)
    revalidateTag(`service-${id}`)

    return {
      success: true,
      message: 'Service updated successfully'
    }

  } catch (error) {
    console.error('[Server Action Error - updateService]:', error)

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
      error: error instanceof Error ? error.message : 'Failed to update service',
      code: 'OPERATION_FAILED'
    }
  }
}

/**
 * Delete a service (soft delete)
 */
export async function deleteServiceAction(id: string): Promise<ActionResponse> {
  try {
    const context = await requireSalonContext()

    await deleteService(id)

    await logSecurityEvent('service.delete', {
      service_id: id,
      salon_id: context.salonId,
      user_id: context.user.id
    }, 'warning')

    revalidatePath('/dashboard/services')
    revalidatePath('/admin/services')
    revalidateTag(`services-${context.salonId}`)

    return {
      success: true,
      message: 'Service deleted successfully'
    }

  } catch (error) {
    console.error('[Server Action Error - deleteService]:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete service',
      code: 'OPERATION_FAILED'
    }
  }
}

/**
 * Duplicate a service
 */
export async function duplicateServiceAction(id: string): Promise<ActionResponse<{ id: string }>> {
  try {
    const context = await requireSalonContext()

    const newServiceId = await duplicateService(id)

    await logSecurityEvent('service.duplicate', {
      original_service_id: id,
      new_service_id: newServiceId,
      salon_id: context.salonId,
      user_id: context.user.id
    })

    revalidatePath('/dashboard/services')
    revalidatePath('/admin/services')
    revalidateTag(`services-${context.salonId}`)

    return {
      success: true,
      data: { id: newServiceId },
      message: 'Service duplicated successfully'
    }

  } catch (error) {
    console.error('[Server Action Error - duplicateService]:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to duplicate service',
      code: 'OPERATION_FAILED'
    }
  }
}
