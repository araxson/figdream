/**
 * Reviews Queries - Using actual database tables
 *
 * Queries from reviews table (through public view)
 */

import { createClient } from "@/lib/supabase/server";
import type { Review, ReviewWithRelations, ReviewFilters, ReviewStats } from "./reviews-types";

/**
 * Get reviews with filters
 */
export async function getReviews(
  filters: ReviewFilters = {}
): Promise<ReviewWithRelations[]> {
  const supabase = await createClient();

  let query = supabase
    .from("reviews") // This queries the public view
    .select("*")
    .order("created_at", { ascending: false });

  if (filters.salon_id) {
    query = query.eq("salon_id", filters.salon_id);
  }

  if (filters.staff_id) {
    query = query.eq("staff_id", filters.staff_id);
  }

  if (filters.service_id) {
    query = query.eq("service_id", filters.service_id);
  }

  if (filters.customer_id) {
    query = query.eq("customer_id", filters.customer_id);
  }

  if (filters.rating) {
    query = query.eq("overall_rating", filters.rating);
  }

  if (filters.min_rating) {
    query = query.gte("overall_rating", filters.min_rating);
  }

  if (filters.start_date) {
    query = query.gte("created_at", filters.start_date);
  }

  if (filters.end_date) {
    query = query.lte("created_at", filters.end_date);
  }

  if (filters.search) {
    query = query.or(`content.ilike.%${filters.search}%,title.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch reviews: ${error.message}`);
  }

  return (data || []) as ReviewWithRelations[];
}

/**
 * Get featured reviews
 */
export async function getFeaturedReviews(
  salonId?: string,
  limit = 6
): Promise<ReviewWithRelations[]> {
  const supabase = await createClient();

  let query = supabase
    .from("reviews")
    .select("*")
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (salonId) {
    query = query.eq("salon_id", salonId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch featured reviews: ${error.message}`);
  }

  return (data || []) as ReviewWithRelations[];
}

/**
 * Get review by ID
 */
export async function getReviewById(
  id: string
): Promise<ReviewWithRelations | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // Not found
    }
    throw new Error(`Failed to fetch review: ${error.message}`);
  }

  return data as ReviewWithRelations;
}

/**
 * Get reviews for a salon
 */
export async function getSalonReviews(
  salonId: string,
  limit?: number
): Promise<ReviewWithRelations[]> {
  const filters: ReviewFilters = { salon_id: salonId };

  const supabase = await createClient();
  let query = supabase
    .from("reviews")
    .select("*")
    .eq("salon_id", salonId)
    .order("created_at", { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch salon reviews: ${error.message}`);
  }

  return (data || []) as ReviewWithRelations[];
}

/**
 * Get review statistics
 */
export async function getReviewStats(
  salonId?: string,
  staffId?: string
): Promise<ReviewStats> {
  const filters: ReviewFilters = {};
  if (salonId) filters.salon_id = salonId;
  if (staffId) filters.staff_id = staffId;

  const reviews = await getReviews(filters);

  const stats: ReviewStats = {
    average_rating: 0,
    total_reviews: reviews.length,
    rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  };

  if (reviews.length > 0) {
    const totalRating = reviews.reduce((sum, review) => sum + review.overall_rating, 0);
    stats.average_rating = totalRating / reviews.length;

    reviews.forEach(review => {
      stats.rating_distribution[review.overall_rating] = (stats.rating_distribution[review.overall_rating] || 0) + 1;
    });
  }

  return stats;
}

/**
 * Get review by appointment ID
 */
export async function getReviewByAppointmentId(
  appointmentId: string
): Promise<ReviewWithRelations | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("appointment_id", appointmentId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // Not found
    }
    console.warn(`Failed to fetch review by appointment: ${error.message}`);
    return null;
  }

  return data as ReviewWithRelations;
}

/**
 * Get review votes
 */
export async function getReviewVotes(
  filters: { review_id?: string; user_id?: string; is_helpful?: boolean } = {}
): Promise<any[]> {
  const supabase = await createClient();

  let query = (supabase
    .from("review_votes")
    .select("*")
    .order("created_at", { ascending: false }) as any);

  if (filters.review_id) {
    query = query.eq("review_id", filters.review_id);
  }

  if (filters.user_id) {
    query = query.eq("user_id", filters.user_id);
  }

  if (typeof filters.is_helpful === "boolean") {
    query = query.eq("is_helpful", filters.is_helpful);
  }

  const { data, error } = await query;

  if (error) {
    console.warn(`Failed to fetch review votes: ${error.message}`);
    return [];
  }

  return data || [];
}

/**
 * Get review metrics for a salon
 */
export async function getReviewMetrics(
  salonId: string
): Promise<any> {
  const stats = await getReviewStats(salonId);

  return {
    ...stats,
    response_rate: 0, // Placeholder
    response_time_hours: 0, // Placeholder
    verified_percentage: 0, // Placeholder
  };
}

/**
 * Get review insights
 */
export async function getReviewInsights(
  salonId: string
): Promise<any> {
  const reviews = await getReviews({ salon_id: salonId });

  return {
    total_reviews: reviews.length,
    average_rating: reviews.reduce((sum, r) => sum + r.overall_rating, 0) / reviews.length || 0,
    trending_topics: [], // Placeholder
    sentiment_breakdown: { positive: 0, neutral: 0, negative: 0 }, // Placeholder
    peak_review_times: [], // Placeholder
  };
}

/**
 * Get pending reviews
 */
export async function getPendingReviews(
  salonId?: string
): Promise<ReviewWithRelations[]> {
  const filters: ReviewFilters = { status: "pending" };
  if (salonId) {
    filters.salon_id = salonId;
  }

  const supabase = await createClient();
  let query = supabase
    .from("reviews")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (salonId) {
    query = query.eq("salon_id", salonId);
  }

  const { data, error } = await query;

  if (error) {
    console.warn(`Failed to fetch pending reviews: ${error.message}`);
    return [];
  }

  return (data || []) as ReviewWithRelations[];
}

// Alias functions for server actions compatibility
export async function getReviewsForSalon(
  filters: ReviewFilters = {}
): Promise<ReviewWithRelations[]> {
  return getReviews(filters);
}

export async function getReviewsForStaff(
  staffId: string,
  filters: ReviewFilters = {}
): Promise<ReviewWithRelations[]> {
  return getReviews({ ...filters, staff_id: staffId });
}

export async function getReviewsForCustomer(
  customerId: string,
  filters: ReviewFilters = {}
): Promise<ReviewWithRelations[]> {
  return getReviews({ ...filters, customer_id: customerId });
}