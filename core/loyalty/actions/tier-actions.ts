'use server'

import { z } from 'zod'
import { getUserContext, logSecurityEvent } from '@/core/auth/actions/auth-helpers'
import {
  createLoyaltyTier,
  updateLoyaltyTier,
  deleteLoyaltyTier
} from '../dal/mutations'
import { getLoyaltyTiers } from '../dal/queries'
import { checkLoyaltyAdminPermission, invalidateLoyaltyCache } from './loyalty-helpers'
import {
  ActionResponse,
  CreateLoyaltyTierSchema,
  UpdateLoyaltyTierSchema,
  type LoyaltyTier,
  type LoyaltyTierInsert,
  type LoyaltyTierUpdate
} from '../dal/loyalty-types'

/**
 * Create loyalty tier
 */
export async function createTier(
  data: FormData | LoyaltyTierInsert
): Promise<ActionResponse<{ id: string }>> {
  // Check admin permissions
  const permissionCheck = await checkLoyaltyAdminPermission()
  if (!permissionCheck.success) {
    return permissionCheck
  }

  try {
    const rawData = data instanceof FormData
      ? {
          program_id: data.get('program_id') as string,
          name: data.get('name') as string,
          min_points: Number(data.get('min_points')),
          max_points: data.get('max_points') ? Number(data.get('max_points')) : null,
          benefits: JSON.parse(data.get('benefits') as string || '[]'),
          multiplier: Number(data.get('multiplier') || 1)
        }
      : data

    const validatedData = CreateLoyaltyTierSchema.parse(rawData)

    const tierId = await createLoyaltyTier(validatedData)

    // Log security event
    await logSecurityEvent({
      action: 'loyalty_tier_created',
      resource_id: tierId,
      details: {
        program_id: validatedData.program_id,
        name: validatedData.name
      }
    })

    // Cache Invalidation
    invalidateLoyaltyCache({ programId: validatedData.program_id })

    return {
      success: true,
      data: { id: tierId },
      message: 'Loyalty tier created successfully'
    }

  } catch (error) {
    console.error('[Server Action Error - createTier]:', error)

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
      error: error instanceof Error ? error.message : 'Failed to create tier',
      code: 'OPERATION_FAILED'
    }
  }
}

/**
 * Update loyalty tier
 */
export async function updateTier(
  id: string,
  data: FormData | LoyaltyTierUpdate
): Promise<ActionResponse<void>> {
  // Check admin permissions
  const permissionCheck = await checkLoyaltyAdminPermission()
  if (!permissionCheck.success) {
    return permissionCheck
  }

  try {
    const rawData = data instanceof FormData
      ? {
          name: data.get('name') as string | undefined,
          min_points: data.get('min_points') ? Number(data.get('min_points')) : undefined,
          max_points: data.get('max_points') ? Number(data.get('max_points')) : undefined,
          benefits: data.get('benefits') ? JSON.parse(data.get('benefits') as string) : undefined,
          multiplier: data.get('multiplier') ? Number(data.get('multiplier')) : undefined
        }
      : data

    const validatedData = UpdateLoyaltyTierSchema.parse(rawData)

    await updateLoyaltyTier(id, validatedData)

    // Log security event
    await logSecurityEvent({
      action: 'loyalty_tier_updated',
      resource_id: id,
      details: { updated_fields: Object.keys(validatedData) }
    })

    // Cache Invalidation
    invalidateLoyaltyCache({})

    return {
      success: true,
      message: 'Loyalty tier updated successfully'
    }

  } catch (error) {
    console.error('[Server Action Error - updateTier]:', error)

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
      error: error instanceof Error ? error.message : 'Failed to update tier',
      code: 'OPERATION_FAILED'
    }
  }
}

/**
 * Delete loyalty tier
 */
export async function deleteTier(
  id: string
): Promise<ActionResponse<void>> {
  // Check admin permissions
  const permissionCheck = await checkLoyaltyAdminPermission()
  if (!permissionCheck.success) {
    return permissionCheck
  }

  const { userContext } = permissionCheck
  const { user } = userContext

  try {
    await deleteLoyaltyTier(id)

    // Log security event
    await logSecurityEvent({
      action: 'loyalty_tier_deleted',
      resource_id: id,
      details: { deleted_by: user.id }
    })

    // Cache Invalidation
    invalidateLoyaltyCache({})

    return {
      success: true,
      message: 'Loyalty tier deleted successfully'
    }

  } catch (error) {
    console.error('[Server Action Error - deleteTier]:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete tier',
      code: 'OPERATION_FAILED'
    }
  }
}

/**
 * Get all tiers for a loyalty program
 */
export async function getProgramTiers(
  programId: string
): Promise<ActionResponse<LoyaltyTier[]>> {
  const userContext = await getUserContext()

  if (!userContext || 'error' in userContext) {
    return {
      success: false,
      error: 'Authentication required',
      code: 'AUTH_REQUIRED'
    }
  }

  try {
    const tiers = await getLoyaltyTiers(programId)

    return {
      success: true,
      data: tiers
    }

  } catch (error) {
    console.error('[Server Action Error - getProgramTiers]:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch tiers',
      code: 'OPERATION_FAILED'
    }
  }
}