import type { Json, TableDefinition, Relationship } from '@/core/shared/types/base.types'

// Metrics Analytics Domain Types
export interface MetricsAnalyticsTables {
  daily_metrics: TableDefinition<
    DailyMetricsRow,
    DailyMetricsInsert,
    DailyMetricsUpdate,
    DailyMetricsRelationships
  >
  monthly_metrics: TableDefinition<
    MonthlyMetricsRow,
    MonthlyMetricsInsert,
    MonthlyMetricsUpdate,
    MonthlyMetricsRelationships
  >
}

// Daily Metrics Types
export interface DailyMetricsRow {
  active_staff_count: number | null
  anomaly_score: number | null
  app_sessions: number | null
  average_lead_time_hours: number | null
  average_rating: number | null
  average_service_duration: number | null
  booking_conversion_rate: number | null
  busiest_day_of_week: number | null
  cancelled_appointments: number | null
  carbon_footprint_kg: number | null
  chair_time_minutes: number | null
  churn_risk_customers: number | null
  completed_appointments: number | null
  created_at: string | null
  cross_sell_opportunities: number | null
  customer_lifetime_value_avg: number | null
  energy_consumption_kwh: number | null
  forecast_accuracy: number | null
  gap_time_minutes: number | null
  id: string | null
  last_real_time_update: string | null
  metric_date: string | null
  new_customers: number | null
  no_show_appointments: number | null
  online_bookings: number | null
  online_review_sentiment: number | null
  peak_hour: number | null
  predicted_demand: Json | null
  real_time_updates_count: number | null
  returning_customers: number | null
  reviews_received: number | null
  salon_id: string | null
  services_performed: number | null
  social_media_mentions: number | null
  staff_utilization_rate: number | null
  streaming_metrics: Json | null
  top_service_count: number | null
  top_service_id: string | null
  total_appointments: number | null
  trend_indicators: Json | null
  updated_at: string | null
  upsell_success_rate: number | null
  walk_in_bookings: number | null
  waste_reduction_percent: number | null
  website_visits: number | null
}

export interface DailyMetricsInsert {
  active_staff_count?: number | null
  anomaly_score?: number | null
  app_sessions?: number | null
  average_lead_time_hours?: number | null
  average_rating?: number | null
  average_service_duration?: number | null
  booking_conversion_rate?: number | null
  busiest_day_of_week?: number | null
  cancelled_appointments?: number | null
  carbon_footprint_kg?: number | null
  chair_time_minutes?: number | null
  churn_risk_customers?: number | null
  completed_appointments?: number | null
  created_at?: string | null
  cross_sell_opportunities?: number | null
  customer_lifetime_value_avg?: number | null
  energy_consumption_kwh?: number | null
  forecast_accuracy?: number | null
  gap_time_minutes?: number | null
  id?: string | null
  last_real_time_update?: string | null
  metric_date?: string | null
  new_customers?: number | null
  no_show_appointments?: number | null
  online_bookings?: number | null
  online_review_sentiment?: number | null
  peak_hour?: number | null
  predicted_demand?: Json | null
  real_time_updates_count?: number | null
  returning_customers?: number | null
  reviews_received?: number | null
  salon_id?: string | null
  services_performed?: number | null
  social_media_mentions?: number | null
  staff_utilization_rate?: number | null
  streaming_metrics?: Json | null
  top_service_count?: number | null
  top_service_id?: string | null
  total_appointments?: number | null
  trend_indicators?: Json | null
  updated_at?: string | null
  upsell_success_rate?: number | null
  walk_in_bookings?: number | null
  waste_reduction_percent?: number | null
  website_visits?: number | null
}

export interface DailyMetricsUpdate {
  active_staff_count?: number | null
  anomaly_score?: number | null
  app_sessions?: number | null
  average_lead_time_hours?: number | null
  average_rating?: number | null
  average_service_duration?: number | null
  booking_conversion_rate?: number | null
  busiest_day_of_week?: number | null
  cancelled_appointments?: number | null
  carbon_footprint_kg?: number | null
  chair_time_minutes?: number | null
  churn_risk_customers?: number | null
  completed_appointments?: number | null
  created_at?: string | null
  cross_sell_opportunities?: number | null
  customer_lifetime_value_avg?: number | null
  energy_consumption_kwh?: number | null
  forecast_accuracy?: number | null
  gap_time_minutes?: number | null
  id?: string | null
  last_real_time_update?: string | null
  metric_date?: string | null
  new_customers?: number | null
  no_show_appointments?: number | null
  online_bookings?: number | null
  online_review_sentiment?: number | null
  peak_hour?: number | null
  predicted_demand?: Json | null
  real_time_updates_count?: number | null
  returning_customers?: number | null
  reviews_received?: number | null
  salon_id?: string | null
  services_performed?: number | null
  social_media_mentions?: number | null
  staff_utilization_rate?: number | null
  streaming_metrics?: Json | null
  top_service_count?: number | null
  top_service_id?: string | null
  total_appointments?: number | null
  trend_indicators?: Json | null
  updated_at?: string | null
  upsell_success_rate?: number | null
  walk_in_bookings?: number | null
  waste_reduction_percent?: number | null
  website_visits?: number | null
}

export type DailyMetricsRelationships = []

// Monthly Metrics Types
export interface MonthlyMetricsRow {
  appointment_growth_rate: number | null
  average_booking_lead_time_days: number | null
  average_rating: number | null
  average_services_per_appointment: number | null
  average_staff_count: number | null
  average_utilization_rate: number | null
  average_visits_per_customer: number | null
  cancellation_rate: number | null
  completed_appointments: number | null
  created_at: string | null
  customer_churn_rate: number | null
  customer_growth_rate: number | null
  customer_retention_rate: number | null
  id: string | null
  metric_month: number | null
  metric_year: number | null
  new_customers: number | null
  no_show_rate: number | null
  positive_review_rate: number | null
  rebook_rate: number | null
  salon_id: string | null
  same_day_booking_rate: number | null
  service_mix: Json | null
  staff_retention_rate: number | null
  total_appointments: number | null
  total_reviews: number | null
  total_services: number | null
  unique_customers: number | null
  updated_at: string | null
}

export interface MonthlyMetricsInsert {
  appointment_growth_rate?: number | null
  average_booking_lead_time_days?: number | null
  average_rating?: number | null
  average_services_per_appointment?: number | null
  average_staff_count?: number | null
  average_utilization_rate?: number | null
  average_visits_per_customer?: number | null
  cancellation_rate?: number | null
  completed_appointments?: number | null
  created_at?: string | null
  customer_churn_rate?: number | null
  customer_growth_rate?: number | null
  customer_retention_rate?: number | null
  id?: string | null
  metric_month?: number | null
  metric_year?: number | null
  new_customers?: number | null
  no_show_rate?: number | null
  positive_review_rate?: number | null
  rebook_rate?: number | null
  salon_id?: string | null
  same_day_booking_rate?: number | null
  service_mix?: Json | null
  staff_retention_rate?: number | null
  total_appointments?: number | null
  total_reviews?: number | null
  total_services?: number | null
  unique_customers?: number | null
  updated_at?: string | null
}

export interface MonthlyMetricsUpdate {
  appointment_growth_rate?: number | null
  average_booking_lead_time_days?: number | null
  average_rating?: number | null
  average_services_per_appointment?: number | null
  average_staff_count?: number | null
  average_utilization_rate?: number | null
  average_visits_per_customer?: number | null
  cancellation_rate?: number | null
  completed_appointments?: number | null
  created_at?: string | null
  customer_churn_rate?: number | null
  customer_growth_rate?: number | null
  customer_retention_rate?: number | null
  id?: string | null
  metric_month?: number | null
  metric_year?: number | null
  new_customers?: number | null
  no_show_rate?: number | null
  positive_review_rate?: number | null
  rebook_rate?: number | null
  salon_id?: string | null
  same_day_booking_rate?: number | null
  service_mix?: Json | null
  staff_retention_rate?: number | null
  total_appointments?: number | null
  total_reviews?: number | null
  total_services?: number | null
  unique_customers?: number | null
  updated_at?: string | null
}

export type MonthlyMetricsRelationships = []