'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import { getUserContext, logSecurityEvent } from '@/core/auth/actions/auth-helpers'
import {
  createReview as createReviewDAL,
  updateReview as updateReviewDAL,
  deleteReview as deleteReviewDAL
} from '../dal/reviews-mutations'
import { getReviewById } from '../dal/reviews-queries'
import type { ReviewInsert, ReviewUpdate } from '../dal/reviews-types'
import { ActionResponse, CreateReviewSchema, UpdateReviewSchema } from './review-schemas'
import {
  parseReviewFormData,
  parseUpdateFormData,
  prepareReviewData,
  calculateWordCount
} from './review-helpers'

// Create a new review
export async function createReview(
  data: FormData | ReviewInsert
): Promise<ActionResponse<{ id: string }>> {
  const userContext = await getUserContext()

  if (!userContext || 'error' in userContext) {
    await logSecurityEvent(
      'create_review_unauthorized',
      { details: 'Attempted to create review without authentication' }
    )
    return {
      success: false,
      error: 'Authentication required to submit a review',
      code: 'AUTH_REQUIRED'
    }
  }

  const { user, profile } = userContext

  try {
    const rawData = data instanceof FormData ? parseReviewFormData(data) : data
    const validatedData = CreateReviewSchema.parse(rawData)
    const reviewData = prepareReviewData(validatedData, user.id)
    const reviewId = await createReviewDAL(reviewData)

    await logSecurityEvent(
      'review_created',
      {
        resource_id: reviewId,
        salon_id: validatedData.salon_id,
        appointment_id: validatedData.appointment_id,
        rating: validatedData.overall_rating
      }
    )

    revalidatePath('/reviews')
    revalidatePath(`/salons/${validatedData.salon_id}`)
    if (validatedData.staff_id) {
      revalidatePath(`/staff/${validatedData.staff_id}`)
    }
    revalidateTag(`reviews-${validatedData.salon_id}`)
    revalidateTag(`reviews-customer-${user.id}`)

    return {
      success: true,
      data: { id: reviewId },
      message: 'Thank you for your review! It will be visible after moderation.'
    }

  } catch (error) {
    console.error('[Server Action Error - createReview]:', {
      error: error instanceof Error ? error.message : error,
      userId: user.id,
      timestamp: new Date().toISOString()
    })

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
      error: error instanceof Error ? error.message : 'Failed to submit review',
      code: 'OPERATION_FAILED'
    }
  }
}

// Update an existing review
export async function updateReview(
  id: string,
  data: FormData | ReviewUpdate
): Promise<ActionResponse<void>> {
  const userContext = await getUserContext()

  if (!userContext || 'error' in userContext) {
    return {
      success: false,
      error: 'Authentication required to update review',
      code: 'AUTH_REQUIRED'
    }
  }

  const { user } = userContext

  try {
    const review = await getReviewById(id)
    if (!review) {
      return {
        success: false,
        error: 'Review not found',
        code: 'NOT_FOUND'
      }
    }

    if (review.customer_id !== user.id) {
      await logSecurityEvent(
        'update_review_unauthorized',
        {
          resource_id: id,
          details: 'User attempted to update review they do not own'
        }
      )
      return {
        success: false,
        error: 'You can only update your own reviews',
        code: 'PERMISSION_DENIED'
      }
    }

    const rawData = data instanceof FormData ? parseUpdateFormData(data) : data
    const validatedData = UpdateReviewSchema.parse(rawData)

    const updateData: any = { ...validatedData }
    if (updateData.content) {
      updateData.word_count = calculateWordCount(updateData.content)
    }

    await updateReviewDAL(id, updateData)

    revalidatePath('/reviews')
    revalidatePath(`/reviews/${id}`)
    revalidateTag(`review-${id}`)
    revalidateTag(`reviews-customer-${user.id}`)

    return {
      success: true,
      message: 'Review updated successfully'
    }

  } catch (error) {
    console.error('[Server Action Error - updateReview]:', error)

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
      error: error instanceof Error ? error.message : 'Failed to update review',
      code: 'OPERATION_FAILED'
    }
  }
}

// Delete a review
export async function deleteReview(
  id: string
): Promise<ActionResponse<void>> {
  const userContext = await getUserContext()

  if (!userContext || 'error' in userContext) {
    return {
      success: false,
      error: 'Authentication required to delete review',
      code: 'AUTH_REQUIRED'
    }
  }

  const { user, role } = userContext

  try {
    const review = await getReviewById(id)
    if (!review) {
      return {
        success: false,
        error: 'Review not found',
        code: 'NOT_FOUND'
      }
    }

    const isOwner = review.customer_id === user.id
    const isAdmin = role === 'platform_admin' || role === 'salon_admin'

    if (!isOwner && !isAdmin) {
      await logSecurityEvent(
        'delete_review_unauthorized',
        {
          resource_id: id,
          details: 'User attempted to delete review without permission'
        }
      )
      return {
        success: false,
        error: 'Permission denied',
        code: 'PERMISSION_DENIED'
      }
    }

    await deleteReviewDAL(id)

    await logSecurityEvent(
      'review_deleted',
      {
        resource_id: id,
        deleted_by: user.id,
        was_owner: isOwner
      }
    )

    revalidatePath('/reviews')
    revalidateTag(`reviews-${review.salon_id}`)
    revalidateTag(`reviews-customer-${review.customer_id}`)

    return {
      success: true,
      message: 'Review deleted successfully'
    }

  } catch (error) {
    console.error('[Server Action Error - deleteReview]:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete review',
      code: 'OPERATION_FAILED'
    }
  }
}