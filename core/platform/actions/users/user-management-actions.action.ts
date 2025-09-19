'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import {
  updateUserRole,
  activateUser,
  deactivateUser
} from '../dal/users-mutations'
import { getUserById } from '../dal/users-queries'
import { requireAdminRole, logSecurityEvent } from '@/core/auth/actions'
import {
  ActionResponse,
  createValidationErrorResponse,
  createErrorResponse,
  createSuccessResponse
} from './user-helpers'
import { UpdateRoleSchema } from './user-schemas'

export async function updateUserRoleAction(
  userId: string,
  data: FormData | z.infer<typeof UpdateRoleSchema>
): Promise<ActionResponse> {
  try {
    const authResult = await requireAdminRole()
    if ('error' in authResult) {
      return authResult
    }

    if (userId === authResult.user.id) {
      return {
        success: false,
        error: 'You cannot change your own role',
        code: 'SELF_ROLE_CHANGE_FORBIDDEN'
      }
    }

    const rawData = data instanceof FormData ? {
      role: data.get('role'),
      reason: data.get('reason') || undefined
    } : data

    const validatedData = UpdateRoleSchema.parse(rawData)

    if (authResult.role === 'admin' && validatedData.role === 'super_admin') {
      return {
        success: false,
        error: 'Only super administrators can create other super administrators',
        code: 'INSUFFICIENT_PRIVILEGES'
      }
    }

    await updateUserRole(userId, validatedData.role)

    await logSecurityEvent({
      action: 'user.role_changed',
      resource_type: 'user',
      resource_id: userId,
      details: {
        new_role: validatedData.role,
        reason: validatedData.reason,
        changed_by: authResult.user.id
      }
    })

    revalidatePath(`/admin/users/${userId}`)
    revalidatePath('/admin/users')
    revalidateTag(`user-${userId}`)

    return createSuccessResponse(undefined, `Role updated to ${validatedData.role}`)

  } catch (error) {
    console.error('[Server Action Error - updateRole]:', error)
    if (error instanceof z.ZodError) {
      return createValidationErrorResponse(error)
    }
    return createErrorResponse(error, 'Failed to update role')
  }
}

export async function toggleUserStatusAction(userId: string): Promise<ActionResponse> {
  try {
    const authResult = await requireAdminRole()
    if ('error' in authResult) {
      return authResult
    }

    if (userId === authResult.user.id) {
      return {
        success: false,
        error: 'You cannot deactivate your own account',
        code: 'SELF_DEACTIVATE_FORBIDDEN'
      }
    }

    const user = await getUserById(userId)
    if (!user) {
      return {
        success: false,
        error: 'User not found',
        code: 'NOT_FOUND'
      }
    }

    const newStatus = !user.is_active
    if (newStatus) {
      await activateUser(userId)
    } else {
      await deactivateUser(userId)
    }

    await logSecurityEvent({
      action: newStatus ? 'user.activated' : 'user.deactivated',
      resource_type: 'user',
      resource_id: userId,
      details: {
        updated_by: authResult.user.id
      }
    })

    revalidatePath('/admin/users')
    revalidateTag(`user-${userId}`)

    return createSuccessResponse(
      undefined,
      `User ${newStatus ? 'activated' : 'deactivated'} successfully`
    )

  } catch (error) {
    console.error('[Server Action Error - toggleStatus]:', error)
    return createErrorResponse(error, 'Failed to toggle status')
  }
}

export async function suspendUserAction(
  userId: string,
  reason?: string
): Promise<ActionResponse> {
  try {
    const authResult = await requireAdminRole()
    if ('error' in authResult) {
      return authResult
    }

    await deactivateUser(userId)

    await logSecurityEvent({
      action: 'USER_SUSPENDED',
      resource_type: 'user',
      resource_id: userId,
      details: { userId, reason }
    })

    revalidatePath('/admin/users')

    return createSuccessResponse(undefined, 'User suspended successfully')

  } catch (error) {
    console.error('Error suspending user:', error)
    return createErrorResponse(error, 'Failed to suspend user')
  }
}