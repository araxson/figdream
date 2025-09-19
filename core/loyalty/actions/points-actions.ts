'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import { getUserContext, requireSalonContext, logSecurityEvent } from '@/core/auth/actions/auth-helpers'
import {
  addPoints,
  adjustPoints,
  awardPointsForAppointment,
  addLoyaltyTransaction
} from '../dal/mutations'
import { calculatePointsForPurchase } from '../dal/queries'
import type { LoyaltyTransaction, LoyaltyTransactionInsert } from '../dal/loyalty-types'
import { ActionResponse } from './loyalty-helpers'
import { AddPointsSchema, AdjustPointsSchema } from './loyalty-schemas'

/**
 * Add loyalty points to customer
 */
export async function addLoyaltyPoints(
  data: FormData | {
    customer_loyalty_id: string;
    points: number;
    description: string;
    appointment_id?: string;
    reference_id?: string;
    reference_type?: string;
    expires_at?: string;
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
          appointment_id: data.get('appointment_id') as string | undefined,
          reference_id: data.get('reference_id') as string | undefined,
          reference_type: data.get('reference_type') as string | undefined,
          expires_at: data.get('expires_at') as string | undefined
        }
      : data

    const validatedData = AddPointsSchema.parse(rawData)

    const newBalance = await addPoints(
      validatedData.customer_loyalty_id,
      validatedData.points,
      validatedData.description,
      {
        appointment_id: validatedData.appointment_id,
        reference_id: validatedData.reference_id,
        reference_type: validatedData.reference_type,
        expires_at: validatedData.expires_at,
        added_by: user.id
      }
    )

    await logSecurityEvent({
      action: 'loyalty_points_added',
      details: {
        customer_loyalty_id: validatedData.customer_loyalty_id,
        points: validatedData.points,
        new_balance: newBalance
      }
    })

    revalidatePath('/dashboard/loyalty')
    revalidateTag(`loyalty-customer-${validatedData.customer_loyalty_id}`)

    return {
      success: true,
      data: { new_balance: newBalance },
      message: `${validatedData.points} points added successfully`
    }

  } catch (error) {
    console.error('[Server Action Error - addLoyaltyPoints]:', error)

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
      error: error instanceof Error ? error.message : 'Failed to add points',
      code: 'OPERATION_FAILED'
    }
  }
}

/**
 * Award points for appointment
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
 * Adjust points manually with reason
 */
export async function adjustPointsAction(
  customerLoyaltyId: string,
  points: number,
  description: string
): Promise<ActionResponse<LoyaltyTransaction>> {
  try {
    const { userId, salonId } = await requireSalonContext()

    const validatedData = AdjustPointsSchema.parse({
      customer_loyalty_id: customerLoyaltyId,
      points,
      description
    })

    const result = await adjustPoints(
      validatedData.customer_loyalty_id,
      validatedData.points,
      validatedData.description
    )

    await logSecurityEvent({
      userId,
      salonId,
      action: 'adjust_loyalty_points',
      resourceType: 'customer_loyalty',
      resourceId: validatedData.customer_loyalty_id,
      details: { points: validatedData.points, reason: validatedData.description }
    })

    revalidatePath('/dashboard/loyalty')

    return {
      success: true,
      data: result,
      message: validatedData.points > 0
        ? `Added ${validatedData.points} points`
        : `Removed ${Math.abs(validatedData.points)} points`
    }
  } catch (error) {
    console.error('[Server Action Error - adjustPoints]:', error)

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
      error: error instanceof Error ? error.message : 'Failed to adjust points',
      code: 'OPERATION_FAILED'
    }
  }
}

/**
 * Add a generic loyalty transaction
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

/**
 * Calculate points for purchase amount
 */
export async function calculatePurchasePoints(
  programId: string,
  amount: number
): Promise<ActionResponse<{ points: number }>> {
  const userContext = await getUserContext()

  if (!userContext || 'error' in userContext) {
    return {
      success: false,
      error: 'Authentication required',
      code: 'AUTH_REQUIRED'
    }
  }

  try {
    const points = await calculatePointsForPurchase(programId, amount)

    return {
      success: true,
      data: { points }
    }
  } catch (error) {
    console.error('[Server Action Error - calculatePurchasePoints]:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to calculate points',
      code: 'OPERATION_FAILED'
    }
  }
}