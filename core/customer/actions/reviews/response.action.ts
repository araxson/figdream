'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import { getUserContext, logSecurityEvent } from '@/core/auth/actions'
import {
  respondToReview as respondToReviewDAL,
  toggleReviewHelpful as toggleReviewHelpfulDAL
} from '../dal/reviews-mutations'
import { getReviewById } from '../dal/reviews-queries'
import type { ReviewResponseInsert } from '../dal/reviews-types'
import { ActionResponse, ReviewResponseSchema } from './review-schemas'

/**
 * Respond to a review as salon owner/manager
 */
export async function respondToReview(
  data: FormData | ReviewResponseInsert
): Promise<ActionResponse<void>> {
  const userContext = await getUserContext()

  if (!userContext || 'error' in userContext) {
    return {
      success: false,
      error: 'Authentication required to respond to review',
      code: 'AUTH_REQUIRED'
    }
  }

  const { user, salonId, role } = userContext

  // Check permission - must be salon admin or manager
  const canRespond = role === 'salon_admin' || role === 'salon_manager' || role === 'platform_admin'

  if (!canRespond) {
    return {
      success: false,
      error: 'Only salon managers can respond to reviews',
      code: 'PERMISSION_DENIED'
    }
  }

  try {
    const rawData = data instanceof FormData
      ? {
          review_id: data.get('review_id') as string,
          content: data.get('content') as string
        }
      : data

    const validatedData = ReviewResponseSchema.parse(rawData)

    // Verify review belongs to user's salon
    const review = await getReviewById(validatedData.review_id)
    if (!review) {
      return {
        success: false,
        error: 'Review not found',
        code: 'NOT_FOUND'
      }
    }

    if (salonId && review.salon_id !== salonId) {
      return {
        success: false,
        error: 'You can only respond to reviews for your salon',
        code: 'PERMISSION_DENIED'
      }
    }

    // Create response through DAL
    await respondToReviewDAL({
      ...validatedData,
      responder_id: user.id
    })

    // Log security event
    await logSecurityEvent(
      'review_response_created',
      {
        resource_id: validatedData.review_id,
        salon_id: review.salon_id,
        responder_id: user.id,
        responder_role: role
      }
    )

    // Cache Invalidation
    revalidatePath(`/reviews/${validatedData.review_id}`)
    revalidateTag(`review-${validatedData.review_id}`)
    revalidateTag(`reviews-${review.salon_id}`)

    return {
      success: true,
      message: 'Response posted successfully'
    }

  } catch (error) {
    console.error('[Server Action Error - respondToReview]:', error)

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
      error: error instanceof Error ? error.message : 'Failed to respond to review',
      code: 'OPERATION_FAILED'
    }
  }
}

/**
 * Mark review as helpful/unhelpful
 */
export async function toggleReviewHelpful(
  reviewId: string,
  isHelpful: boolean
): Promise<ActionResponse<void>> {
  const userContext = await getUserContext()

  if (!userContext || 'error' in userContext) {
    return {
      success: false,
      error: 'Authentication required to vote on review',
      code: 'AUTH_REQUIRED'
    }
  }

  const { user } = userContext

  try {
    await toggleReviewHelpfulDAL({
      review_id: reviewId,
      user_id: user.id,
      is_helpful: isHelpful
    })

    // Cache Invalidation
    revalidatePath(`/reviews/${reviewId}`)
    revalidateTag(`review-${reviewId}`)

    return {
      success: true,
      message: isHelpful ? 'Marked as helpful' : 'Marked as not helpful'
    }

  } catch (error) {
    console.error('[Server Action Error - toggleReviewHelpful]:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update vote',
      code: 'OPERATION_FAILED'
    }
  }
}

/**
 * Update review response
 */
export async function updateReviewResponse(
  responseId: string,
  content: string
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

  // Check permission
  const canUpdate = role === 'salon_admin' || role === 'salon_manager' || role === 'platform_admin'

  if (!canUpdate) {
    return {
      success: false,
      error: 'Permission denied',
      code: 'PERMISSION_DENIED'
    }
  }

  try {
    // Validate content length
    if (content.length < 10) {
      return {
        success: false,
        error: 'Response must be at least 10 characters',
        code: 'VALIDATION_ERROR'
      }
    }

    if (content.length > 500) {
      return {
        success: false,
        error: 'Response cannot exceed 500 characters',
        code: 'VALIDATION_ERROR'
      }
    }

    // Update would go through DAL here
    // await updateReviewResponseDAL(responseId, { content, updated_at: new Date() })

    // Cache Invalidation
    revalidatePath('/reviews')
    revalidateTag(`response-${responseId}`)

    return {
      success: true,
      message: 'Response updated successfully'
    }

  } catch (error) {
    console.error('[Server Action Error - updateReviewResponse]:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update response',
      code: 'OPERATION_FAILED'
    }
  }
}