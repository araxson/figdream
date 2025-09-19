'use server'

import { getUsers, getUserMetrics } from '../dal/users-queries'
import type { UserFilters } from '../dal/users-types'
import { requireAuth, requireAdminRole, logSecurityEvent } from '@/core/auth/actions/auth-helpers'
import {
  ActionResponse,
  createErrorResponse,
  createSuccessResponse,
  formatCsvRow
} from './user-helpers'

export async function getUsersAction(
  filters?: UserFilters,
  page = 1,
  limit = 20
): Promise<ActionResponse> {
  try {
    const authResult = await requireAdminRole()
    if ('error' in authResult) {
      return authResult
    }

    const users = await getUsers(filters, page, limit)

    let metrics = null
    if (page === 1) {
      metrics = await getUserMetrics()
    }

    return createSuccessResponse({
      users,
      metrics,
      page,
      limit
    })

  } catch (error) {
    console.error('[Server Action Error - getUsers]:', error)
    return createErrorResponse(error, 'Failed to fetch users')
  }
}

export async function getUserStatsAction(
  userId: string
): Promise<ActionResponse<{ total_orders: number; total_spent: number; last_login: string | null }>> {
  try {
    const authResult = await requireAuth()
    if ('error' in authResult) {
      return authResult
    }

    const metrics = await getUserMetrics(userId)

    return createSuccessResponse({
      total_orders: metrics?.total_bookings || 0,
      total_spent: metrics?.total_revenue || 0,
      last_login: metrics?.last_active_at || null
    })

  } catch (error) {
    console.error('Error getting user stats:', error)
    return createErrorResponse(error, 'Failed to get user statistics')
  }
}

export async function exportUsersAction(
  filters?: UserFilters
): Promise<ActionResponse<{ csv: string }>> {
  try {
    const authResult = await requireAdminRole()
    if ('error' in authResult) {
      return authResult
    }

    const users = await getUsers(filters || {})

    const headers = ['ID', 'Email', 'Name', 'Role', 'Status', 'Created At']
    const rows = users.map(user => formatCsvRow([
      user.id,
      user.email || '',
      user.display_name || '',
      user.role || 'customer',
      user.is_active ? 'Active' : 'Inactive',
      user.created_at || ''
    ]))

    const csv = [
      formatCsvRow(headers),
      ...rows
    ].join('\n')

    await logSecurityEvent({
      action: 'USERS_EXPORTED',
      resource_type: 'user',
      resource_id: 'all',
      details: {
        count: users.length,
        filters
      }
    })

    return createSuccessResponse({ csv })

  } catch (error) {
    console.error('Error exporting users:', error)
    return createErrorResponse(error, 'Failed to export users')
  }
}