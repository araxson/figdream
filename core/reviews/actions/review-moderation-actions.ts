'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { getUserContext, logSecurityEvent } from '@/core/auth/actions/auth-helpers'
import {
  updateReviewStatus as updateReviewStatusDAL,
  markReviewAsVerified,
  markReviewAsFeatured,
  moderateReview,
  deleteReview as deleteReviewDAL
} from '../dal/reviews-mutations'
import { getReviewById } from '../dal/reviews-queries'
import type { ReviewStatus } from '../dal/reviews-types'
import { ActionResponse } from './review-schemas'

// Update review status (admin only)
export async function updateReviewStatus(
  id: string,
  status: ReviewStatus
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

  // Admin only operation
  if (role !== 'platform_admin' && role !== 'salon_admin') {
    return {
      success: false,
      error: 'Admin access required',
      code: 'PERMISSION_DENIED'
    }
  }

  try {
    await updateReviewStatusDAL(id, status)

    // Log moderation action
    await logSecurityEvent(
      'review_status_updated',
      {
        resource_id: id,
        new_status: status,
        updated_by: user.id
      }
    )

    // Cache Invalidation
    revalidatePath('/reviews')
    revalidatePath('/admin/reviews')
    revalidateTag(`review-${id}`)

    return {
      success: true,
      message: `Review ${status} successfully`
    }

  } catch (error) {
    console.error('[Server Action Error - updateReviewStatus]:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update status',
      code: 'OPERATION_FAILED'
    }
  }
}

// Toggle review featured status
export async function toggleReviewFeatured(
  id: string
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

  // Admin only operation
  if (role !== 'platform_admin' && role !== 'salon_admin') {
    return {
      success: false,
      error: 'Admin access required',
      code: 'PERMISSION_DENIED'
    }
  }

  try {
    const review = await getReviewById(id)
    if (!review) {
      return {
        success: false,
        error: 'Review not found',
        code: 'NOT_FOUND'
      }
    }

    await markReviewAsFeatured(id, !review.is_featured)

    // Log moderation action
    await logSecurityEvent(
      'review_featured_toggled',
      {
        resource_id: id,
        is_featured: !review.is_featured,
        toggled_by: user.id
      }
    )

    // Cache Invalidation
    revalidatePath('/reviews')
    revalidateTag(`review-${id}`)
    revalidateTag(`reviews-featured`)

    return {
      success: true,
      message: review.is_featured ? 'Review unfeatured' : 'Review featured'
    }

  } catch (error) {
    console.error('[Server Action Error - toggleReviewFeatured]:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to toggle featured status',
      code: 'OPERATION_FAILED'
    }
  }
}

// Mark review as verified
export async function verifyReview(
  id: string
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

  // Admin only operation
  if (role !== 'platform_admin' && role !== 'salon_admin') {
    return {
      success: false,
      error: 'Admin access required',
      code: 'PERMISSION_DENIED'
    }
  }

  try {
    await markReviewAsVerified(id, true)

    // Log verification
    await logSecurityEvent(
      'review_verified',
      {
        resource_id: id,
        verified_by: user.id
      }
    )

    // Cache Invalidation
    revalidatePath('/reviews')
    revalidateTag(`review-${id}`)
    revalidateTag(`reviews-verified`)

    return {
      success: true,
      message: 'Review verified successfully'
    }

  } catch (error) {
    console.error('[Server Action Error - verifyReview]:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to verify review',
      code: 'OPERATION_FAILED'
    }
  }
}

// Bulk delete reviews (admin only)
export async function bulkDeleteReviews(
  ids: string[]
): Promise<ActionResponse<{ deleted: number }>> {
  const userContext = await getUserContext()

  if (!userContext || 'error' in userContext) {
    return {
      success: false,
      error: 'Authentication required',
      code: 'AUTH_REQUIRED'
    }
  }

  const { user, role } = userContext

  // Admin only operation
  if (role !== 'platform_admin') {
    return {
      success: false,
      error: 'Platform admin access required',
      code: 'PERMISSION_DENIED'
    }
  }

  try {
    let deletedCount = 0

    for (const id of ids) {
      try {
        await deleteReviewDAL(id)
        deletedCount++
      } catch (error) {
        console.error(`Failed to delete review ${id}:`, error)
      }
    }

    // Log bulk operation
    await logSecurityEvent(
      'bulk_reviews_deleted',
      {
        deleted_count: deletedCount,
        total_attempted: ids.length,
        deleted_by: user.id
      }
    )

    // Cache Invalidation
    revalidatePath('/reviews')
    revalidatePath('/admin/reviews')
    revalidateTag('reviews')

    return {
      success: true,
      data: { deleted: deletedCount },
      message: `Successfully deleted ${deletedCount} of ${ids.length} reviews`
    }

  } catch (error) {
    console.error('[Server Action Error - bulkDeleteReviews]:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete reviews',
      code: 'OPERATION_FAILED'
    }
  }
}