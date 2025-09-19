'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { getUserContext, requireSalonContext, logSecurityEvent } from '@/core/auth/actions'
import {
  awardPointsForAppointment,
  addLoyaltyTransaction
} from '../dal/mutations'
import {
  getCustomerLoyalties,
  getLoyaltyTransactions
} from '../dal/queries'
import type {
  CustomerLoyalty,
  LoyaltyTransaction,
  LoyaltyTransactionInsert
} from '../dal/loyalty-types'
import { ActionResponse } from './loyalty-helpers'

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