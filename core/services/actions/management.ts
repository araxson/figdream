'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import {
  bulkUpdateServices,
  bulkDeleteServices,
  toggleServiceFeatured,
  toggleServiceBookable,
  updateServiceCategory
} from '../dal/services-mutations'
import { ServiceUpdate } from '../dal/services-types'
import { requireSalonContext, logSecurityEvent } from '@/core/auth/actions/auth-helpers'
import type { ActionResponse } from './crud'

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
 * Toggle service featured status
 */
export async function toggleServiceFeaturedAction(id: string): Promise<ActionResponse> {
  try {
    const context = await requireSalonContext()

    await toggleServiceFeatured(id)

    await logSecurityEvent('service.toggle_featured', {
      service_id: id,
      salon_id: context.salonId,
      user_id: context.user.id
    })

    revalidatePath('/dashboard/services')
    revalidateTag(`service-${id}`)

    return {
      success: true,
      message: 'Service featured status updated'
    }

  } catch (error) {
    console.error('[Server Action Error - toggleServiceFeatured]:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update featured status',
      code: 'OPERATION_FAILED'
    }
  }
}

/**
 * Toggle service bookable status
 */
export async function toggleServiceBookableAction(id: string): Promise<ActionResponse> {
  try {
    const context = await requireSalonContext()

    await toggleServiceBookable(id)

    await logSecurityEvent('service.toggle_bookable', {
      service_id: id,
      salon_id: context.salonId,
      user_id: context.user.id
    })

    revalidatePath('/dashboard/services')
    revalidateTag(`service-${id}`)

    return {
      success: true,
      message: 'Service bookable status updated'
    }

  } catch (error) {
    console.error('[Server Action Error - toggleServiceBookable]:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update bookable status',
      code: 'OPERATION_FAILED'
    }
  }
}

/**
 * Bulk update multiple services
 */
export async function bulkUpdateServicesAction(
  ids: string[],
  data: Partial<ServiceUpdate>
): Promise<ActionResponse> {
  try {
    const context = await requireSalonContext()

    if (!ids || ids.length === 0) {
      return {
        success: false,
        error: 'No services selected',
        code: 'INVALID_INPUT'
      }
    }

    const validatedData = UpdateServiceSchema.partial().parse(data)

    await bulkUpdateServices(
      ids.map(id => ({ id, data: validatedData }))
    )

    await logSecurityEvent('service.bulk_update', {
      service_ids: ids,
      salon_id: context.salonId,
      changes: validatedData,
      user_id: context.user.id
    })

    revalidatePath('/dashboard/services')
    revalidatePath('/admin/services')
    revalidateTag(`services-${context.salonId}`)

    return {
      success: true,
      message: `${ids.length} services updated successfully`
    }

  } catch (error) {
    console.error('[Server Action Error - bulkUpdateServices]:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update services',
      code: 'OPERATION_FAILED'
    }
  }
}

/**
 * Bulk delete multiple services
 */
export async function bulkDeleteServicesAction(ids: string[]): Promise<ActionResponse> {
  try {
    const context = await requireSalonContext()

    if (!ids || ids.length === 0) {
      return {
        success: false,
        error: 'No services selected',
        code: 'INVALID_INPUT'
      }
    }

    await bulkDeleteServices(ids)

    await logSecurityEvent('service.bulk_delete', {
      service_ids: ids,
      salon_id: context.salonId,
      user_id: context.user.id
    }, 'warning')

    revalidatePath('/dashboard/services')
    revalidatePath('/admin/services')
    revalidateTag(`services-${context.salonId}`)

    return {
      success: true,
      message: `${ids.length} services deleted successfully`
    }

  } catch (error) {
    console.error('[Server Action Error - bulkDeleteServices]:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete services',
      code: 'OPERATION_FAILED'
    }
  }
}

/**
 * Update service category
 */
export async function updateServiceCategoryAction(
  serviceId: string,
  categoryId: string
): Promise<ActionResponse> {
  try {
    const context = await requireSalonContext()

    await updateServiceCategory(serviceId, categoryId)

    await logSecurityEvent('service.update_category', {
      service_id: serviceId,
      category_id: categoryId,
      salon_id: context.salonId,
      user_id: context.user.id
    })

    revalidatePath('/dashboard/services')
    revalidateTag(`service-${serviceId}`)

    return {
      success: true,
      message: 'Service category updated'
    }

  } catch (error) {
    console.error('[Server Action Error - updateServiceCategory]:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update category',
      code: 'OPERATION_FAILED'
    }
  }
}

// Re-export form handler\nexport { handleServiceFormAction } from './form-handlers'
