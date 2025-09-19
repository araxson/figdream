'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import { getUserContext, requireSalonContext, logSecurityEvent } from '@/core/auth/actions'
import {
  enrollCustomer,
  unenrollCustomer,
  updateCustomerLoyalty
} from '../dal/mutations'
import {
  getCustomerLoyalty,
  getCustomerLoyalties
} from '../dal/queries'
import type {
  CustomerLoyalty,
  CustomerLoyaltyInsert,
  CustomerLoyaltyUpdate
} from '../dal/loyalty-types'
import { ActionResponse } from './loyalty-helpers'
import { EnrollCustomerSchema } from './loyalty-schemas'

/**
 * Enroll a customer in a loyalty program
 */
export async function enrollCustomerInProgram(
  data: FormData | { program_id: string; customer_id: string; initial_points?: number }
): Promise<ActionResponse<{ id: string }>> {
  const userContext = await getUserContext()

  if (!userContext || 'error' in userContext) {
    return {
      success: false,
      error: 'Authentication required',
      code: 'AUTH_REQUIRED'
    }
  }

  const { user } = userContext

  try {
    const rawData = data instanceof FormData
      ? {
          program_id: data.get('program_id') as string,
          customer_id: data.get('customer_id') as string,
          initial_points: data.get('initial_points') ? Number(data.get('initial_points')) : 0
        }
      : data

    const validatedData = EnrollCustomerSchema.parse(rawData)

    const existing = await getCustomerLoyalty(validatedData.program_id, validatedData.customer_id)
    if (existing) {
      return {
        success: false,
        error: 'Customer is already enrolled in this program',
        code: 'ALREADY_ENROLLED'
      }
    }

    const enrollmentData: CustomerLoyaltyInsert = {
      program_id: validatedData.program_id,
      customer_id: validatedData.customer_id,
      points_balance: validatedData.initial_points || 0,
      lifetime_points: validatedData.initial_points || 0,
      visits_count: 0,
      enrolled_at: new Date().toISOString(),
      metadata: {
        enrolled_by: user.id,
        enrollment_source: 'manual'
      }
    }

    const enrollmentId = await enrollCustomer(enrollmentData)

    await logSecurityEvent({
      action: 'customer_enrolled_loyalty',
      resource_id: enrollmentId,
      details: {
        program_id: validatedData.program_id,
        customer_id: validatedData.customer_id,
        initial_points: validatedData.initial_points
      }
    })

    revalidatePath(`/customers/${validatedData.customer_id}`)
    revalidatePath('/dashboard/loyalty')
    revalidateTag(`loyalty-customer-${validatedData.customer_id}`)

    return {
      success: true,
      data: { id: enrollmentId },
      message: 'Customer enrolled successfully'
    }

  } catch (error) {
    console.error('[Server Action Error - enrollCustomerInProgram]:', error)

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
      error: error instanceof Error ? error.message : 'Failed to enroll customer',
      code: 'OPERATION_FAILED'
    }
  }
}

/**
 * Unenroll a customer from a loyalty program
 */
export async function unenrollCustomerFromProgram(
  customerLoyaltyId: string
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

  const canUnenroll = role === 'salon_admin' || role === 'salon_manager' || role === 'platform_admin'

  if (!canUnenroll) {
    return {
      success: false,
      error: 'Permission denied',
      code: 'PERMISSION_DENIED'
    }
  }

  try {
    await unenrollCustomer(customerLoyaltyId)

    await logSecurityEvent({
      action: 'customer_unenrolled_loyalty',
      resource_id: customerLoyaltyId,
      details: {
        unenrolled_by: user.id
      }
    })

    revalidatePath('/dashboard/loyalty')
    revalidateTag(`loyalty-enrollment-${customerLoyaltyId}`)

    return {
      success: true,
      message: 'Customer unenrolled successfully'
    }

  } catch (error) {
    console.error('[Server Action Error - unenrollCustomerFromProgram]:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to unenroll customer',
      code: 'OPERATION_FAILED'
    }
  }
}

/**
 * Update customer loyalty details
 */
export async function updateCustomerLoyaltyDetails(
  customerLoyaltyId: string,
  updates: CustomerLoyaltyUpdate
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

  const canUpdate = role === 'salon_admin' || role === 'salon_manager' || role === 'platform_admin'

  if (!canUpdate) {
    return {
      success: false,
      error: 'Permission denied',
      code: 'PERMISSION_DENIED'
    }
  }

  try {
    await updateCustomerLoyalty(customerLoyaltyId, {
      ...updates,
      updated_at: new Date().toISOString(),
      metadata: {
        ...updates.metadata,
        updated_by: user.id
      }
    })

    await logSecurityEvent({
      action: 'customer_loyalty_updated',
      resource_id: customerLoyaltyId,
      details: {
        updates,
        updated_by: user.id
      }
    })

    revalidatePath('/dashboard/loyalty')
    revalidateTag(`loyalty-enrollment-${customerLoyaltyId}`)

    return {
      success: true,
      message: 'Customer loyalty updated successfully'
    }

  } catch (error) {
    console.error('[Server Action Error - updateCustomerLoyaltyDetails]:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update customer loyalty',
      code: 'OPERATION_FAILED'
    }
  }
}