import { createServerClient } from '@/lib/supabase/server'
import type { Review, ReviewSubmission, ReviewFilters, PaginationState } from '../types'

export async function getCustomerReviews(
  userId: string,
  filters: ReviewFilters = {},
  pagination: Partial<PaginationState> = {}
): Promise<{
  reviews: Review[]
  pagination: PaginationState
}> {
  const supabase = createServerClient()

  // Verify authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== userId) {
    throw new Error('Unauthorized')
  }

  const page = pagination.page || 1
  const limit = pagination.limit || 10
  const offset = (page - 1) * limit

  let query = supabase
    .from('reviews')
    .select(`
      id,
      customer_id,
      salon_id,
      appointment_id,
      staff_id,
      service_ids,
      overall_rating,
      service_rating,
      staff_rating,
      atmosphere_rating,
      cleanliness_rating,
      value_rating,
      title,
      comment,
      photos,
      is_recommended,
      is_verified,
      helpful_votes,
      total_votes,
      salon_response,
      tags,
      visit_type,
      created_at,
      updated_at,
      profiles!inner(first_name, last_name, profile_image_url),
      salons!inner(name),
      staff_profiles(profiles(first_name, last_name)),
      services!left(name)
    `, { count: 'exact' })
    .eq('customer_id', userId)

  // Apply filters
  if (filters.rating) {
    query = query.gte('overall_rating', filters.rating)
  }

  if (filters.salonId) {
    query = query.eq('salon_id', filters.salonId)
  }

  if (filters.staffId) {
    query = query.eq('staff_id', filters.staffId)
  }

  if (filters.dateRange) {
    query = query
      .gte('created_at', filters.dateRange.start.toISOString())
      .lte('created_at', filters.dateRange.end.toISOString())
  }

  if (filters.hasPhotos) {
    query = query.not('photos', 'is', null)
  }

  if (filters.isVerified !== undefined) {
    query = query.eq('is_verified', filters.isVerified)
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    throw new Error(`Failed to fetch reviews: ${error.message}`)
  }

  const reviews: Review[] = data?.map(review => ({
    id: review.id,
    customerId: review.customer_id,
    customerName: `${review.profiles?.first_name || ''} ${review.profiles?.last_name || ''}`.trim(),
    customerImageUrl: review.profiles?.profile_image_url,
    salonId: review.salon_id,
    salonName: review.salons?.name || '',
    appointmentId: review.appointment_id,
    staffId: review.staff_id,
    staffName: review.staff_profiles?.profiles
      ? `${review.staff_profiles.profiles.first_name || ''} ${review.staff_profiles.profiles.last_name || ''}`.trim()
      : undefined,
    serviceIds: review.service_ids || [],
    serviceNames: [], // TODO: Get service names from service_ids
    overallRating: review.overall_rating,
    ratings: {
      service: review.service_rating || 0,
      staff: review.staff_rating || 0,
      atmosphere: review.atmosphere_rating || 0,
      cleanliness: review.cleanliness_rating || 0,
      value: review.value_rating || 0
    },
    title: review.title,
    comment: review.comment || '',
    photos: review.photos || [],
    isRecommended: review.is_recommended,
    isVerified: review.is_verified,
    helpfulVotes: review.helpful_votes || 0,
    totalVotes: review.total_votes || 0,
    salonResponse: review.salon_response,
    tags: review.tags || [],
    visitType: review.visit_type || 'first_time',
    createdAt: new Date(review.created_at),
    updatedAt: new Date(review.updated_at)
  })) || []

  return {
    reviews,
    pagination: {
      page,
      limit,
      total: count || 0,
      hasMore: (count || 0) > offset + limit
    }
  }
}

export async function submitReview(
  userId: string,
  reviewData: ReviewSubmission
): Promise<Review> {
  const supabase = createServerClient()

  // Verify authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== userId) {
    throw new Error('Unauthorized')
  }

  // Verify appointment belongs to user and is completed
  const { data: appointment, error: appointmentError } = await supabase
    .from('appointments')
    .select('id, customer_id, status, salon_id, staff_id')
    .eq('id', reviewData.appointmentId)
    .eq('customer_id', userId)
    .eq('status', 'completed')
    .single()

  if (appointmentError || !appointment) {
    throw new Error('Appointment not found or not eligible for review')
  }

  // Check if review already exists
  const { data: existingReview } = await supabase
    .from('reviews')
    .select('id')
    .eq('appointment_id', reviewData.appointmentId)
    .eq('customer_id', userId)
    .single()

  if (existingReview) {
    throw new Error('Review already submitted for this appointment')
  }

  // Upload photos if provided
  const photoUrls: string[] = []
  if (reviewData.photos && reviewData.photos.length > 0) {
    for (const photo of reviewData.photos) {
      const fileName = `${userId}-${Date.now()}-${photo.name}`
      const filePath = `reviews/${fileName}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('review-photos')
        .upload(filePath, photo, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.warn(`Failed to upload photo: ${uploadError.message}`)
        continue
      }

      const { data: { publicUrl } } = supabase.storage
        .from('review-photos')
        .getPublicUrl(filePath)

      photoUrls.push(publicUrl)
    }
  }

  // Create review
  const { data, error } = await supabase
    .from('reviews')
    .insert({
      customer_id: userId,
      salon_id: reviewData.salonId,
      appointment_id: reviewData.appointmentId,
      staff_id: reviewData.staffId,
      service_ids: reviewData.serviceIds,
      overall_rating: reviewData.overallRating,
      service_rating: reviewData.ratings.service,
      staff_rating: reviewData.ratings.staff,
      atmosphere_rating: reviewData.ratings.atmosphere,
      cleanliness_rating: reviewData.ratings.cleanliness,
      value_rating: reviewData.ratings.value,
      title: reviewData.title,
      comment: reviewData.comment,
      photos: photoUrls,
      is_recommended: reviewData.isRecommended,
      tags: reviewData.tags,
      visit_type: 'returning', // TODO: Calculate based on appointment history
      is_verified: true // Verified because it's linked to a completed appointment
    })
    .select(`
      id,
      customer_id,
      salon_id,
      appointment_id,
      staff_id,
      service_ids,
      overall_rating,
      service_rating,
      staff_rating,
      atmosphere_rating,
      cleanliness_rating,
      value_rating,
      title,
      comment,
      photos,
      is_recommended,
      is_verified,
      helpful_votes,
      total_votes,
      salon_response,
      tags,
      visit_type,
      created_at,
      updated_at
    `)
    .single()

  if (error) {
    throw new Error(`Failed to submit review: ${error.message}`)
  }

  // Get customer and salon details for response
  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, profile_image_url')
    .eq('user_id', userId)
    .single()

  const { data: salon } = await supabase
    .from('salons')
    .select('name')
    .eq('id', reviewData.salonId)
    .single()

  const { data: staff } = reviewData.staffId ? await supabase
    .from('staff_profiles')
    .select('profiles(first_name, last_name)')
    .eq('id', reviewData.staffId)
    .single() : { data: null }

  return {
    id: data.id,
    customerId: data.customer_id,
    customerName: `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim(),
    customerImageUrl: profile?.profile_image_url,
    salonId: data.salon_id,
    salonName: salon?.name || '',
    appointmentId: data.appointment_id,
    staffId: data.staff_id,
    staffName: staff?.profiles
      ? `${staff.profiles.first_name || ''} ${staff.profiles.last_name || ''}`.trim()
      : undefined,
    serviceIds: data.service_ids || [],
    serviceNames: [], // TODO: Get service names
    overallRating: data.overall_rating,
    ratings: {
      service: data.service_rating || 0,
      staff: data.staff_rating || 0,
      atmosphere: data.atmosphere_rating || 0,
      cleanliness: data.cleanliness_rating || 0,
      value: data.value_rating || 0
    },
    title: data.title,
    comment: data.comment || '',
    photos: data.photos || [],
    isRecommended: data.is_recommended,
    isVerified: data.is_verified,
    helpfulVotes: data.helpful_votes || 0,
    totalVotes: data.total_votes || 0,
    salonResponse: data.salon_response,
    tags: data.tags || [],
    visitType: data.visit_type || 'first_time',
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  }
}

export async function updateReview(
  userId: string,
  reviewId: string,
  updates: Partial<ReviewSubmission>
): Promise<Review> {
  const supabase = createServerClient()

  // Verify authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== userId) {
    throw new Error('Unauthorized')
  }

  // Verify review belongs to user
  const { data: existingReview, error: verifyError } = await supabase
    .from('reviews')
    .select('id, customer_id')
    .eq('id', reviewId)
    .eq('customer_id', userId)
    .single()

  if (verifyError || !existingReview) {
    throw new Error('Review not found')
  }

  // Build update object
  const updateData: any = {}

  if (updates.overallRating !== undefined) {
    updateData.overall_rating = updates.overallRating
  }

  if (updates.ratings) {
    if (updates.ratings.service !== undefined) updateData.service_rating = updates.ratings.service
    if (updates.ratings.staff !== undefined) updateData.staff_rating = updates.ratings.staff
    if (updates.ratings.atmosphere !== undefined) updateData.atmosphere_rating = updates.ratings.atmosphere
    if (updates.ratings.cleanliness !== undefined) updateData.cleanliness_rating = updates.ratings.cleanliness
    if (updates.ratings.value !== undefined) updateData.value_rating = updates.ratings.value
  }

  if (updates.title !== undefined) updateData.title = updates.title
  if (updates.comment !== undefined) updateData.comment = updates.comment
  if (updates.isRecommended !== undefined) updateData.is_recommended = updates.isRecommended
  if (updates.tags !== undefined) updateData.tags = updates.tags

  updateData.updated_at = new Date().toISOString()

  // Update review
  const { data, error } = await supabase
    .from('reviews')
    .update(updateData)
    .eq('id', reviewId)
    .select(`
      id,
      customer_id,
      salon_id,
      appointment_id,
      staff_id,
      service_ids,
      overall_rating,
      service_rating,
      staff_rating,
      atmosphere_rating,
      cleanliness_rating,
      value_rating,
      title,
      comment,
      photos,
      is_recommended,
      is_verified,
      helpful_votes,
      total_votes,
      salon_response,
      tags,
      visit_type,
      created_at,
      updated_at
    `)
    .single()

  if (error) {
    throw new Error(`Failed to update review: ${error.message}`)
  }

  // Get related data for response (similar to submitReview)
  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, profile_image_url')
    .eq('user_id', userId)
    .single()

  const { data: salon } = await supabase
    .from('salons')
    .select('name')
    .eq('id', data.salon_id)
    .single()

  return {
    id: data.id,
    customerId: data.customer_id,
    customerName: `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim(),
    customerImageUrl: profile?.profile_image_url,
    salonId: data.salon_id,
    salonName: salon?.name || '',
    appointmentId: data.appointment_id,
    staffId: data.staff_id,
    staffName: undefined, // TODO: Get staff name
    serviceIds: data.service_ids || [],
    serviceNames: [], // TODO: Get service names
    overallRating: data.overall_rating,
    ratings: {
      service: data.service_rating || 0,
      staff: data.staff_rating || 0,
      atmosphere: data.atmosphere_rating || 0,
      cleanliness: data.cleanliness_rating || 0,
      value: data.value_rating || 0
    },
    title: data.title,
    comment: data.comment || '',
    photos: data.photos || [],
    isRecommended: data.is_recommended,
    isVerified: data.is_verified,
    helpfulVotes: data.helpful_votes || 0,
    totalVotes: data.total_votes || 0,
    salonResponse: data.salon_response,
    tags: data.tags || [],
    visitType: data.visit_type || 'first_time',
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  }
}

export async function deleteReview(
  userId: string,
  reviewId: string
): Promise<void> {
  const supabase = createServerClient()

  // Verify authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== userId) {
    throw new Error('Unauthorized')
  }

  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', reviewId)
    .eq('customer_id', userId)

  if (error) {
    throw new Error(`Failed to delete review: ${error.message}`)
  }
}

export async function voteOnReview(
  userId: string,
  reviewId: string,
  isHelpful: boolean
): Promise<void> {
  const supabase = createServerClient()

  // Verify authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== userId) {
    throw new Error('Unauthorized')
  }

  // Check if user already voted on this review
  const { data: existingVote } = await supabase
    .from('review_votes')
    .select('id, is_helpful')
    .eq('review_id', reviewId)
    .eq('user_id', userId)
    .single()

  if (existingVote) {
    if (existingVote.is_helpful === isHelpful) {
      // Remove vote if same vote
      const { error: deleteError } = await supabase
        .from('review_votes')
        .delete()
        .eq('id', existingVote.id)

      if (deleteError) {
        throw new Error(`Failed to remove vote: ${deleteError.message}`)
      }
    } else {
      // Update vote if different
      const { error: updateError } = await supabase
        .from('review_votes')
        .update({ is_helpful: isHelpful })
        .eq('id', existingVote.id)

      if (updateError) {
        throw new Error(`Failed to update vote: ${updateError.message}`)
      }
    }
  } else {
    // Create new vote
    const { error: insertError } = await supabase
      .from('review_votes')
      .insert({
        review_id: reviewId,
        user_id: userId,
        is_helpful: isHelpful
      })

    if (insertError) {
      throw new Error(`Failed to vote: ${insertError.message}`)
    }
  }
}

export async function getPendingReviews(userId: string): Promise<AppointmentHistoryItem[]> {
  const supabase = createServerClient()

  // Verify authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== userId) {
    throw new Error('Unauthorized')
  }

  // Get completed appointments without reviews
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      id,
      salon_id,
      staff_id,
      start_time,
      total_price,
      salons!inner(name, logo_url),
      staff_profiles(profiles(first_name, last_name)),
      appointment_services(services(name))
    `)
    .eq('customer_id', userId)
    .eq('status', 'completed')
    .not('id', 'in',
      supabase
        .from('reviews')
        .select('appointment_id')
        .eq('customer_id', userId)
    )
    .gte('start_time', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
    .order('start_time', { ascending: false })
    .limit(10)

  if (error) {
    throw new Error(`Failed to fetch pending reviews: ${error.message}`)
  }

  return data?.map(appointment => ({
    id: appointment.id,
    salonId: appointment.salon_id,
    salonName: appointment.salons?.name || '',
    salonLogoUrl: appointment.salons?.logo_url,
    services: appointment.appointment_services?.map(service => ({
      id: '', // Not needed for pending reviews
      name: service.services?.name || '',
      price: 0,
      duration: 0
    })) || [],
    staffId: appointment.staff_id,
    staffName: appointment.staff_profiles?.profiles
      ? `${appointment.staff_profiles.profiles.first_name || ''} ${appointment.staff_profiles.profiles.last_name || ''}`.trim()
      : undefined,
    date: new Date(appointment.start_time),
    time: new Date(appointment.start_time).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }),
    duration: 0,
    totalPrice: appointment.total_price,
    status: 'completed' as const,
    paymentStatus: 'paid' as const,
    canCancel: false,
    canReschedule: false,
    canReview: true,
    hasReviewed: false,
    createdAt: new Date(),
    updatedAt: new Date()
  })) || []
}