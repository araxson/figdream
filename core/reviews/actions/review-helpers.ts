'use server'

import type { ReviewInsert, ReviewUpdate } from '../dal/reviews-types'

/**
 * Calculate word count for review content
 */
export function calculateWordCount(content: string | undefined): number {
  if (!content) return 0
  return content.split(/\s+/).filter(word => word.length > 0).length
}

/**
 * Prepare review data for insertion
 */
export function prepareReviewData(
  validatedData: any,
  userId: string
): ReviewInsert {
  const wordCount = calculateWordCount(validatedData.content)

  return {
    ...validatedData,
    customer_id: userId,
    is_verified: true, // Mark as verified since user is authenticated
    is_featured: false,
    helpful_count: 0,
    status: 'pending', // Start with pending for moderation
    word_count: wordCount,
    metadata: {
      user_agent: 'server-action',
      submitted_at: new Date().toISOString(),
      is_anonymous: validatedData.is_anonymous || false
    }
  }
}

/**
 * Parse FormData for review creation
 */
export function parseReviewFormData(data: FormData): Record<string, any> {
  return {
    salon_id: data.get('salon_id') as string,
    appointment_id: data.get('appointment_id') as string,
    staff_id: data.get('staff_id') as string | undefined,
    overall_rating: Number(data.get('overall_rating')),
    service_rating: data.get('service_rating') ? Number(data.get('service_rating')) : undefined,
    staff_rating: data.get('staff_rating') ? Number(data.get('staff_rating')) : undefined,
    ambiance_rating: data.get('ambiance_rating') ? Number(data.get('ambiance_rating')) : undefined,
    cleanliness_rating: data.get('cleanliness_rating') ? Number(data.get('cleanliness_rating')) : undefined,
    value_rating: data.get('value_rating') ? Number(data.get('value_rating')) : undefined,
    title: data.get('title') as string | undefined,
    content: data.get('content') as string | undefined,
    photos: data.get('photos') ? JSON.parse(data.get('photos') as string) : undefined,
    is_anonymous: data.get('is_anonymous') === 'true'
  }
}

/**
 * Parse FormData for review update
 */
export function parseUpdateFormData(data: FormData): Record<string, any> {
  return {
    overall_rating: data.get('overall_rating') ? Number(data.get('overall_rating')) : undefined,
    service_rating: data.get('service_rating') ? Number(data.get('service_rating')) : undefined,
    staff_rating: data.get('staff_rating') ? Number(data.get('staff_rating')) : undefined,
    ambiance_rating: data.get('ambiance_rating') ? Number(data.get('ambiance_rating')) : undefined,
    cleanliness_rating: data.get('cleanliness_rating') ? Number(data.get('cleanliness_rating')) : undefined,
    value_rating: data.get('value_rating') ? Number(data.get('value_rating')) : undefined,
    title: data.get('title') as string | undefined,
    content: data.get('content') as string | undefined,
    photos: data.get('photos') ? JSON.parse(data.get('photos') as string) : undefined
  }
}

/**
 * Parse FormData for review filters
 */
export function parseFilterFormData(data: FormData): Record<string, any> {
  return {
    salon_id: data.get('salon_id') as string | undefined,
    staff_id: data.get('staff_id') as string | undefined,
    customer_id: data.get('customer_id') as string | undefined,
    min_rating: data.get('min_rating') ? Number(data.get('min_rating')) : undefined,
    has_response: data.get('has_response') === 'true',
    is_featured: data.get('is_featured') === 'true',
    is_verified: data.get('is_verified') === 'true',
    status: data.get('status') as string | undefined,
    search: data.get('search') as string | undefined,
    start_date: data.get('start_date') as string | undefined,
    end_date: data.get('end_date') as string | undefined
  }
}