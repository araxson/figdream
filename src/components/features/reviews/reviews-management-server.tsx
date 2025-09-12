import { createClient } from '@/lib/supabase/server'
import { ReviewsManagementClient } from './reviews-management-client'

async function getReviewsData() {
  const supabase = await createClient()
  
  // Get reviews with full details
  const { data: reviews, error: reviewsError } = await supabase
    .from('reviews')
    .select(`
      *,
      customer:profiles!reviews_customer_id_fkey(
        id,
        full_name,
        email,
        avatar_url
      ),
      salon:salons!reviews_salon_id_fkey(
        id,
        name,
        address
      ),
      service:services!reviews_service_id_fkey(
        id,
        name
      ),
      staff:staff_profiles!reviews_staff_id_fkey(
        id,
        user_id,
        user:profiles!staff_profiles_user_id_fkey(
          full_name
        )
      )
    `)
    .order('created_at', { ascending: false })
    .limit(50)
  
  if (reviewsError) {
    console.error('Error fetching reviews:', reviewsError)
  }
  
  // Get review statistics
  const { count: totalCount } = await supabase
    .from('reviews')
    .select('*', { count: 'exact', head: true })
  
  const { count: pendingCount } = await supabase
    .from('reviews')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')
  
  const { count: approvedCount } = await supabase
    .from('reviews')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved')
  
  const { count: flaggedCount } = await supabase
    .from('reviews')
    .select('*', { count: 'exact', head: true })
    .eq('is_flagged', true)
  
  // Calculate average rating
  const { data: avgData } = await supabase
    .from('reviews')
    .select('rating')
  
  const avgRating = avgData && avgData.length > 0
    ? (avgData.reduce((sum, r) => sum + r.rating, 0) / avgData.length).toFixed(1)
    : '0.0'
  
  // Get salons for filter
  const { data: salons } = await supabase
    .from('salons')
    .select('id, name')
    .order('name')
  
  return {
    reviews: reviews || [],
    counts: {
      total: totalCount || 0,
      pending: pendingCount || 0,
      approved: approvedCount || 0,
      flagged: flaggedCount || 0,
      avgRating: parseFloat(avgRating)
    },
    salons: salons || []
  }
}

export async function ReviewsManagementServer() {
  const data = await getReviewsData()
  
  return <ReviewsManagementClient {...data} />
}