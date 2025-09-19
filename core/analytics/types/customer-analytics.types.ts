import type { Json, TableDefinition, Relationship } from '@/core/shared/types/base.types'

// Customer Analytics Domain Types
export interface CustomerAnalyticsTables {
  customer_analytics: TableDefinition<
    CustomerAnalyticsRow,
    CustomerAnalyticsInsert,
    CustomerAnalyticsUpdate,
    CustomerAnalyticsRelationships
  >
  customer_favorites: TableDefinition<
    CustomerFavoritesRow,
    CustomerFavoritesInsert,
    CustomerFavoritesUpdate,
    CustomerFavoritesRelationships
  >
}

// Customer Analytics Types
export interface CustomerAnalyticsRow {
  average_booking_lead_time_hours: number | null
  average_days_between_visits: number | null
  average_rating_given: number | null
  cancellation_rate: number | null
  cancelled_appointments: number | null
  churn_risk_score: number | null
  completed_appointments: number | null
  created_at: string | null
  customer_id: string | null
  customer_lifetime_value: number | null
  customer_segment: string | null
  favorite_service_id: string | null
  favorite_staff_id: string | null
  first_visit_date: string | null
  id: string | null
  is_regular: boolean | null
  last_visit_date: string | null
  lifecycle_stage: string | null
  loyalty_points_earned: number | null
  loyalty_points_redeemed: number | null
  no_show_appointments: number | null
  no_show_rate: number | null
  preferred_booking_channel: string | null
  preferred_day_of_week: number | null
  preferred_time_slot: string | null
  referrals_made: number | null
  review_count: number | null
  salon_id: string | null
  service_preferences: Json | null
  total_appointments: number | null
  total_services: number | null
  total_visits: number | null
  updated_at: string | null
  visit_frequency_category: string | null
}

export interface CustomerAnalyticsInsert {
  average_booking_lead_time_hours?: number | null
  average_days_between_visits?: number | null
  average_rating_given?: number | null
  cancellation_rate?: number | null
  cancelled_appointments?: number | null
  churn_risk_score?: number | null
  completed_appointments?: number | null
  created_at?: string | null
  customer_id?: string | null
  customer_lifetime_value?: number | null
  customer_segment?: string | null
  favorite_service_id?: string | null
  favorite_staff_id?: string | null
  first_visit_date?: string | null
  id?: string | null
  is_regular?: boolean | null
  last_visit_date?: string | null
  lifecycle_stage?: string | null
  loyalty_points_earned?: number | null
  loyalty_points_redeemed?: number | null
  no_show_appointments?: number | null
  no_show_rate?: number | null
  preferred_booking_channel?: string | null
  preferred_day_of_week?: number | null
  preferred_time_slot?: string | null
  referrals_made?: number | null
  review_count?: number | null
  salon_id?: string | null
  service_preferences?: Json | null
  total_appointments?: number | null
  total_services?: number | null
  total_visits?: number | null
  updated_at?: string | null
  visit_frequency_category?: string | null
}

export interface CustomerAnalyticsUpdate {
  average_booking_lead_time_hours?: number | null
  average_days_between_visits?: number | null
  average_rating_given?: number | null
  cancellation_rate?: number | null
  cancelled_appointments?: number | null
  churn_risk_score?: number | null
  completed_appointments?: number | null
  created_at?: string | null
  customer_id?: string | null
  customer_lifetime_value?: number | null
  customer_segment?: string | null
  favorite_service_id?: string | null
  favorite_staff_id?: string | null
  first_visit_date?: string | null
  id?: string | null
  is_regular?: boolean | null
  last_visit_date?: string | null
  lifecycle_stage?: string | null
  loyalty_points_earned?: number | null
  loyalty_points_redeemed?: number | null
  no_show_appointments?: number | null
  no_show_rate?: number | null
  preferred_booking_channel?: string | null
  preferred_day_of_week?: number | null
  preferred_time_slot?: string | null
  referrals_made?: number | null
  review_count?: number | null
  salon_id?: string | null
  service_preferences?: Json | null
  total_appointments?: number | null
  total_services?: number | null
  total_visits?: number | null
  updated_at?: string | null
  visit_frequency_category?: string | null
}

export type CustomerAnalyticsRelationships = []

// Customer Favorites Types
export interface CustomerFavoritesRow {
  created_at: string | null
  customer_id: string | null
  id: string | null
  notes: string | null
  salon_id: string | null
  service_id: string | null
  staff_id: string | null
}

export interface CustomerFavoritesInsert {
  created_at?: string | null
  customer_id?: string | null
  id?: string | null
  notes?: string | null
  salon_id?: string | null
  service_id?: string | null
  staff_id?: string | null
}

export interface CustomerFavoritesUpdate {
  created_at?: string | null
  customer_id?: string | null
  id?: string | null
  notes?: string | null
  salon_id?: string | null
  service_id?: string | null
  staff_id?: string | null
}

export type CustomerFavoritesRelationships = []