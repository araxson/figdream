'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import {
  activateUser,
  deactivateUser,
  deleteUser
} from '../dal/users-mutations'
import { requireAdminRole, logSecurityEvent } from '@/core/auth/actions'
import {
  ActionResponse,
  createValidationErrorResponse,
  createErrorResponse
} from './user-helpers'
import { BulkOperationSchema } from './user-schemas'

export async function bulkUserOperationAction(
  userIds: string[],
  operation: 'suspend' | 'activate' | 'delete'
): Promise<ActionResponse> {
  try {
    const authResult = await requireAdminRole()
    if ('error' in authResult) {
      return authResult
    }

    const validatedData = BulkOperationSchema.parse({ userIds, operation })

    let successCount = 0
    let failCount = 0
    const errors: string[] = []

    for (const userId of validatedData.userIds) {
      try {
        if (userId === authResult.user.id) {
          failCount++
          errors.push(`Cannot ${operation} your own account`)
          continue
        }

        switch (validatedData.operation) {
          case 'suspend':
            await deactivateUser(userId)
            break
          case 'activate':
            await activateUser(userId)
            break
          case 'delete':
            if (authResult.role !== 'super_admin') {
              failCount++
              errors.push('Only super administrators can delete users')
              continue
            }
            await deleteUser(userId)
            break
        }
        successCount++
      } catch (error) {
        failCount++
        console.error(`Failed to ${operation} user ${userId}:`, error)
        errors.push(`Failed to ${operation} user ${userId}`)
      }
    }

    await logSecurityEvent({
      action: 'BULK_USER_OPERATION',
      resource_type: 'user',
      resource_id: 'multiple',
      details: {
        operation: validatedData.operation,
        userIds: validatedData.userIds,
        successCount,
        failCount,
        errors
      }
    })

    revalidatePath('/admin/users')

    if (failCount === 0) {
      return {
        success: true,
        message: `Successfully processed ${successCount} users`
      }
    }

    return {
      success: false,
      message: `Processed ${successCount} users, ${failCount} failed`,
      error: errors.join(', ')
    }

  } catch (error) {
    console.error('Error in bulk operation:', error)
    if (error instanceof z.ZodError) {
      return createValidationErrorResponse(error)
    }
    return createErrorResponse(error, 'Failed to perform bulk operation')
  }
}