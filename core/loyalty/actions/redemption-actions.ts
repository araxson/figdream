'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import { getUserContext, logSecurityEvent } from '@/core/auth/actions/auth-helpers'
import { redeemPoints } from '../dal/mutations'
import { getCustomerRewards } from '../dal/queries'
import type { LoyaltyTransaction } from '../dal/loyalty-types'
import { ActionResponse } from './loyalty-helpers'
import { RedeemPointsSchema } from './loyalty-schemas'

/**
 * Redeem loyalty points for rewards
 */
export async function redeemLoyaltyPoints(
  data: FormData | {
    customer_loyalty_id: string;
    points: number;
    description: string;
    reward_id?: string;
    appointment_id?: string;
  }
): Promise<ActionResponse<{ new_balance: number }>> {
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
          customer_loyalty_id: data.get('customer_loyalty_id') as string,
          points: Number(data.get('points')),
          description: data.get('description') as string,
          reward_id: data.get('reward_id') as string | undefined,
          appointment_id: data.get('appointment_id') as string | undefined
        }
      : data

    const validatedData = RedeemPointsSchema.parse(rawData)

    const newBalance = await redeemPoints(
      validatedData.customer_loyalty_id,
      validatedData.points,
      validatedData.description,
      {
        reward_id: validatedData.reward_id,
        appointment_id: validatedData.appointment_id,
        redeemed_by: user.id
      }
    )

    await logSecurityEvent({
      action: 'loyalty_points_redeemed',
      details: {
        customer_loyalty_id: validatedData.customer_loyalty_id,
        points: validatedData.points,
        new_balance: newBalance,
        reward_id: validatedData.reward_id
      }
    })

    revalidatePath('/dashboard/loyalty')
    revalidatePath('/customer/loyalty')
    revalidateTag(`loyalty-customer-${validatedData.customer_loyalty_id}`)

    return {
      success: true,
      data: { new_balance: newBalance },
      message: `${validatedData.points} points redeemed successfully`
    }

  } catch (error) {
    console.error('[Server Action Error - redeemLoyaltyPoints]:', error)

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
      error: error instanceof Error ? error.message : 'Failed to redeem points',
      code: 'OPERATION_FAILED'
    }
  }
}

/**
 * Get available rewards for a customer
 */
export async function getAvailableRewards(
  customerLoyaltyId: string
): Promise<ActionResponse<any[]>> {
  const userContext = await getUserContext()

  if (!userContext || 'error' in userContext) {
    return {
      success: false,
      error: 'Authentication required',
      code: 'AUTH_REQUIRED'
    }
  }

  try {
    const rewards = await getCustomerRewards(customerLoyaltyId)

    return {
      success: true,
      data: rewards
    }

  } catch (error) {
    console.error('[Server Action Error - getAvailableRewards]:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch rewards',
      code: 'OPERATION_FAILED'
    }
  }
}

/**
 * Apply a reward to an appointment
 */
export async function applyRewardToAppointment(
  data: {
    customer_loyalty_id: string;
    reward_id: string;
    appointment_id: string;
    points_required: number;
  }
): Promise<ActionResponse<{ new_balance: number }>> {
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
    const newBalance = await redeemPoints(
      data.customer_loyalty_id,
      data.points_required,
      `Reward applied to appointment`,
      {
        reward_id: data.reward_id,
        appointment_id: data.appointment_id,
        redeemed_by: user.id
      }
    )

    await logSecurityEvent({
      action: 'loyalty_reward_applied',
      details: {
        customer_loyalty_id: data.customer_loyalty_id,
        reward_id: data.reward_id,
        appointment_id: data.appointment_id,
        points_used: data.points_required,
        new_balance: newBalance
      }
    })

    revalidatePath(`/appointments/${data.appointment_id}`)
    revalidatePath('/dashboard/loyalty')
    revalidateTag(`loyalty-customer-${data.customer_loyalty_id}`)
    revalidateTag(`appointment-${data.appointment_id}`)

    return {
      success: true,
      data: { new_balance: newBalance },
      message: 'Reward applied successfully'
    }

  } catch (error) {
    console.error('[Server Action Error - applyRewardToAppointment]:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to apply reward',
      code: 'OPERATION_FAILED'
    }
  }
}

/**
 * Cancel a redemption (admin only)
 */
export async function cancelRedemption(
  transactionId: string,
  reason: string
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

  if (role !== 'salon_admin' && role !== 'platform_admin') {
    return {
      success: false,
      error: 'Admin access required',
      code: 'PERMISSION_DENIED'
    }
  }

  try {
    await logSecurityEvent({
      action: 'loyalty_redemption_cancelled',
      details: {
        transaction_id: transactionId,
        reason,
        cancelled_by: user.id
      }
    })

    revalidatePath('/dashboard/loyalty')
    revalidateTag(`loyalty-transaction-${transactionId}`)

    return {
      success: true,
      message: 'Redemption cancelled successfully'
    }

  } catch (error) {
    console.error('[Server Action Error - cancelRedemption]:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cancel redemption',
      code: 'OPERATION_FAILED'
    }
  }
}