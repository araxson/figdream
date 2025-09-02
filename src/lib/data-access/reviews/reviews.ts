/**
 * Reviews Data Access Layer for FigDream
 * Handles all review-related database operations
 */

'use server'

import { createClient } from '@/lib/database/supabase/server'
import { getUser } from '@/lib/data-access/auth'
import type { Database } from '@/types/database.types'
import {
  createReviewSchema,
  updateReviewSchema,
  moderateReviewSchema,
  createReviewResponseSchema,
  createReviewRequestSchema,
  reviewFilterSchema,
  voteReviewSchema,
  type CreateReviewInput,
  type UpdateReviewInput,
  type ModerateReviewInput,
  type CreateReviewResponseInput,
  type CreateReviewRequestInput,
  type ReviewFilterInput,
  type VoteReviewInput,
} from '@/lib/validations/review-schema'

type Review = Database['public']['Tables']['reviews']['Row']
type ReviewInsert = Database['public']['Tables']['reviews']['Insert']
type ReviewUpdate = Database['public']['Tables']['reviews']['Update']
type ReviewResponse = Database['public']['Tables']['review_responses']['Row']
type ReviewRequest = Database['public']['Tables']['review_requests']['Row']

/**
 * Create a new review
 */
export async function createReview(input: CreateReviewInput): Promise<Review | null> {
  const supabase = await createClient()
  const { user } = await getUser()
  
  if (!user) {
    throw new Error('Authentication required')
  }

  try {
    const validated = createReviewSchema.parse(input)
    
    // Verify customer can review this salon/service
    if (validated.appointment_id) {
      const { data: appointment } = await supabase
        .from('appointments')
        .select('id, customer_id, salon_id, status')
        .eq('id', validated.appointment_id)
        .single()
      
      if (!appointment || appointment.customer_id !== user.id) {
        throw new Error('Invalid appointment or unauthorized')
      }
      
      if (appointment.status !== 'completed') {
        throw new Error('Can only review completed appointments')
      }
      
      // Check if already reviewed
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('appointment_id', validated.appointment_id)
        .single()
      
      if (existingReview) {
        throw new Error('Booking already reviewed')
      }
    }

    // Create the review
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        ...validated,
        customer_id: user.id,
        status: 'pending', // Reviews start as pending for moderation
        verified_purchase: !!validated.appointment_id,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating review:', error)
      return null
    }

    // Update salon rating statistics
    await updateSalonRatings(validated.salon_id)
    
    // Update staff rating if applicable
    if (validated.staff_id) {
      await updateStaffRatings(validated.staff_id)
    }

    // Trigger moderation check
    await checkReviewForModeration(data.id)

    return data
  } catch (error) {
    console.error('Error in createReview:', error)
    throw error
  }
}

/**
 * Update an existing review
 */
export async function updateReview(input: UpdateReviewInput): Promise<Review | null> {
  const supabase = await createClient()
  const { user } = await getUser()
  
  if (!user) {
    throw new Error('Authentication required')
  }

  try {
    const validated = updateReviewSchema.parse(input)
    const { id, ...updateData } = validated

    // Check ownership
    const { data: review } = await supabase
      .from('reviews')
      .select('customer_id, salon_id, staff_id')
      .eq('id', id)
      .single()
    
    if (!review || review.customer_id !== user.id) {
      throw new Error('Review not found or unauthorized')
    }

    // Update the review
    const { data, error } = await supabase
      .from('reviews')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
        status: 'pending', // Reset to pending for re-moderation
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating review:', error)
      return null
    }

    // Update ratings
    await updateSalonRatings(review.salon_id)
    if (review.staff_id) {
      await updateStaffRatings(review.staff_id)
    }

    return data
  } catch (error) {
    console.error('Error in updateReview:', error)
    throw error
  }
}

/**
 * Get reviews with filters
 */
export async function getReviews(filters: ReviewFilterInput): Promise<{
  reviews: Review[]
  total: number
  average_rating: number
}> {
  const supabase = await createClient()
  
  try {
    const validated = reviewFilterSchema.parse(filters)
    
    let query = supabase
      .from('reviews')
      .select(`
        *,
        customers!inner (
          first_name,
          last_name,
          avatar_url
        ),
        salons (
          name,
          logo_url
        ),
        locations (
          name
        ),
        services (
          name
        ),
        staff (
          first_name,
          last_name,
          avatar_url
        ),
        review_responses (
          *
        ),
        review_votes (
          vote_type
        )
      `, { count: 'exact' })
    
    // Apply filters
    if (validated.salon_id) {
      query = query.eq('salon_id', validated.salon_id)
    }
    
    if (validated.location_id) {
      query = query.eq('location_id', validated.location_id)
    }
    
    if (validated.service_id) {
      query = query.eq('service_id', validated.service_id)
    }
    
    if (validated.staff_id) {
      query = query.eq('staff_id', validated.staff_id)
    }
    
    if (validated.customer_id) {
      query = query.eq('customer_id', validated.customer_id)
    }
    
    if (validated.status) {
      query = query.eq('status', validated.status)
    } else {
      // Default to showing only approved reviews
      query = query.eq('status', 'approved')
    }
    
    if (validated.min_rating) {
      query = query.gte('rating', validated.min_rating)
    }
    
    if (validated.max_rating) {
      query = query.lte('rating', validated.max_rating)
    }
    
    if (validated.has_photos) {
      query = query.not('photos', 'is', null)
    }
    
    if (validated.has_response) {
      query = query.not('review_responses', 'is', null)
    }
    
    if (validated.verified_only) {
      query = query.eq('verified_purchase', true)
    }
    
    if (validated.date_from) {
      query = query.gte('created_at', validated.date_from)
    }
    
    if (validated.date_to) {
      query = query.lte('created_at', validated.date_to)
    }
    
    if (validated.search) {
      query = query.or(`title.ilike.%${validated.search}%,content.ilike.%${validated.search}%`)
    }
    
    // Apply sorting
    switch (validated.sort_by) {
      case 'date_desc':
        query = query.order('created_at', { ascending: false })
        break
      case 'date_asc':
        query = query.order('created_at', { ascending: true })
        break
      case 'rating_desc':
        query = query.order('rating', { ascending: false })
        break
      case 'rating_asc':
        query = query.order('rating', { ascending: true })
        break
      case 'helpful_desc':
        query = query.order('helpful_count', { ascending: false })
        break
      case 'verified_first':
        query = query.order('verified_purchase', { ascending: false })
        break
    }
    
    // Apply pagination
    query = query.range(validated.offset, validated.offset + validated.limit - 1)
    
    const { data, count, error } = await query
    
    if (error) {
      console.error('Error fetching reviews:', error)
      return { reviews: [], total: 0, average_rating: 0 }
    }
    
    // Calculate average rating
    const average_rating = data?.length 
      ? data.reduce((sum, r) => sum + r.rating, 0) / data.length 
      : 0
    
    return {
      reviews: data || [],
      total: count || 0,
      average_rating,
    }
  } catch (error) {
    console.error('Error in getReviews:', error)
    return { reviews: [], total: 0, average_rating: 0 }
  }
}

/**
 * Moderate a review
 */
export async function moderateReview(input: ModerateReviewInput): Promise<boolean> {
  const supabase = await createClient()
  const { user } = await getUser()
  
  if (!user) {
    throw new Error('Authentication required')
  }

  try {
    const validated = moderateReviewSchema.parse(input)
    
    // Check permissions
    const { data: review } = await supabase
      .from('reviews')
      .select('salon_id')
      .eq('id', validated.review_id)
      .single()
    
    if (!review) {
      throw new Error('Review not found')
    }
    
    const { data: salon } = await supabase
      .from('salons')
      .select('owner_id')
      .eq('id', review.salon_id)
      .single()
    
    // Get user role from user_roles table
    const { data: userRoleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('salon_id', review.salon_id)
      .single()
    
    const userRole = userRoleData?.role
    if (salon?.owner_id !== user.id && !['super_admin', 'salon_owner'].includes(userRole || '')) {
      throw new Error('Unauthorized to moderate this review')
    }
    
    // Update review status
    const status = validated.action === 'approve' ? 'approved' : 
                  validated.action === 'reject' ? 'rejected' :
                  validated.action === 'flag' ? 'flagged' : 'hidden'
    
    const { error: updateError } = await supabase
      .from('reviews')
      .update({ 
        status,
        moderated_at: new Date().toISOString(),
        moderated_by: user.id,
      })
      .eq('id', validated.review_id)
    
    if (updateError) {
      console.error('Error updating review status:', updateError)
      return false
    }
    
    // Log moderation action
    await supabase
      .from('review_moderation_log')
      .insert({
        review_id: validated.review_id,
        action: validated.action,
        reason: validated.reason,
        notes: validated.notes,
        moderated_by: user.id,
      })
    
    // Send notification if requested
    if (validated.notify_customer && validated.notification_message) {
      await notifyCustomerAboutModeration(validated.review_id, validated.notification_message)
    }
    
    // Update salon ratings if approved or rejected
    if (['approve', 'reject'].includes(validated.action)) {
      await updateSalonRatings(review.salon_id)
    }
    
    return true
  } catch (error) {
    console.error('Error in moderateReview:', error)
    throw error
  }
}

/**
 * Create a response to a review
 */
export async function createReviewResponse(input: CreateReviewResponseInput): Promise<ReviewResponse | null> {
  const supabase = await createClient()
  const { user } = await getUser()
  
  if (!user) {
    throw new Error('Authentication required')
  }

  try {
    const validated = createReviewResponseSchema.parse(input)
    
    // Check permissions
    const { data: review } = await supabase
      .from('reviews')
      .select('salon_id')
      .eq('id', validated.review_id)
      .single()
    
    if (!review) {
      throw new Error('Review not found')
    }
    
    const { data: salon } = await supabase
      .from('salons')
      .select('owner_id, name')
      .eq('id', review.salon_id)
      .single()
    
    // Get user role from user_roles table
    const { data: userRoleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('salon_id', review.salon_id)
      .single()
    
    const userRole = userRoleData?.role
    if (salon?.owner_id !== user.id && !['super_admin', 'salon_owner', 'location_manager'].includes(userRole || '')) {
      throw new Error('Unauthorized to respond to this review')
    }
    
    // Check if response already exists
    const { data: existingResponse } = await supabase
      .from('review_responses')
      .select('id')
      .eq('review_id', validated.review_id)
      .single()
    
    if (existingResponse) {
      // Update existing response
      const { data, error } = await supabase
        .from('review_responses')
        .update({
          ...validated,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingResponse.id)
        .select()
        .single()
      
      if (error) {
        console.error('Error updating review response:', error)
        return null
      }
      
      return data
    } else {
      // Create new response
      const { data, error } = await supabase
        .from('review_responses')
        .insert({
          ...validated,
          responder_id: user.id,
          respondent_name: validated.respondent_name || salon?.name,
        })
        .select()
        .single()
      
      if (error) {
        console.error('Error creating review response:', error)
        return null
      }
      
      // Notify customer about response
      await notifyCustomerAboutResponse(validated.review_id)
      
      return data
    }
  } catch (error) {
    console.error('Error in createReviewResponse:', error)
    throw error
  }
}

/**
 * Create a review request
 */
export async function createReviewRequest(input: CreateReviewRequestInput): Promise<ReviewRequest | null> {
  const supabase = await createClient()
  const { user } = await getUser()
  
  if (!user) {
    throw new Error('Authentication required')
  }

  try {
    const validated = createReviewRequestSchema.parse(input)
    
    // Verify appointment exists and is completed
    const { data: appointment } = await supabase
      .from('appointments')
      .select('status, end_time, salon_id')
      .eq('id', validated.appointment_id)
      .single()
    
    if (!appointment) {
      throw new Error('Booking not found')
    }
    
    if (appointment.status !== 'completed') {
      throw new Error('Can only request reviews for completed appointments')
    }
    
    // Check if request already exists
    const { data: existingRequest } = await supabase
      .from('review_requests')
      .select('id')
      .eq('appointment_id', validated.appointment_id)
      .single()
    
    if (existingRequest) {
      throw new Error('Review request already sent for this appointment')
    }
    
    // Calculate send time
    const sendAt = new Date(appointment.end_time)
    sendAt.setDate(sendAt.getDate() + validated.schedule_days_after)
    
    // Create review request
    const { data, error } = await supabase
      .from('review_requests')
      .insert({
        ...validated,
        status: 'scheduled',
        scheduled_at: sendAt.toISOString(),
        created_by: user.id,
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error creating review request:', error)
      return null
    }
    
    return data
  } catch (error) {
    console.error('Error in createReviewRequest:', error)
    throw error
  }
}

/**
 * Vote on review helpfulness
 */
export async function voteReview(input: VoteReviewInput): Promise<boolean> {
  const supabase = await createClient()
  
  try {
    const validated = voteReviewSchema.parse(input)
    
    // Check if already voted (by user or session)
    let existingVote = null
    
    if (validated.user_id) {
      const { data } = await supabase
        .from('review_votes')
        .select('id, vote_type')
        .eq('review_id', validated.review_id)
        .eq('user_id', validated.user_id)
        .single()
      
      existingVote = data
    } else if (validated.session_id) {
      const { data } = await supabase
        .from('review_votes')
        .select('id, vote_type')
        .eq('review_id', validated.review_id)
        .eq('session_id', validated.session_id)
        .single()
      
      existingVote = data
    }
    
    if (existingVote) {
      if (existingVote.vote_type === validated.vote_type) {
        // Remove vote if clicking same type
        await supabase
          .from('review_votes')
          .delete()
          .eq('id', existingVote.id)
      } else {
        // Update vote type
        await supabase
          .from('review_votes')
          .update({ vote_type: validated.vote_type })
          .eq('id', existingVote.id)
      }
    } else {
      // Create new vote
      await supabase
        .from('review_votes')
        .insert(validated)
    }
    
    // Update review helpful count
    await updateReviewHelpfulCount(validated.review_id)
    
    return true
  } catch (error) {
    console.error('Error in voteReview:', error)
    return false
  }
}

/**
 * Update salon rating statistics
 */
async function updateSalonRatings(salonId: string): Promise<void> {
  const supabase = await createClient()
  
  try {
    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating, service_rating, staff_rating, cleanliness_rating, value_rating')
      .eq('salon_id', salonId)
      .eq('status', 'approved')
    
    if (!reviews || reviews.length === 0) return
    
    const stats = {
      total_reviews: reviews.length,
      average_rating: reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length,
      average_service_rating: 0,
      average_staff_rating: 0,
      average_cleanliness_rating: 0,
      average_value_rating: 0,
      rating_distribution: {
        5: reviews.filter(r => r.rating === 5).length,
        4: reviews.filter(r => r.rating >= 4 && r.rating < 5).length,
        3: reviews.filter(r => r.rating >= 3 && r.rating < 4).length,
        2: reviews.filter(r => r.rating >= 2 && r.rating < 3).length,
        1: reviews.filter(r => r.rating >= 1 && r.rating < 2).length,
      },
    }
    
    // Calculate sub-ratings
    const serviceRatings = reviews.filter(r => r.service_rating).map(r => r.service_rating!)
    if (serviceRatings.length > 0) {
      stats.average_service_rating = serviceRatings.reduce((sum, r) => sum + r, 0) / serviceRatings.length
    }
    
    const staffRatings = reviews.filter(r => r.staff_rating).map(r => r.staff_rating!)
    if (staffRatings.length > 0) {
      stats.average_staff_rating = staffRatings.reduce((sum, r) => sum + r, 0) / staffRatings.length
    }
    
    const cleanlinessRatings = reviews.filter(r => r.cleanliness_rating).map(r => r.cleanliness_rating!)
    if (cleanlinessRatings.length > 0) {
      stats.average_cleanliness_rating = cleanlinessRatings.reduce((sum, r) => sum + r, 0) / cleanlinessRatings.length
    }
    
    const valueRatings = reviews.filter(r => r.value_rating).map(r => r.value_rating!)
    if (valueRatings.length > 0) {
      stats.average_value_rating = valueRatings.reduce((sum, r) => sum + r, 0) / valueRatings.length
    }
    
    // Update salon stats
    await supabase
      .from('salon_review_stats')
      .upsert({
        salon_id: salonId,
        ...stats,
        updated_at: new Date().toISOString(),
      })
  } catch (error) {
    console.error('Error updating salon ratings:', error)
  }
}

/**
 * Update staff rating statistics
 */
async function updateStaffRatings(staffId: string): Promise<void> {
  const supabase = await createClient()
  
  try {
    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating, staff_rating')
      .eq('staff_id', staffId)
      .eq('status', 'approved')
    
    if (!reviews || reviews.length === 0) return
    
    const stats = {
      total_reviews: reviews.length,
      average_rating: reviews.reduce((sum, r) => sum + (r.staff_rating || r.rating), 0) / reviews.length,
    }
    
    // Update staff stats
    await supabase
      .from('staff_profiles')
      .update({
        review_count: stats.total_reviews,
        average_rating: stats.average_rating,
      })
      .eq('id', staffId)
  } catch (error) {
    console.error('Error updating staff ratings:', error)
  }
}

/**
 * Check review for automatic moderation
 */
async function checkReviewForModeration(reviewId: string): Promise<void> {
  // This would integrate with content moderation service
  // For now, auto-approve reviews with rating >= 4 and no profanity
  const supabase = await createClient()
  
  try {
    const { data: review } = await supabase
      .from('reviews')
      .select('rating, content')
      .eq('id', reviewId)
      .single()
    
    if (!review) return
    
    // Simple auto-approval logic
    if (review.rating >= 4 && !containsProfanity(review.content)) {
      await supabase
        .from('reviews')
        .update({ 
          status: 'approved',
          moderated_at: new Date().toISOString(),
        })
        .eq('id', reviewId)
    }
  } catch (error) {
    console.error('Error checking review for moderation:', error)
  }
}

/**
 * Simple profanity check
 */
function containsProfanity(text: string): boolean {
  // Implement actual profanity detection
  const profanityList = ['spam', 'fake'] // Add actual list
  const lowerText = text.toLowerCase()
  return profanityList.some(word => lowerText.includes(word))
}

/**
 * Update review helpful count
 */
async function updateReviewHelpfulCount(reviewId: string): Promise<void> {
  const supabase = await createClient()
  
  try {
    const { count } = await supabase
      .from('review_votes')
      .select('*', { count: 'exact', head: true })
      .eq('review_id', reviewId)
      .eq('vote_type', 'helpful')
    
    await supabase
      .from('reviews')
      .update({ helpful_count: count || 0 })
      .eq('id', reviewId)
  } catch (error) {
    console.error('Error updating review helpful count:', error)
  }
}

/**
 * Notify customer about moderation
 */
async function notifyCustomerAboutModeration(reviewId: string, message: string): Promise<void> {
  // Implement notification logic
  console.log(`Notifying customer about review ${reviewId} moderation: ${message}`)
}

/**
 * Notify customer about response
 */
async function notifyCustomerAboutResponse(reviewId: string): Promise<void> {
  // Implement notification logic
  console.log(`Notifying customer about response to review ${reviewId}`)
}