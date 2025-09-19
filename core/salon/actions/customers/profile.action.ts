'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import {
  updateCustomerProfile,
  markCustomerAsVIP,
  removeVIPStatus
} from '../dal/customers-mutations'
import { getCustomerById } from '../dal/customers-queries'
import type { CustomerProfileUpdate } from '../dal/customers-types'
import { requireAuth, logSecurityEvent } from '@/core/auth/actions'
import { ActionResponse } from '../../validators/customer.schemas'

/**
 * Toggle customer status (active/inactive)
 */
export async function toggleCustomerStatusAction(
  customerId: string
): Promise<ActionResponse> {
  try {
    // 1. Authentication
    let authUser: any
    try {
      authUser = await requireAuth()
    } catch (error) {
      return {
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      }
    }

    // 2. Get current status
    const customer = await getCustomerById(customerId)
    if (!customer) {
      return {
        success: false,
        error: 'Customer not found',
        code: 'NOT_FOUND'
      }
    }

    // 3. Toggle status
    const newStatus = !customer.is_active
    const updated = await updateCustomerProfile(customerId, {
      is_active: newStatus
    } as CustomerProfileUpdate)

    // 4. Log security event
    await logSecurityEvent({
      action: newStatus ? 'customer.activated' : 'customer.deactivated',
      resource_type: 'customer',
      resource_id: customerId,
      details: {
        updated_by: authUser.user.id
      }
    })

    // 5. Invalidate cache
    revalidatePath('/dashboard/customers')
    revalidateTag(`customer-${customerId}`)

    return {
      success: true,
      data: updated,
      message: `Customer ${newStatus ? 'activated' : 'deactivated'} successfully`
    }

  } catch (error) {
    console.error('[Server Action Error - toggleStatus]:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to toggle status',
      code: 'OPERATION_FAILED'
    }
  }
}

/**
 * Toggle VIP status
 */
export async function toggleVIPStatusAction(
  customerId: string
): Promise<ActionResponse> {
  try {
    // 1. Authentication
    let authUser: any
    try {
      authUser = await requireAuth()
    } catch (error) {
      return {
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      }
    }

    // 2. Get current status
    const customer = await getCustomerById(customerId)
    if (!customer) {
      return {
        success: false,
        error: 'Customer not found',
        code: 'NOT_FOUND'
      }
    }

    // 3. Toggle VIP status
    const isVIP = customer.is_vip || false
    const updated = isVIP
      ? await removeVIPStatus(customerId)
      : await markCustomerAsVIP(customerId)

    // 4. Log security event
    await logSecurityEvent({
      action: isVIP ? 'customer.vip_removed' : 'customer.vip_added',
      resource_type: 'customer',
      resource_id: customerId,
      details: {
        updated_by: authUser.user.id
      }
    })

    // 5. Invalidate cache
    revalidatePath('/dashboard/customers')
    revalidateTag(`customer-${customerId}`)

    return {
      success: true,
      data: updated,
      message: `VIP status ${isVIP ? 'removed' : 'added'} successfully`
    }

  } catch (error) {
    console.error('[Server Action Error - toggleVIP]:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to toggle VIP status',
      code: 'OPERATION_FAILED'
    }
  }
}