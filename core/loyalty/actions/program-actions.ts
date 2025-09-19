'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import { getUserContext, requireSalonContext, logSecurityEvent } from '@/core/auth/actions/auth-helpers'
import {
  createLoyaltyProgram,
  updateLoyaltyProgram,
  deleteLoyaltyProgram
} from '../dal/mutations'
import {
  getLoyaltyPrograms,
  getLoyaltyProgramById,
  getLoyaltyStatistics
} from '../dal/queries'
import type {
  LoyaltyProgram,
  LoyaltyProgramInsert,
  LoyaltyProgramUpdate
} from '../dal/loyalty-types'
import { ActionResponse } from './loyalty-helpers'
import { CreateLoyaltyProgramSchema, UpdateLoyaltyProgramSchema } from './loyalty-schemas'

/**
 * Create a new loyalty program
 * Admin/Manager creates loyalty program for salon
 */
export async function createProgram(
  data: FormData | LoyaltyProgramInsert
): Promise<ActionResponse<{ id: string }>> {
  const userContext = await getUserContext()

  if (!userContext || 'error' in userContext) {
    return {
      success: false,
      error: 'Authentication required to create loyalty program',
      code: 'AUTH_REQUIRED'
    }
  }

  const { user, salonId, role } = userContext

  const canManagePrograms = role === 'salon_admin' || role === 'salon_manager' || role === 'platform_admin'

  if (!canManagePrograms) {
    await logSecurityEvent({
      action: 'create_loyalty_program_unauthorized',
      details: 'User lacks permission to create loyalty programs'
    })
    return {
      success: false,
      error: 'You do not have permission to create loyalty programs',
      code: 'PERMISSION_DENIED'
    }
  }

  const salonContext = await requireSalonContext()
  if ('error' in salonContext) {
    return {
      success: false,
      error: 'Salon context required',
      code: 'CONTEXT_REQUIRED'
    }
  }

  try {
    const rawData = data instanceof FormData
      ? {
          salon_id: salonContext.salonId,
          name: data.get('name') as string,
          description: data.get('description') as string | undefined,
          type: data.get('type') as string,
          points_per_dollar: data.get('points_per_dollar') ? Number(data.get('points_per_dollar')) : undefined,
          points_per_visit: data.get('points_per_visit') ? Number(data.get('points_per_visit')) : undefined,
          redemption_rate: data.get('redemption_rate') ? Number(data.get('redemption_rate')) : undefined,
          tier_config: data.get('tier_config') ? JSON.parse(data.get('tier_config') as string) : undefined,
          benefits: data.get('benefits') ? JSON.parse(data.get('benefits') as string) : [],
          terms_conditions: data.get('terms_conditions') as string | undefined,
          is_active: data.get('is_active') === 'true',
          starts_at: data.get('starts_at') as string | undefined,
          ends_at: data.get('ends_at') as string | undefined
        }
      : { ...data, salon_id: salonContext.salonId }

    const validatedData = CreateLoyaltyProgramSchema.parse(rawData)
    const programId = await createLoyaltyProgram(validatedData)

    await logSecurityEvent({
      action: 'loyalty_program_created',
      resource_id: programId,
      details: {
        salon_id: validatedData.salon_id,
        program_type: validatedData.type,
        name: validatedData.name
      }
    })

    revalidatePath('/dashboard/loyalty')
    revalidatePath('/admin/loyalty')
    revalidateTag(`loyalty-${validatedData.salon_id}`)
    revalidateTag('loyalty-programs')

    return {
      success: true,
      data: { id: programId },
      message: 'Loyalty program created successfully'
    }

  } catch (error) {
    console.error('[Server Action Error - createProgram]:', {
      error: error instanceof Error ? error.message : error,
      userId: user.id,
      salonId: salonContext.salonId,
      timestamp: new Date().toISOString()
    })

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
      error: error instanceof Error ? error.message : 'Failed to create loyalty program',
      code: 'OPERATION_FAILED'
    }
  }
}

/**
 * Update an existing loyalty program
 */
export async function updateProgram(
  id: string,
  data: FormData | LoyaltyProgramUpdate
): Promise<ActionResponse<void>> {
  const userContext = await getUserContext()

  if (!userContext || 'error' in userContext) {
    return {
      success: false,
      error: 'Authentication required',
      code: 'AUTH_REQUIRED'
    }
  }

  const { user, role } = userContext
  const canManagePrograms = role === 'salon_admin' || role === 'salon_manager' || role === 'platform_admin'

  if (!canManagePrograms) {
    return {
      success: false,
      error: 'Permission denied',
      code: 'PERMISSION_DENIED'
    }
  }

  try {
    const rawData = data instanceof FormData
      ? {
          name: data.get('name') as string | undefined,
          description: data.get('description') as string | undefined,
          type: data.get('type') as string | undefined,
          points_per_dollar: data.get('points_per_dollar') ? Number(data.get('points_per_dollar')) : undefined,
          points_per_visit: data.get('points_per_visit') ? Number(data.get('points_per_visit')) : undefined,
          redemption_rate: data.get('redemption_rate') ? Number(data.get('redemption_rate')) : undefined,
          tier_config: data.get('tier_config') ? JSON.parse(data.get('tier_config') as string) : undefined,
          benefits: data.get('benefits') ? JSON.parse(data.get('benefits') as string) : undefined,
          terms_conditions: data.get('terms_conditions') as string | undefined,
          is_active: data.get('is_active') !== undefined ? data.get('is_active') === 'true' : undefined,
          starts_at: data.get('starts_at') as string | undefined,
          ends_at: data.get('ends_at') as string | undefined
        }
      : data

    const validatedData = UpdateLoyaltyProgramSchema.parse(rawData)
    await updateLoyaltyProgram(id, validatedData)

    revalidatePath('/dashboard/loyalty')
    revalidatePath(`/dashboard/loyalty/${id}`)
    revalidateTag(`loyalty-program-${id}`)

    return {
      success: true,
      message: 'Loyalty program updated successfully'
    }

  } catch (error) {
    console.error('[Server Action Error - updateProgram]:', error)

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
      error: error instanceof Error ? error.message : 'Failed to update loyalty program',
      code: 'OPERATION_FAILED'
    }
  }
}

/**
 * Delete a loyalty program
 */
export async function deleteProgram(id: string): Promise<ActionResponse<void>> {
  const userContext = await getUserContext()

  if (!userContext || 'error' in userContext) {
    return {
      success: false,
      error: 'Authentication required',
      code: 'AUTH_REQUIRED'
    }
  }

  const { user, role } = userContext

  if (role !== 'salon_admin' && role !== 'platform_admin') {
    return {
      success: false,
      error: 'Admin access required',
      code: 'PERMISSION_DENIED'
    }
  }

  try {
    await deleteLoyaltyProgram(id)

    await logSecurityEvent({
      action: 'loyalty_program_deleted',
      resource_id: id,
      details: { deleted_by: user.id }
    })

    revalidatePath('/dashboard/loyalty')
    revalidateTag(`loyalty-program-${id}`)
    revalidateTag('loyalty-programs')

    return {
      success: true,
      message: 'Loyalty program deleted successfully'
    }

  } catch (error) {
    console.error('[Server Action Error - deleteProgram]:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete loyalty program',
      code: 'OPERATION_FAILED'
    }
  }
}

/**
 * Get loyalty program statistics
 */
export async function getLoyaltyProgramStats(
  programId: string
): Promise<ActionResponse<any>> {
  const userContext = await getUserContext()

  if (!userContext || 'error' in userContext) {
    return {
      success: false,
      error: 'Authentication required',
      code: 'AUTH_REQUIRED'
    }
  }

  try {
    const stats = await getLoyaltyStatistics(programId)

    return {
      success: true,
      data: stats
    }

  } catch (error) {
    console.error('[Server Action Error - getLoyaltyProgramStats]:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch statistics',
      code: 'OPERATION_FAILED'
    }
  }
}