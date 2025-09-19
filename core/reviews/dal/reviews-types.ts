/**
 * Reviews Types - Based on actual database schema
 *
 * Using actual engagement.reviews table structure
 */

// Base type from actual database schema (engagement.reviews)
export interface Review {
  id: string;
  salon_id: string;
  appointment_id: string;
  customer_id: string;
  staff_id?: string;
  overall_rating: number;
  service_rating?: number;
  staff_rating?: number;
  ambiance_rating?: number;
  cleanliness_rating?: number;
  value_rating?: number;
  title?: string;
  content?: string;
  photos?: string[];
  is_verified: boolean;
  is_featured: boolean;
  helpful_count: number;
  response_content?: string;
  response_by?: string;
  response_at?: string;
  status?: string;
  published_at?: string;
  sentiment_score?: number;
  sentiment_confidence?: number;
  emotion_analysis?: Record<string, unknown>; // jsonb
  ai_generated_summary?: string;
  language_detected?: string;
  toxicity_score?: number;
  spam_probability?: number;
  moderation_flags?: Record<string, unknown>; // jsonb
  auto_moderated?: boolean;
  share_count?: number;
  bookmark_count?: number;
  word_count?: number;
  keyword_tags?: string[];
  metadata: Record<string, unknown>; // jsonb
  created_at: string;
  updated_at: string;
}

export type ReviewInsert = Omit<Review, "id" | "created_at" | "updated_at">;
export type ReviewUpdate = Partial<Omit<ReviewInsert, "customer_id" | "salon_id" | "appointment_id">>;

export interface ReviewResponse {
  id: string;
  review_id: string;
  responder_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export type ReviewResponseInsert = Omit<ReviewResponse, "id" | "created_at" | "updated_at">;
export type ReviewResponseUpdate = Partial<Omit<ReviewResponseInsert, "review_id" | "responder_id">>;

// Review votes from engagement.review_votes
export interface ReviewVote {
  id: string;
  review_id: string;
  user_id: string;
  is_helpful: boolean;
  created_at: string;
}

export type ReviewVoteInsert = Omit<ReviewVote, "id" | "created_at">;
export type ReviewVoteUpdate = Partial<Omit<ReviewVoteInsert, "review_id" | "user_id">>;

export interface ReviewVoteFilters {
  review_id?: string;
  user_id?: string;
  is_helpful?: boolean;
}

export type ReviewStatus = "pending" | "approved" | "rejected" | "flagged";

// Import base types from database
import type { Database } from '@/types/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Salon = Database['public']['Tables']['salons']['Row'];
type StaffProfile = Database['public']['Tables']['staff_profiles']['Row'];
type Service = Database['public']['Tables']['services']['Row'];

// Extended types
export interface ReviewWithRelations extends Review {
  customer?: Profile;
  salon?: Salon;
  staff?: StaffProfile; // Backward compatible alias for staff_member
  staff_member?: StaffProfile;
  service?: Service;
  response?: ReviewResponse;
  votes?: ReviewVote[];
  // Alias for backward compatibility
  rating?: number; // Maps to overall_rating
  comment?: string; // Maps to content
}

export interface ReviewFilters {
  salon_id?: string;
  staff_id?: string;
  service_id?: string;
  customer_id?: string;
  rating?: number;
  min_rating?: number;
  has_response?: boolean;
  start_date?: string;
  end_date?: string;
  search?: string;
  is_featured?: boolean;
  is_verified?: boolean;
  status?: string;
}

export interface ReviewStats {
  average_rating: number;
  total_reviews: number;
  rating_distribution: Record<number, number>;
}