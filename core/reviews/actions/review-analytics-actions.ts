'use server'

import { z } from 'zod'
import { getUserContext } from '@/core/auth/actions/auth-helpers'
import {
  getReviewsForSalon,
  getReviewsForStaff,
  getReviewsForCustomer,
  getReviewStats
} from '../dal/reviews-queries'
import type { ReviewFilters, ReviewStats, ReviewWithRelations } from '../dal/reviews-types'
import { ActionResponse, ReviewFiltersSchema } from './review-schemas'
import { parseFilterFormData } from './review-helpers'

/**
 * Get reviews with filters (READ operation)
 */
export async function getReviews(
  filters?: FormData | ReviewFilters
): Promise<ActionResponse<ReviewWithRelations[]>> {
  const userContext = await getUserContext()

  if (!userContext || 'error' in userContext) {
    return {
      success: false,
      error: 'Authentication required',
      code: 'AUTH_REQUIRED'
    }
  }

  try {
    const rawFilters = filters instanceof FormData ? parseFilterFormData(filters) : filters
    const validatedFilters = rawFilters ? ReviewFiltersSchema.parse(rawFilters) : {}

    const reviews = await getReviewsForSalon(validatedFilters)

    return {
      success: true,
      data: reviews
    }

  } catch (error) {
    console.error('[Server Action Error - getReviews]:', error)

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Invalid filter parameters',
        fieldErrors: error.flatten().fieldErrors,
        code: 'VALIDATION_ERROR'
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch reviews',
      code: 'OPERATION_FAILED'
    }
  }
}

/**
 * Get review statistics for a salon
 */
export async function getReviewStatistics(
  salonId: string
): Promise<ActionResponse<ReviewStats>> {
  const userContext = await getUserContext()

  if (!userContext || 'error' in userContext) {
    return {
      success: false,
      error: 'Authentication required',
      code: 'AUTH_REQUIRED'
    }
  }

  try {
    const stats = await getReviewStats(salonId)

    return {
      success: true,
      data: stats
    }

  } catch (error) {
    console.error('[Server Action Error - getReviewStatistics]:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch statistics',
      code: 'OPERATION_FAILED'
    }
  }
}

/**
 * Get reviews for a specific staff member
 */
export async function getStaffReviews(
  staffId: string,
  filters?: ReviewFilters
): Promise<ActionResponse<ReviewWithRelations[]>> {
  const userContext = await getUserContext()

  if (!userContext || 'error' in userContext) {
    return {
      success: false,
      error: 'Authentication required',
      code: 'AUTH_REQUIRED'
    }
  }

  try {
    const reviews = await getReviewsForStaff(staffId, filters)

    return {
      success: true,
      data: reviews
    }

  } catch (error) {
    console.error('[Server Action Error - getStaffReviews]:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch staff reviews',
      code: 'OPERATION_FAILED'
    }
  }
}

/**
 * Get reviews for a specific customer
 */
export async function getCustomerReviews(
  customerId: string,
  filters?: ReviewFilters
): Promise<ActionResponse<ReviewWithRelations[]>> {
  const userContext = await getUserContext()

  if (!userContext || 'error' in userContext) {
    return {
      success: false,
      error: 'Authentication required',
      code: 'AUTH_REQUIRED'
    }
  }

  const { user, role } = userContext

  // Check permission - customers can only see their own reviews
  if (role === 'customer' && user.id !== customerId) {
    return {
      success: false,
      error: 'You can only view your own reviews',
      code: 'PERMISSION_DENIED'
    }
  }

  try {
    const reviews = await getReviewsForCustomer(customerId, filters)

    return {
      success: true,
      data: reviews
    }

  } catch (error) {
    console.error('[Server Action Error - getCustomerReviews]:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch customer reviews',
      code: 'OPERATION_FAILED'
    }
  }
}

/**
 * Get review summary for dashboard
 */
export async function getReviewSummary(
  salonId: string,
  period: 'week' | 'month' | 'year' = 'month'
): Promise<ActionResponse<{
  stats: ReviewStats
  recentReviews: ReviewWithRelations[]
  topRatedStaff: Array<{ staff_id: string; name: string; average_rating: number; review_count: number }>
}>> {
  const userContext = await getUserContext()

  if (!userContext || 'error' in userContext) {
    return {
      success: false,
      error: 'Authentication required',
      code: 'AUTH_REQUIRED'
    }
  }

  try {
    // Get stats
    const stats = await getReviewStats(salonId)

    // Get recent reviews (last 5)
    const recentReviews = await getReviewsForSalon({
      salon_id: salonId,
      status: 'approved'
    })

    // For now, return mock data for top rated staff
    // This would be implemented in DAL
    const topRatedStaff: Array<{
      staff_id: string
      name: string
      average_rating: number
      review_count: number
    }> = []

    return {
      success: true,
      data: {
        stats,
        recentReviews: recentReviews.slice(0, 5),
        topRatedStaff
      }
    }

  } catch (error) {
    console.error('[Server Action Error - getReviewSummary]:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch review summary',
      code: 'OPERATION_FAILED'
    }
  }
}