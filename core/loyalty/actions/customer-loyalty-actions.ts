'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import { getUserContext, requireSalonContext, logSecurityEvent } from '@/core/auth/actions/auth-helpers'
import {
  enrollCustomer,
  unenrollCustomer,
  updateCustomerLoyalty,
  awardPointsForAppointment,
  addLoyaltyTransaction
} from '../dal/mutations'
import {
  getCustomerLoyalty,
  getCustomerLoyalties,
  getLoyaltyTransactions
} from '../dal/queries'
import type {
  CustomerLoyalty,
  CustomerLoyaltyInsert,
  CustomerLoyaltyUpdate,
  LoyaltyTransaction,
  LoyaltyTransactionInsert
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
export async function updateCustomerLoyaltyAction(
  id: string,
  data: CustomerLoyaltyUpdate
): Promise<ActionResponse<CustomerLoyalty>> {
  try {
    const { userId, salonId } = await requireSalonContext()

    const result = await updateCustomerLoyalty(id, data)

    await logSecurityEvent({
      userId,
      salonId,
      action: 'update_customer_loyalty',
      resourceType: 'customer_loyalty',
      resourceId: id,
      details: { updatedFields: Object.keys(data) }
    })

    revalidatePath('/dashboard/loyalty')

    return {
      success: true,
      data: result,
      message: 'Customer loyalty updated successfully'
    }
  } catch (error) {
    console.error('[Server Action Error - updateCustomerLoyalty]:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update customer loyalty',
      code: 'OPERATION_FAILED'
    }
  }
}

/**
 * Award points for appointment completion
 */
export async function awardPointsForAppointmentAction(
  appointmentId: string,
  customerId: string,
  salonId: string,
  amount: number
): Promise<ActionResponse<LoyaltyTransaction | null>> {
  try {
    const { userId } = await requireSalonContext()

    const result = await awardPointsForAppointment(appointmentId, customerId, salonId, amount)

    if (result) {
      await logSecurityEvent({
        userId,
        salonId,
        action: 'award_loyalty_points',
        resourceType: 'appointment',
        resourceId: appointmentId,
        details: { points: result.points_amount, customerId }
      })

      revalidatePath('/dashboard/loyalty')
      revalidateTag(`loyalty-customer-${customerId}`)
    }

    return {
      success: true,
      data: result,
      message: result ? `Awarded ${result.points_amount} points` : 'No points awarded'
    }
  } catch (error) {
    console.error('[Server Action Error - awardPointsForAppointment]:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to award points',
      code: 'OPERATION_FAILED'
    }
  }
}

/**
 * Get customer loyalty information
 */
export async function getCustomerLoyaltyInfo(
  customerId: string
): Promise<ActionResponse<CustomerLoyalty[]>> {
  const userContext = await getUserContext()

  if (!userContext || 'error' in userContext) {
    return {
      success: false,
      error: 'Authentication required',
      code: 'AUTH_REQUIRED'
    }
  }

  try {
    const loyalties = await getCustomerLoyalties(customerId)

    return {
      success: true,
      data: loyalties
    }

  } catch (error) {
    console.error('[Server Action Error - getCustomerLoyaltyInfo]:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch loyalty information',
      code: 'OPERATION_FAILED'
    }
  }
}

/**
 * Get customer transaction history
 */
export async function getCustomerTransactionHistory(
  customerLoyaltyId: string,
  filters?: { limit?: number; offset?: number }
): Promise<ActionResponse<LoyaltyTransaction[]>> {
  const userContext = await getUserContext()

  if (!userContext || 'error' in userContext) {
    return {
      success: false,
      error: 'Authentication required',
      code: 'AUTH_REQUIRED'
    }
  }

  try {
    const transactions = await getLoyaltyTransactions(customerLoyaltyId, filters)

    return {
      success: true,
      data: transactions
    }

  } catch (error) {
    console.error('[Server Action Error - getCustomerTransactionHistory]:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch transactions',
      code: 'OPERATION_FAILED'
    }
  }
}

/**
 * Add a loyalty transaction
 */
export async function addLoyaltyTransactionAction(
  data: LoyaltyTransactionInsert
): Promise<ActionResponse<LoyaltyTransaction>> {
  try {
    const { userId, salonId } = await requireSalonContext()

    const result = await addLoyaltyTransaction(data)

    await logSecurityEvent({
      userId,
      salonId,
      action: 'add_loyalty_transaction',
      resourceType: 'loyalty_transaction',
      resourceId: result.id,
      details: { type: data.transaction_type, amount: data.points_amount }
    })

    revalidatePath('/dashboard/loyalty')

    return {
      success: true,
      data: result,
      message: 'Transaction added successfully'
    }
  } catch (error) {
    console.error('[Server Action Error - addLoyaltyTransaction]:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add transaction',
      code: 'OPERATION_FAILED'
    }
  }
}