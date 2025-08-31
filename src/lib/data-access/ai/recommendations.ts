/**
 * AI Recommendations Data Access Layer for FigDream
 * Handles AI-powered recommendation generation and tracking
 */

'use server'

import { createClient } from '@/lib/database/supabase/server'
import { getUser } from '@/lib/data-access/auth'
import type { Database } from '@/types/database'
import {
  createRecommendationRequestSchema,
  trackRecommendationInteractionSchema,
  type CreateRecommendationRequestInput,
  type TrackRecommendationInteractionInput,
} from '@/lib/validations/advanced-features-schema'

type Recommendation = Database['public']['Tables']['ai_recommendations']['Row']
type Service = Database['public']['Tables']['services']['Row']
type Staff = Database['public']['Tables']['staff']['Row']

interface RecommendationResult {
  id: string
  type: string
  item_id: string
  score: number
  reason: string
  metadata?: any
  service?: Service
  staff?: Staff
}

/**
 * Generate AI recommendations for a customer
 */
export async function generateRecommendations(
  input: CreateRecommendationRequestInput
): Promise<RecommendationResult[]> {
  const supabase = await createClient()
  const { user } = await getUser()
  
  if (!user) {
    throw new Error('Authentication required')
  }

  try {
    const validated = createRecommendationRequestSchema.parse(input)
    
    // Get customer preferences and history
    const customerData = await getCustomerData(validated.customer_id)
    
    // Generate recommendations based on type
    let recommendations: RecommendationResult[] = []
    
    switch (validated.recommendation_type) {
      case 'service':
        recommendations = await recommendServices(customerData, validated)
        break
      case 'staff':
        recommendations = await recommendStaff(customerData, validated)
        break
      case 'time_slot':
        recommendations = await recommendTimeSlots(customerData, validated)
        break
      case 'similar_service':
        recommendations = await recommendSimilarServices(customerData, validated)
        break
      case 'complementary_service':
        recommendations = await recommendComplementaryServices(customerData, validated)
        break
      case 'trending':
        recommendations = await recommendTrending(validated)
        break
      default:
        recommendations = await recommendServices(customerData, validated)
    }
    
    // Store recommendations for tracking
    if (recommendations.length > 0) {
      const { data: stored } = await supabase
        .from('ai_recommendations')
        .insert(
          recommendations.map(rec => ({
            customer_id: validated.customer_id,
            type: validated.recommendation_type,
            item_id: rec.item_id,
            score: rec.score,
            reason: rec.reason,
            context: validated.context,
            metadata: rec.metadata,
          }))
        )
        .select()
      
      if (stored) {
        // Merge stored IDs with recommendations
        recommendations = recommendations.map((rec, index) => ({
          ...rec,
          id: stored[index]?.id || rec.id,
        }))
      }
    }
    
    return recommendations.slice(0, validated.limit)
  } catch (error) {
    console.error('Error generating recommendations:', error)
    return []
  }
}

/**
 * Get customer data for recommendations
 */
async function getCustomerData(customerId: string): Promise<any> {
  const supabase = await createClient()
  
  // Get customer profile
  const { data: profile } = await supabase
    .from('customers')
    .select('*')
    .eq('id', customerId)
    .single()
  
  // Get booking history
  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      *,
      booking_services (
        service_id,
        service_name,
        price
      ),
      staff (
        id,
        first_name,
        last_name
      )
    `)
    .eq('customer_id', customerId)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(20)
  
  // Get preferences
  const { data: preferences } = await supabase
    .from('customer_preferences')
    .select('*')
    .eq('customer_id', customerId)
    .single()
  
  // Get reviews
  const { data: reviews } = await supabase
    .from('reviews')
    .select('service_id, staff_id, rating')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })
    .limit(10)
  
  return {
    profile,
    bookings: bookings || [],
    preferences: preferences || {},
    reviews: reviews || [],
  }
}

/**
 * Recommend services based on customer history
 */
async function recommendServices(
  customerData: any,
  params: CreateRecommendationRequestInput
): Promise<RecommendationResult[]> {
  const supabase = await createClient()
  const recommendations: RecommendationResult[] = []
  
  try {
    // Get frequently booked services
    const serviceFrequency: Record<string, number> = {}
    customerData.bookings.forEach((booking: any) => {
      booking.booking_services?.forEach((service: any) => {
        serviceFrequency[service.service_id] = (serviceFrequency[service.service_id] || 0) + 1
      })
    })
    
    // Get all available services
    let query = supabase
      .from('services')
      .select(`
        *,
        categories (
          name
        )
      `)
      .eq('is_active', true)
    
    if (params.salon_id) {
      query = query.eq('salon_id', params.salon_id)
    }
    
    if (params.filters?.price_min) {
      query = query.gte('price', params.filters.price_min)
    }
    
    if (params.filters?.price_max) {
      query = query.lte('price', params.filters.price_max)
    }
    
    const { data: services } = await query
    
    if (!services) return []
    
    // Score services
    services.forEach(service => {
      let score = 0
      let reasons = []
      
      // Boost score for frequently booked services
      if (serviceFrequency[service.id]) {
        score += serviceFrequency[service.id] * 10
        reasons.push('Frequently booked')
      }
      
      // Boost score for highly rated services
      const serviceReviews = customerData.reviews.filter((r: any) => r.service_id === service.id)
      if (serviceReviews.length > 0) {
        const avgRating = serviceReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / serviceReviews.length
        score += avgRating * 5
        reasons.push(`Rated ${avgRating.toFixed(1)} stars`)
      }
      
      // Boost score for services in preferred categories
      if (customerData.preferences?.preferred_categories?.includes(service.category_id)) {
        score += 15
        reasons.push('Preferred category')
      }
      
      // Add some randomness for diversity
      score += Math.random() * 5
      
      if (score > 0) {
        recommendations.push({
          id: '',
          type: 'service',
          item_id: service.id,
          score,
          reason: reasons.join(', ') || 'Recommended for you',
          service,
        })
      }
    })
    
    // Sort by score and return top recommendations
    recommendations.sort((a, b) => b.score - a.score)
    
    return recommendations
  } catch (error) {
    console.error('Error recommending services:', error)
    return []
  }
}

/**
 * Recommend staff based on customer preferences
 */
async function recommendStaff(
  customerData: any,
  params: CreateRecommendationRequestInput
): Promise<RecommendationResult[]> {
  const supabase = await createClient()
  const recommendations: RecommendationResult[] = []
  
  try {
    // Get staff frequency from bookings
    const staffFrequency: Record<string, number> = {}
    customerData.bookings.forEach((booking: any) => {
      if (booking.staff_id) {
        staffFrequency[booking.staff_id] = (staffFrequency[booking.staff_id] || 0) + 1
      }
    })
    
    // Get all available staff
    let query = supabase
      .from('staff')
      .select(`
        *,
        staff_services (
          service_id
        )
      `)
      .eq('is_active', true)
    
    if (params.salon_id) {
      query = query.eq('salon_id', params.salon_id)
    }
    
    const { data: staffList } = await query
    
    if (!staffList) return []
    
    // Score staff
    staffList.forEach(staff => {
      let score = 0
      let reasons = []
      
      // Boost score for frequently booked staff
      if (staffFrequency[staff.id]) {
        score += staffFrequency[staff.id] * 15
        reasons.push('Previously booked')
      }
      
      // Boost score for highly rated staff
      const staffReviews = customerData.reviews.filter((r: any) => r.staff_id === staff.id)
      if (staffReviews.length > 0) {
        const avgRating = staffReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / staffReviews.length
        score += avgRating * 10
        reasons.push(`Rated ${avgRating.toFixed(1)} stars`)
      }
      
      // Boost score based on overall rating
      if (staff.average_rating) {
        score += staff.average_rating * 3
        reasons.push(`${staff.average_rating.toFixed(1)} average rating`)
      }
      
      // Boost for preferred staff
      if (params.preferences?.preferred_staff?.includes(staff.id)) {
        score += 20
        reasons.push('Preferred staff')
      }
      
      if (score > 0) {
        recommendations.push({
          id: '',
          type: 'staff',
          item_id: staff.id,
          score,
          reason: reasons.join(', ') || 'Recommended staff',
          staff,
        })
      }
    })
    
    recommendations.sort((a, b) => b.score - a.score)
    
    return recommendations
  } catch (error) {
    console.error('Error recommending staff:', error)
    return []
  }
}

/**
 * Recommend optimal time slots
 */
async function recommendTimeSlots(
  customerData: any,
  params: CreateRecommendationRequestInput
): Promise<RecommendationResult[]> {
  const recommendations: RecommendationResult[] = []
  
  try {
    // Analyze booking patterns
    const timePatterns: Record<string, number> = {}
    const dayPatterns: Record<number, number> = {}
    
    customerData.bookings.forEach((booking: any) => {
      const date = new Date(booking.start_time)
      const hour = date.getHours()
      const day = date.getDay()
      
      const timeSlot = `${hour}:00`
      timePatterns[timeSlot] = (timePatterns[timeSlot] || 0) + 1
      dayPatterns[day] = (dayPatterns[day] || 0) + 1
    })
    
    // Generate recommendations for next 7 days
    const now = new Date()
    for (let i = 0; i < 7; i++) {
      const date = new Date(now)
      date.setDate(date.getDate() + i)
      const day = date.getDay()
      
      // Find preferred times for this day
      const preferredHours = Object.entries(timePatterns)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
      
      preferredHours.forEach(([time, frequency]) => {
        const hour = parseInt(time.split(':')[0])
        const score = (dayPatterns[day] || 0) * 5 + frequency * 10
        
        recommendations.push({
          id: '',
          type: 'time_slot',
          item_id: `${date.toISOString().split('T')[0]}T${time.padStart(5, '0')}`,
          score,
          reason: `Popular time based on your history`,
          metadata: {
            date: date.toISOString().split('T')[0],
            time,
            day: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day],
          },
        })
      })
    }
    
    recommendations.sort((a, b) => b.score - a.score)
    
    return recommendations.slice(0, params.limit)
  } catch (error) {
    console.error('Error recommending time slots:', error)
    return []
  }
}

/**
 * Recommend similar services
 */
async function recommendSimilarServices(
  customerData: any,
  params: CreateRecommendationRequestInput
): Promise<RecommendationResult[]> {
  const supabase = await createClient()
  
  if (!params.session_data?.current_service_id) {
    return []
  }
  
  try {
    // Get current service details
    const { data: currentService } = await supabase
      .from('services')
      .select('*, categories (name)')
      .eq('id', params.session_data.current_service_id)
      .single()
    
    if (!currentService) return []
    
    // Find similar services
    const { data: similarServices } = await supabase
      .from('services')
      .select('*, categories (name)')
      .eq('category_id', currentService.category_id)
      .neq('id', currentService.id)
      .eq('is_active', true)
      .limit(20)
    
    if (!similarServices) return []
    
    const recommendations: RecommendationResult[] = similarServices.map(service => {
      let score = 50 // Base score for same category
      
      // Boost score for similar price range
      const priceDiff = Math.abs(service.price - currentService.price)
      score -= priceDiff / 10
      
      // Boost score for similar duration
      const durationDiff = Math.abs(service.duration - currentService.duration)
      score -= durationDiff / 5
      
      return {
        id: '',
        type: 'similar_service',
        item_id: service.id,
        score,
        reason: `Similar to ${currentService.name}`,
        service,
      }
    })
    
    recommendations.sort((a, b) => b.score - a.score)
    
    return recommendations.slice(0, params.limit)
  } catch (error) {
    console.error('Error recommending similar services:', error)
    return []
  }
}

/**
 * Recommend complementary services
 */
async function recommendComplementaryServices(
  customerData: any,
  params: CreateRecommendationRequestInput
): Promise<RecommendationResult[]> {
  const supabase = await createClient()
  
  try {
    // Get frequently paired services
    const { data: pairings } = await supabase
      .from('service_pairings')
      .select(`
        paired_service_id,
        frequency,
        paired_service:services!paired_service_id (
          *,
          categories (name)
        )
      `)
      .in('service_id', params.session_data?.cart_items || [])
      .order('frequency', { ascending: false })
      .limit(20)
    
    if (!pairings || pairings.length === 0) {
      // Fallback to category-based recommendations
      return recommendServices(customerData, params)
    }
    
    const recommendations: RecommendationResult[] = pairings.map(pairing => ({
      id: '',
      type: 'complementary_service',
      item_id: pairing.paired_service_id,
      score: pairing.frequency * 10,
      reason: 'Frequently booked together',
      service: pairing.paired_service,
    }))
    
    return recommendations.slice(0, params.limit)
  } catch (error) {
    console.error('Error recommending complementary services:', error)
    return []
  }
}

/**
 * Recommend trending services
 */
async function recommendTrending(
  params: CreateRecommendationRequestInput
): Promise<RecommendationResult[]> {
  const supabase = await createClient()
  
  try {
    // Get trending services from last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const { data: trending } = await supabase
      .from('booking_services')
      .select(`
        service_id,
        count:service_id.count(),
        services!inner (
          *,
          categories (name)
        )
      `)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('count', { ascending: false })
      .limit(20)
    
    if (!trending) return []
    
    // Group and count
    const serviceCounts: Record<string, { count: number; service: any }> = {}
    trending.forEach((item: any) => {
      if (item.service_id && item.services) {
        if (!serviceCounts[item.service_id]) {
          serviceCounts[item.service_id] = { count: 0, service: item.services }
        }
        serviceCounts[item.service_id].count++
      }
    })
    
    const recommendations: RecommendationResult[] = Object.entries(serviceCounts)
      .map(([serviceId, data]) => ({
        id: '',
        type: 'trending',
        item_id: serviceId,
        score: data.count,
        reason: `Trending - ${data.count} bookings this month`,
        service: data.service,
      }))
      .sort((a, b) => b.score - a.score)
    
    return recommendations.slice(0, params.limit)
  } catch (error) {
    console.error('Error recommending trending services:', error)
    return []
  }
}

/**
 * Track recommendation interaction
 */
export async function trackRecommendationInteraction(
  input: TrackRecommendationInteractionInput
): Promise<boolean> {
  const supabase = await createClient()
  
  try {
    const validated = trackRecommendationInteractionSchema.parse(input)
    
    // Record interaction
    const { error } = await supabase
      .from('recommendation_interactions')
      .insert({
        recommendation_id: validated.recommendation_id,
        interaction_type: validated.interaction_type,
        customer_id: validated.customer_id,
        session_id: validated.session_id,
        context_data: validated.context_data,
      })
    
    if (error) {
      console.error('Error tracking recommendation interaction:', error)
      return false
    }
    
    // Update recommendation effectiveness score
    await updateRecommendationScore(validated.recommendation_id, validated.interaction_type)
    
    return true
  } catch (error) {
    console.error('Error in trackRecommendationInteraction:', error)
    return false
  }
}

/**
 * Update recommendation effectiveness score
 */
async function updateRecommendationScore(
  recommendationId: string,
  interactionType: string
): Promise<void> {
  const supabase = await createClient()
  
  // Calculate score adjustment based on interaction
  let scoreAdjustment = 0
  switch (interactionType) {
    case 'view':
      scoreAdjustment = 1
      break
    case 'click':
      scoreAdjustment = 5
      break
    case 'add_to_cart':
      scoreAdjustment = 10
      break
    case 'book':
      scoreAdjustment = 20
      break
    case 'dismiss':
      scoreAdjustment = -5
      break
    case 'dislike':
      scoreAdjustment = -10
      break
  }
  
  if (scoreAdjustment !== 0) {
    await supabase.rpc('update_recommendation_score', {
      recommendation_id: recommendationId,
      score_adjustment: scoreAdjustment,
    })
  }
}

/**
 * Get recommendation analytics
 */
export async function getRecommendationAnalytics(
  salonId?: string,
  dateRange?: { start: string; end: string }
): Promise<any> {
  const supabase = await createClient()
  
  try {
    let query = supabase
      .from('recommendation_interactions')
      .select(`
        interaction_type,
        created_at,
        recommendations:ai_recommendations (
          type,
          score
        )
      `)
    
    if (dateRange) {
      query = query
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end)
    }
    
    const { data } = await query
    
    if (!data) return null
    
    // Calculate metrics
    const metrics = {
      total_generated: data.length,
      view_rate: data.filter(d => d.interaction_type === 'view').length / data.length * 100,
      click_rate: data.filter(d => d.interaction_type === 'click').length / data.length * 100,
      conversion_rate: data.filter(d => d.interaction_type === 'book').length / data.length * 100,
      by_type: {} as Record<string, any>,
    }
    
    // Group by recommendation type
    data.forEach(item => {
      const type = item.recommendations?.type || 'unknown'
      if (!metrics.by_type[type]) {
        metrics.by_type[type] = {
          count: 0,
          clicks: 0,
          bookings: 0,
        }
      }
      metrics.by_type[type].count++
      if (item.interaction_type === 'click') metrics.by_type[type].clicks++
      if (item.interaction_type === 'book') metrics.by_type[type].bookings++
    })
    
    return metrics
  } catch (error) {
    console.error('Error getting recommendation analytics:', error)
    return null
  }
}