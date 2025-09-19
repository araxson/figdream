'use server'

import {
  getSalons,
  getSalonById,
  getSalonMetrics,
  getSalonStaff,
  getSalonServices
} from '../dal/salons-queries'
import type { SalonFilters } from '../dal/salons-types'
import type { ActionResponse } from './crud'

/**
 * Get salons with filters
 */
export async function getSalonsAction(
  filters?: SalonFilters,
  page = 1,
  limit = 20
): Promise<ActionResponse> {
  try {
    // 1. Public endpoint - no auth required for browsing
    const salons = await getSalons(filters, page, limit)

    return {
      success: true,
      data: {
        salons,
        page,
        limit
      }
    }

  } catch (error) {
    console.error('[Server Action Error - getSalons]:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch salons',
      code: 'OPERATION_FAILED'
    }
  }
}

/**
 * Get salon by ID with full details
 */
export async function getSalonByIdAction(
  salonId: string
): Promise<ActionResponse> {
  try {
    // 1. Public endpoint for basic info, auth required for sensitive data
    const salon = await getSalonById(salonId)

    if (!salon) {
      return {
        success: false,
        error: 'Salon not found',
        code: 'NOT_FOUND'
      }
    }

    // 2. Fetch additional public data
    const [staff, services, metrics] = await Promise.all([
      getSalonStaff(salonId),
      getSalonServices(salonId),
      getSalonMetrics(salonId)
    ])

    return {
      success: true,
      data: {
        ...salon,
        staff,
        services,
        metrics
      }
    }

  } catch (error) {
    console.error('[Server Action Error - getSalonById]:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch salon',
      code: 'OPERATION_FAILED'
    }
  }
}
