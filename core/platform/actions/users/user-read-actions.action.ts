'use server'

import { getUserById, getUserRole } from '../dal/users-queries'
import { requireAuth } from '@/core/auth/actions'
import {
  ActionResponse,
  createErrorResponse,
  createSuccessResponse
} from './user-helpers'

export async function getUserByIdAction(userId: string): Promise<ActionResponse> {
  try {
    const authResult = await requireAuth()
    if ('error' in authResult) {
      return authResult
    }

    const isOwnProfile = userId === authResult.user.id
    const isAdmin = authResult.role === 'admin' || authResult.role === 'super_admin'

    if (!isOwnProfile && !isAdmin) {
      return {
        success: false,
        error: 'You do not have permission to view this user',
        code: 'PERMISSION_DENIED'
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

    const role = await getUserRole(userId)

    return createSuccessResponse({ ...user, role })

  } catch (error) {
    console.error('[Server Action Error - getUserById]:', error)
    return createErrorResponse(error, 'Failed to fetch user')
  }
}