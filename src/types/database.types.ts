export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]
export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      analytics_patterns: {
        Row: {
          average_bookings: number | null
          average_revenue: number | null
          average_utilization: number | null
          confidence_score: number | null
          id: string
          last_updated: string | null
          pattern_key: string
          pattern_type: string
          peak_hours: Json | null
          salon_id: string
          sample_size: number | null
        }
        Insert: {
          average_bookings?: number | null
          average_revenue?: number | null
          average_utilization?: number | null
          confidence_score?: number | null
          id?: string
          last_updated?: string | null
          pattern_key: string
          pattern_type: string
          peak_hours?: Json | null
          salon_id: string
          sample_size?: number | null
        }
        Update: {
          average_bookings?: number | null
          average_revenue?: number | null
          average_utilization?: number | null
          confidence_score?: number | null
          id?: string
          last_updated?: string | null
          pattern_key?: string
          pattern_type?: string
          peak_hours?: Json | null
          salon_id?: string
          sample_size?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_patterns_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_predictions: {
        Row: {
          accuracy_score: number | null
          actual_value: number | null
          confidence_level: number | null
          created_at: string | null
          id: string
          location_id: string | null
          model_version: string | null
          predicted_value: number
          prediction_date: string
          prediction_factors: Json | null
          prediction_hour: number | null
          prediction_type: string
          salon_id: string
          updated_at: string | null
        }
        Insert: {
          accuracy_score?: number | null
          actual_value?: number | null
          confidence_level?: number | null
          created_at?: string | null
          id?: string
          location_id?: string | null
          model_version?: string | null
          predicted_value: number
          prediction_date: string
          prediction_factors?: Json | null
          prediction_hour?: number | null
          prediction_type: string
          salon_id: string
          updated_at?: string | null
        }
        Update: {
          accuracy_score?: number | null
          actual_value?: number | null
          confidence_level?: number | null
          created_at?: string | null
          id?: string
          location_id?: string | null
          model_version?: string | null
          predicted_value?: number
          prediction_date?: string
          prediction_factors?: Json | null
          prediction_hour?: number | null
          prediction_type?: string
          salon_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_predictions_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "salon_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_predictions_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      api_usage: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          ip_address: unknown | null
          method: string
          request_size_bytes: number | null
          response_size_bytes: number | null
          response_time_ms: number | null
          salon_id: string | null
          status_code: number | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          ip_address?: unknown | null
          method: string
          request_size_bytes?: number | null
          response_size_bytes?: number | null
          response_time_ms?: number | null
          salon_id?: string | null
          status_code?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          ip_address?: unknown | null
          method?: string
          request_size_bytes?: number | null
          response_size_bytes?: number | null
          response_time_ms?: number | null
          salon_id?: string | null
          status_code?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_usage_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      appointment_notes: {
        Row: {
          appointment_id: string
          created_at: string
          id: string
          is_private: boolean | null
          note: string
          staff_id: string
          updated_at: string
        }
        Insert: {
          appointment_id: string
          created_at?: string
          id?: string
          is_private?: boolean | null
          note: string
          staff_id: string
          updated_at?: string
        }
        Update: {
          appointment_id?: string
          created_at?: string
          id?: string
          is_private?: boolean | null
          note?: string
          staff_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_notes_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_notes_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_performance_dashboard"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "appointment_notes_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      appointment_services: {
        Row: {
          appointment_id: string
          created_at: string
          display_order: number | null
          duration_minutes: number
          id: string
          price: number
          service_id: string
        }
        Insert: {
          appointment_id: string
          created_at?: string
          display_order?: number | null
          duration_minutes: number
          id?: string
          price: number
          service_id: string
        }
        Update: {
          appointment_id?: string
          created_at?: string
          display_order?: number | null
          duration_minutes?: number
          id?: string
          price?: number
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_services_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "service_profitability"
            referencedColumns: ["service_id"]
          },
          {
            foreignKeyName: "appointment_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          appointment_date: string
          booking_date: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          completed_at: string | null
          confirmed_at: string | null
          created_at: string
          customer_id: string
          end_time: string
          id: string
          internal_notes: string | null
          is_walk_in: boolean
          location_id: string
          notes: string | null
          salon_id: string
          services: Json | null
          staff_id: string
          start_time: string
          status: Database["public"]["Enums"]["appointment_status"]
          total_amount: number | null
          total_duration: number | null
          updated_at: string
        }
        Insert: {
          appointment_date: string
          booking_date?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          customer_id: string
          end_time: string
          id?: string
          internal_notes?: string | null
          is_walk_in?: boolean
          location_id: string
          notes?: string | null
          salon_id: string
          services?: Json | null
          staff_id: string
          start_time: string
          status?: Database["public"]["Enums"]["appointment_status"]
          total_amount?: number | null
          total_duration?: number | null
          updated_at?: string
        }
        Update: {
          appointment_date?: string
          booking_date?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          customer_id?: string
          end_time?: string
          id?: string
          internal_notes?: string | null
          is_walk_in?: boolean
          location_id?: string
          notes?: string | null
          salon_id?: string
          services?: Json | null
          staff_id?: string
          start_time?: string
          status?: Database["public"]["Enums"]["appointment_status"]
          total_amount?: number | null
          total_duration?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_cancelled_by_fkey"
            columns: ["cancelled_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "salon_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_performance_dashboard"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "appointments_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: unknown | null
          new_data: Json | null
          old_data: Json | null
          resource_type: string | null
          salon_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown | null
          new_data?: Json | null
          old_data?: Json | null
          resource_type?: string | null
          salon_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown | null
          new_data?: Json | null
          old_data?: Json | null
          resource_type?: string | null
          salon_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_summary_internal: {
        Row: {
          created_at: string | null
          id: string
          summary_data: Json | null
          summary_date: string
          total_records: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          summary_data?: Json | null
          summary_date: string
          total_records?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          summary_data?: Json | null
          summary_date?: string
          total_records?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      auth_otp_attempts: {
        Row: {
          attempts: number | null
          created_at: string | null
          email: string
          id: string
          last_attempt_at: string | null
          locked_until: string | null
          otp_type: string
        }
        Insert: {
          attempts?: number | null
          created_at?: string | null
          email: string
          id?: string
          last_attempt_at?: string | null
          locked_until?: string | null
          otp_type: string
        }
        Update: {
          attempts?: number | null
          created_at?: string | null
          email?: string
          id?: string
          last_attempt_at?: string | null
          locked_until?: string | null
          otp_type?: string
        }
        Relationships: []
      }
      auth_otp_config: {
        Row: {
          config_type: string
          cooldown_seconds: number | null
          created_at: string | null
          enabled: boolean | null
          id: string
          max_attempts: number | null
          otp_expiry_seconds: number | null
          otp_length: number | null
          updated_at: string | null
        }
        Insert: {
          config_type: string
          cooldown_seconds?: number | null
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          max_attempts?: number | null
          otp_expiry_seconds?: number | null
          otp_length?: number | null
          updated_at?: string | null
        }
        Update: {
          config_type?: string
          cooldown_seconds?: number | null
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          max_attempts?: number | null
          otp_expiry_seconds?: number | null
          otp_length?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      blocked_times: {
        Row: {
          created_at: string
          created_by: string
          end_datetime: string
          id: string
          location_id: string | null
          reason: string | null
          salon_id: string
          staff_id: string | null
          start_datetime: string
        }
        Insert: {
          created_at?: string
          created_by: string
          end_datetime: string
          id?: string
          location_id?: string | null
          reason?: string | null
          salon_id: string
          staff_id?: string | null
          start_datetime: string
        }
        Update: {
          created_at?: string
          created_by?: string
          end_datetime?: string
          id?: string
          location_id?: string | null
          reason?: string | null
          salon_id?: string
          staff_id?: string | null
          start_datetime?: string
        }
        Relationships: [
          {
            foreignKeyName: "blocked_times_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blocked_times_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "salon_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blocked_times_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blocked_times_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_performance_dashboard"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "blocked_times_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      csrf_tokens: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          token: string
          used: boolean | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          token: string
          used?: boolean | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          token?: string
          used?: boolean | null
          user_id?: string | null
        }
        Relationships: []
      }
      customer_analytics: {
        Row: {
          acquisition_channel: string | null
          acquisition_cost: number | null
          acquisition_date: string | null
          average_days_between_visits: number | null
          churn_probability: number | null
          clv_segment: string | null
          created_at: string | null
          customer_id: string
          days_since_last_visit: number | null
          id: string
          last_calculated: string | null
          last_visit_date: string | null
          lifetime_appointments: number | null
          lifetime_products: number | null
          lifetime_revenue: number | null
          lifetime_tips: number | null
          no_show_count: number | null
          predicted_clv: number | null
          preferred_services: Json | null
          preferred_staff: Json | null
          preferred_times: Json | null
          referral_count: number | null
          retention_rate: number | null
          review_count: number | null
          salon_id: string
          updated_at: string | null
        }
        Insert: {
          acquisition_channel?: string | null
          acquisition_cost?: number | null
          acquisition_date?: string | null
          average_days_between_visits?: number | null
          churn_probability?: number | null
          clv_segment?: string | null
          created_at?: string | null
          customer_id: string
          days_since_last_visit?: number | null
          id?: string
          last_calculated?: string | null
          last_visit_date?: string | null
          lifetime_appointments?: number | null
          lifetime_products?: number | null
          lifetime_revenue?: number | null
          lifetime_tips?: number | null
          no_show_count?: number | null
          predicted_clv?: number | null
          preferred_services?: Json | null
          preferred_staff?: Json | null
          preferred_times?: Json | null
          referral_count?: number | null
          retention_rate?: number | null
          review_count?: number | null
          salon_id: string
          updated_at?: string | null
        }
        Update: {
          acquisition_channel?: string | null
          acquisition_cost?: number | null
          acquisition_date?: string | null
          average_days_between_visits?: number | null
          churn_probability?: number | null
          clv_segment?: string | null
          created_at?: string | null
          customer_id?: string
          days_since_last_visit?: number | null
          id?: string
          last_calculated?: string | null
          last_visit_date?: string | null
          lifetime_appointments?: number | null
          lifetime_products?: number | null
          lifetime_revenue?: number | null
          lifetime_tips?: number | null
          no_show_count?: number | null
          predicted_clv?: number | null
          preferred_services?: Json | null
          preferred_staff?: Json | null
          preferred_times?: Json | null
          referral_count?: number | null
          retention_rate?: number | null
          review_count?: number | null
          salon_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_analytics_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_analytics_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_preferences: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          preference_type: Database["public"]["Enums"]["preference_type"]
          preference_value: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          preference_type: Database["public"]["Enums"]["preference_type"]
          preference_value: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          preference_type?: Database["public"]["Enums"]["preference_type"]
          preference_value?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_preferences_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_lifetime_value"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "customer_preferences_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_loyalty_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_preferences_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          created_at: string
          customer_since: string | null
          email: string | null
          first_name: string | null
          id: string
          is_vip: boolean
          last_name: string | null
          last_visit_date: string | null
          lifetime_points_earned: number | null
          lifetime_points_redeemed: number | null
          loyalty_points: number | null
          loyalty_points_balance: number | null
          notes: string | null
          phone: string | null
          points_multiplier: number | null
          preferred_staff_id: string | null
          referral_source: string | null
          salon_id: string | null
          tags: string[] | null
          total_spent: number | null
          updated_at: string
          user_id: string
          visit_count: number
        }
        Insert: {
          created_at?: string
          customer_since?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          is_vip?: boolean
          last_name?: string | null
          last_visit_date?: string | null
          lifetime_points_earned?: number | null
          lifetime_points_redeemed?: number | null
          loyalty_points?: number | null
          loyalty_points_balance?: number | null
          notes?: string | null
          phone?: string | null
          points_multiplier?: number | null
          preferred_staff_id?: string | null
          referral_source?: string | null
          salon_id?: string | null
          tags?: string[] | null
          total_spent?: number | null
          updated_at?: string
          user_id: string
          visit_count?: number
        }
        Update: {
          created_at?: string
          customer_since?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          is_vip?: boolean
          last_name?: string | null
          last_visit_date?: string | null
          lifetime_points_earned?: number | null
          lifetime_points_redeemed?: number | null
          loyalty_points?: number | null
          loyalty_points_balance?: number | null
          notes?: string | null
          phone?: string | null
          points_multiplier?: number | null
          preferred_staff_id?: string | null
          referral_source?: string | null
          salon_id?: string | null
          tags?: string[] | null
          total_spent?: number | null
          updated_at?: string
          user_id?: string
          visit_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "customers_preferred_staff_id_fkey"
            columns: ["preferred_staff_id"]
            isOneToOne: false
            referencedRelation: "staff_performance_dashboard"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "customers_preferred_staff_id_fkey"
            columns: ["preferred_staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_metrics: {
        Row: {
          appointments_booked: number | null
          appointments_cancelled: number | null
          appointments_completed: number | null
          appointments_no_show: number | null
          average_service_time: number | null
          average_ticket: number | null
          created_at: string | null
          id: string
          location_id: string | null
          metric_date: string
          metric_hour: number | null
          new_customers: number | null
          occupancy_rate: number | null
          returning_customers: number | null
          revenue_products: number | null
          revenue_services: number | null
          revenue_tips: number | null
          revenue_total: number | null
          salon_id: string
          services_performed: number | null
          staff_idle_minutes: number | null
          staff_utilization_rate: number | null
          staff_working: number | null
          total_customers: number | null
          updated_at: string | null
        }
        Insert: {
          appointments_booked?: number | null
          appointments_cancelled?: number | null
          appointments_completed?: number | null
          appointments_no_show?: number | null
          average_service_time?: number | null
          average_ticket?: number | null
          created_at?: string | null
          id?: string
          location_id?: string | null
          metric_date: string
          metric_hour?: number | null
          new_customers?: number | null
          occupancy_rate?: number | null
          returning_customers?: number | null
          revenue_products?: number | null
          revenue_services?: number | null
          revenue_tips?: number | null
          revenue_total?: number | null
          salon_id: string
          services_performed?: number | null
          staff_idle_minutes?: number | null
          staff_utilization_rate?: number | null
          staff_working?: number | null
          total_customers?: number | null
          updated_at?: string | null
        }
        Update: {
          appointments_booked?: number | null
          appointments_cancelled?: number | null
          appointments_completed?: number | null
          appointments_no_show?: number | null
          average_service_time?: number | null
          average_ticket?: number | null
          created_at?: string | null
          id?: string
          location_id?: string | null
          metric_date?: string
          metric_hour?: number | null
          new_customers?: number | null
          occupancy_rate?: number | null
          returning_customers?: number | null
          revenue_products?: number | null
          revenue_services?: number | null
          revenue_tips?: number | null
          revenue_total?: number | null
          salon_id?: string
          services_performed?: number | null
          staff_idle_minutes?: number | null
          staff_utilization_rate?: number | null
          staff_working?: number | null
          total_customers?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dashboard_metrics_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "salon_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dashboard_metrics_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      email_campaign_recipients: {
        Row: {
          bounced_at: string | null
          campaign_id: string
          clicked_at: string | null
          customer_id: string
          id: string
          opened_at: string | null
          sent_at: string | null
          unsubscribed_at: string | null
        }
        Insert: {
          bounced_at?: string | null
          campaign_id: string
          clicked_at?: string | null
          customer_id: string
          id?: string
          opened_at?: string | null
          sent_at?: string | null
          unsubscribed_at?: string | null
        }
        Update: {
          bounced_at?: string | null
          campaign_id?: string
          clicked_at?: string | null
          customer_id?: string
          id?: string
          opened_at?: string | null
          sent_at?: string | null
          unsubscribed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_campaign_recipients_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "email_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_campaign_recipients_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      email_campaigns: {
        Row: {
          clicks_count: number
          content: string
          created_at: string
          id: string
          name: string
          opens_count: number
          recipients_count: number
          salon_id: string
          scheduled_at: string | null
          sent_at: string | null
          status: string
          subject: string
          template_id: string | null
          updated_at: string
        }
        Insert: {
          clicks_count?: number
          content: string
          created_at?: string
          id?: string
          name: string
          opens_count?: number
          recipients_count?: number
          salon_id: string
          scheduled_at?: string | null
          sent_at?: string | null
          status: string
          subject: string
          template_id?: string | null
          updated_at?: string
        }
        Update: {
          clicks_count?: number
          content?: string
          created_at?: string
          id?: string
          name?: string
          opens_count?: number
          recipients_count?: number
          salon_id?: string
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          subject?: string
          template_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_campaigns_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      error_logs: {
        Row: {
          created_at: string
          endpoint: string | null
          error_message: string
          error_stack: string | null
          error_type: string
          id: string
          ip_address: unknown | null
          method: string | null
          request_body: Json | null
          response_body: Json | null
          salon_id: string | null
          status_code: number | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          endpoint?: string | null
          error_message: string
          error_stack?: string | null
          error_type: string
          id?: string
          ip_address?: unknown | null
          method?: string | null
          request_body?: Json | null
          response_body?: Json | null
          salon_id?: string | null
          status_code?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          endpoint?: string | null
          error_message?: string
          error_stack?: string | null
          error_type?: string
          id?: string
          ip_address?: unknown | null
          method?: string | null
          request_body?: Json | null
          response_body?: Json | null
          salon_id?: string | null
          status_code?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "error_logs_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "error_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      export_configurations: {
        Row: {
          created_at: string | null
          created_by: string | null
          custom_end_date: string | null
          custom_start_date: string | null
          date_range_type: string | null
          delivery_emails: string[] | null
          delivery_method: string | null
          export_format: string
          export_name: string
          export_type: string
          filters: Json | null
          id: string
          include_columns: Json | null
          is_active: boolean | null
          is_scheduled: boolean | null
          last_run: string | null
          next_run: string | null
          salon_id: string
          schedule_day: number | null
          schedule_frequency: string | null
          schedule_time: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          custom_end_date?: string | null
          custom_start_date?: string | null
          date_range_type?: string | null
          delivery_emails?: string[] | null
          delivery_method?: string | null
          export_format: string
          export_name: string
          export_type: string
          filters?: Json | null
          id?: string
          include_columns?: Json | null
          is_active?: boolean | null
          is_scheduled?: boolean | null
          last_run?: string | null
          next_run?: string | null
          salon_id: string
          schedule_day?: number | null
          schedule_frequency?: string | null
          schedule_time?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          custom_end_date?: string | null
          custom_start_date?: string | null
          date_range_type?: string | null
          delivery_emails?: string[] | null
          delivery_method?: string | null
          export_format?: string
          export_name?: string
          export_type?: string
          filters?: Json | null
          id?: string
          include_columns?: Json | null
          is_active?: boolean | null
          is_scheduled?: boolean | null
          last_run?: string | null
          next_run?: string | null
          salon_id?: string
          schedule_day?: number | null
          schedule_frequency?: string | null
          schedule_time?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "export_configurations_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      export_history: {
        Row: {
          completed_at: string | null
          configuration_id: string | null
          created_at: string | null
          error_message: string | null
          expires_at: string | null
          export_format: string
          export_type: string
          exported_by: string | null
          file_size_bytes: number | null
          file_url: string | null
          filters_applied: Json | null
          id: string
          row_count: number | null
          salon_id: string
          started_at: string | null
          status: string
        }
        Insert: {
          completed_at?: string | null
          configuration_id?: string | null
          created_at?: string | null
          error_message?: string | null
          expires_at?: string | null
          export_format: string
          export_type: string
          exported_by?: string | null
          file_size_bytes?: number | null
          file_url?: string | null
          filters_applied?: Json | null
          id?: string
          row_count?: number | null
          salon_id: string
          started_at?: string | null
          status?: string
        }
        Update: {
          completed_at?: string | null
          configuration_id?: string | null
          created_at?: string | null
          error_message?: string | null
          expires_at?: string | null
          export_format?: string
          export_type?: string
          exported_by?: string | null
          file_size_bytes?: number | null
          file_url?: string | null
          filters_applied?: Json | null
          id?: string
          row_count?: number | null
          salon_id?: string
          started_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "export_history_configuration_id_fkey"
            columns: ["configuration_id"]
            isOneToOne: false
            referencedRelation: "export_configurations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "export_history_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_points_ledger: {
        Row: {
          adjusted_by: string | null
          adjustment_reason: string | null
          appointment_id: string | null
          balance_after: number
          created_at: string | null
          created_by: string | null
          customer_id: string
          description: string | null
          expires_at: string | null
          id: string
          points_amount: number
          points_rate: number | null
          purchase_amount: number | null
          redemption_item: string | null
          redemption_value: number | null
          reference_id: string | null
          salon_id: string
          transaction_type: string
        }
        Insert: {
          adjusted_by?: string | null
          adjustment_reason?: string | null
          appointment_id?: string | null
          balance_after: number
          created_at?: string | null
          created_by?: string | null
          customer_id: string
          description?: string | null
          expires_at?: string | null
          id?: string
          points_amount: number
          points_rate?: number | null
          purchase_amount?: number | null
          redemption_item?: string | null
          redemption_value?: number | null
          reference_id?: string | null
          salon_id: string
          transaction_type: string
        }
        Update: {
          adjusted_by?: string | null
          adjustment_reason?: string | null
          appointment_id?: string | null
          balance_after?: number
          created_at?: string | null
          created_by?: string | null
          customer_id?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          points_amount?: number
          points_rate?: number | null
          purchase_amount?: number | null
          redemption_item?: string | null
          redemption_value?: number | null
          reference_id?: string | null
          salon_id?: string
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_points_ledger_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loyalty_points_ledger_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loyalty_points_ledger_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_programs: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          points_per_dollar: number | null
          salon_id: string
          tiers: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          points_per_dollar?: number | null
          salon_id: string
          tiers?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          points_per_dollar?: number | null
          salon_id?: string
          tiers?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_programs_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: true
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_transactions: {
        Row: {
          appointment_id: string | null
          created_at: string
          customer_id: string
          description: string | null
          expires_at: string | null
          id: string
          points: number
          salon_id: string
          type: string
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string
          customer_id: string
          description?: string | null
          expires_at?: string | null
          id?: string
          points: number
          salon_id: string
          type: string
        }
        Update: {
          appointment_id?: string | null
          created_at?: string
          customer_id?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          points?: number
          salon_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_transactions_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loyalty_transactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loyalty_transactions_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_settings: {
        Row: {
          created_at: string
          email_appointments: boolean | null
          email_marketing: boolean | null
          email_reminders: boolean | null
          id: string
          push_appointments: boolean | null
          push_marketing: boolean | null
          push_reminders: boolean | null
          reminder_hours_before: number | null
          sms_appointments: boolean | null
          sms_marketing: boolean | null
          sms_reminders: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_appointments?: boolean | null
          email_marketing?: boolean | null
          email_reminders?: boolean | null
          id?: string
          push_appointments?: boolean | null
          push_marketing?: boolean | null
          push_reminders?: boolean | null
          reminder_hours_before?: number | null
          sms_appointments?: boolean | null
          sms_marketing?: boolean | null
          sms_reminders?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_appointments?: boolean | null
          email_marketing?: boolean | null
          email_reminders?: boolean | null
          id?: string
          push_appointments?: boolean | null
          push_marketing?: boolean | null
          push_reminders?: boolean | null
          reminder_hours_before?: number | null
          sms_appointments?: boolean | null
          sms_marketing?: boolean | null
          sms_reminders?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          data: Json
          id: string
          is_read: boolean
          message: string
          read_at: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json
          id?: string
          is_read?: boolean
          message: string
          read_at?: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          is_read?: boolean
          message?: string
          read_at?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_subscription_plans: {
        Row: {
          billing_notes: string | null
          billing_period: string
          created_at: string | null
          description: string | null
          features: Json | null
          id: string
          is_active: boolean | null
          max_locations: number | null
          max_services: number | null
          max_staff: number | null
          name: string
          price: number
          stripe_price_id: string | null
          stripe_product_id: string | null
          updated_at: string | null
        }
        Insert: {
          billing_notes?: string | null
          billing_period: string
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_locations?: number | null
          max_services?: number | null
          max_staff?: number | null
          name: string
          price: number
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          updated_at?: string | null
        }
        Update: {
          billing_notes?: string | null
          billing_period?: string
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_locations?: number | null
          max_services?: number | null
          max_staff?: number | null
          name?: string
          price?: number
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      platform_subscriptions: {
        Row: {
          amount: number
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string
          current_period_start: string
          id: string
          last_payment_amount: number | null
          last_payment_date: string | null
          next_payment_date: string | null
          payment_method: string | null
          plan_id: string
          salon_id: string
          status: string
          stripe_customer_id: string | null
          stripe_status: string | null
          stripe_subscription_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end: string
          current_period_start: string
          id?: string
          last_payment_amount?: number | null
          last_payment_date?: string | null
          next_payment_date?: string | null
          payment_method?: string | null
          plan_id: string
          salon_id: string
          status: string
          stripe_customer_id?: string | null
          stripe_status?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string
          current_period_start?: string
          id?: string
          last_payment_amount?: number | null
          last_payment_date?: string | null
          next_payment_date?: string | null
          payment_method?: string | null
          plan_id?: string
          salon_id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_status?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "platform_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "platform_subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_subscriptions_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: true
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          date_of_birth: string | null
          email: string
          first_name: string | null
          full_name: string | null
          id: string
          is_verified: boolean
          last_active_at: string | null
          last_name: string | null
          phone: string | null
          preferences: Json | null
          role: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          email: string
          first_name?: string | null
          full_name?: string | null
          id: string
          is_verified?: boolean
          last_active_at?: string | null
          last_name?: string | null
          phone?: string | null
          preferences?: Json | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string
          first_name?: string | null
          full_name?: string | null
          id?: string
          is_verified?: boolean
          last_active_at?: string | null
          last_name?: string | null
          phone?: string | null
          preferences?: Json | null
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          created_at: string | null
          endpoint: string
          id: string
          ip_address: unknown | null
          request_count: number | null
          user_id: string | null
          window_start: string | null
        }
        Insert: {
          created_at?: string | null
          endpoint: string
          id?: string
          ip_address?: unknown | null
          request_count?: number | null
          user_id?: string | null
          window_start?: string | null
        }
        Update: {
          created_at?: string | null
          endpoint?: string
          id?: string
          ip_address?: unknown | null
          request_count?: number | null
          user_id?: string | null
          window_start?: string | null
        }
        Relationships: []
      }
      review_requests: {
        Row: {
          appointment_id: string
          click_token: string | null
          clicked_at: string | null
          created_at: string | null
          customer_id: string
          follow_up_count: number | null
          id: string
          last_follow_up: string | null
          opened_at: string | null
          personalization_data: Json | null
          rating_given: number | null
          request_type: string
          review_id: string | null
          reviewed_at: string | null
          salon_id: string
          scheduled_for: string
          sent_at: string | null
          staff_id: string | null
          status: string
          template_used: string | null
          updated_at: string | null
        }
        Insert: {
          appointment_id: string
          click_token?: string | null
          clicked_at?: string | null
          created_at?: string | null
          customer_id: string
          follow_up_count?: number | null
          id?: string
          last_follow_up?: string | null
          opened_at?: string | null
          personalization_data?: Json | null
          rating_given?: number | null
          request_type: string
          review_id?: string | null
          reviewed_at?: string | null
          salon_id: string
          scheduled_for?: string
          sent_at?: string | null
          staff_id?: string | null
          status?: string
          template_used?: string | null
          updated_at?: string | null
        }
        Update: {
          appointment_id?: string
          click_token?: string | null
          clicked_at?: string | null
          created_at?: string | null
          customer_id?: string
          follow_up_count?: number | null
          id?: string
          last_follow_up?: string | null
          opened_at?: string | null
          personalization_data?: Json | null
          rating_given?: number | null
          request_type?: string
          review_id?: string | null
          reviewed_at?: string | null
          salon_id?: string
          scheduled_for?: string
          sent_at?: string | null
          staff_id?: string | null
          status?: string
          template_used?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "review_requests_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_requests_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_requests_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_requests_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_requests_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_performance_dashboard"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "review_requests_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          appointment_id: string | null
          comment: string | null
          created_at: string
          customer_id: string
          id: string
          is_verified: boolean
          rating: number
          responded_at: string | null
          response: string | null
          salon_id: string
          staff_id: string | null
          updated_at: string
        }
        Insert: {
          appointment_id?: string | null
          comment?: string | null
          created_at?: string
          customer_id: string
          id?: string
          is_verified?: boolean
          rating: number
          responded_at?: string | null
          response?: string | null
          salon_id: string
          staff_id?: string | null
          updated_at?: string
        }
        Update: {
          appointment_id?: string | null
          comment?: string | null
          created_at?: string
          customer_id?: string
          id?: string
          is_verified?: boolean
          rating?: number
          responded_at?: string | null
          response?: string | null
          salon_id?: string
          staff_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_performance_dashboard"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "reviews_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      salon_locations: {
        Row: {
          address_line_1: string
          address_line_2: string | null
          city: string
          country: string
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          latitude: number | null
          longitude: number | null
          name: string
          operating_hours: Json
          phone: string | null
          postal_code: string
          salon_id: string
          slug: string
          state_province: string
          updated_at: string
        }
        Insert: {
          address_line_1: string
          address_line_2?: string | null
          city: string
          country?: string
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          latitude?: number | null
          longitude?: number | null
          name: string
          operating_hours?: Json
          phone?: string | null
          postal_code: string
          salon_id: string
          slug: string
          state_province: string
          updated_at?: string
        }
        Update: {
          address_line_1?: string
          address_line_2?: string | null
          city?: string
          country?: string
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          latitude?: number | null
          longitude?: number | null
          name?: string
          operating_hours?: Json
          phone?: string | null
          postal_code?: string
          salon_id?: string
          slug?: string
          state_province?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "salon_locations_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      salons: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          email: string | null
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          phone: string | null
          settings: Json
          slug: string
          stripe_customer_id: string | null
          timezone: string
          updated_at: string
          website: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name: string
          phone?: string | null
          settings?: Json
          slug: string
          stripe_customer_id?: string | null
          timezone?: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          phone?: string | null
          settings?: Json
          slug?: string
          stripe_customer_id?: string | null
          timezone?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "salons_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_categories: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean
          name: string
          salon_id: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          salon_id: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          salon_id?: string
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_categories_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      service_costs: {
        Row: {
          average_duration_minutes: number | null
          average_price: number | null
          cleanup_time_minutes: number | null
          created_at: string | null
          equipment_cost: number | null
          gross_margin: number | null
          id: string
          last_calculated: string | null
          margin_percentage: number | null
          overhead_allocation: number | null
          product_cost: number | null
          salon_id: string
          service_id: string
          setup_time_minutes: number | null
          supply_cost: number | null
          total_cost: number | null
          updated_at: string | null
        }
        Insert: {
          average_duration_minutes?: number | null
          average_price?: number | null
          cleanup_time_minutes?: number | null
          created_at?: string | null
          equipment_cost?: number | null
          gross_margin?: number | null
          id?: string
          last_calculated?: string | null
          margin_percentage?: number | null
          overhead_allocation?: number | null
          product_cost?: number | null
          salon_id: string
          service_id: string
          setup_time_minutes?: number | null
          supply_cost?: number | null
          total_cost?: number | null
          updated_at?: string | null
        }
        Update: {
          average_duration_minutes?: number | null
          average_price?: number | null
          cleanup_time_minutes?: number | null
          created_at?: string | null
          equipment_cost?: number | null
          gross_margin?: number | null
          id?: string
          last_calculated?: string | null
          margin_percentage?: number | null
          overhead_allocation?: number | null
          product_cost?: number | null
          salon_id?: string
          service_id?: string
          setup_time_minutes?: number | null
          supply_cost?: number | null
          total_cost?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_costs_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_costs_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "service_profitability"
            referencedColumns: ["service_id"]
          },
          {
            foreignKeyName: "service_costs_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_location_availability: {
        Row: {
          created_at: string
          id: string
          is_available: boolean
          location_id: string
          override_price: number | null
          service_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_available?: boolean
          location_id: string
          override_price?: number | null
          service_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_available?: boolean
          location_id?: string
          override_price?: number | null
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_location_availability_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "salon_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_location_availability_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "service_profitability"
            referencedColumns: ["service_id"]
          },
          {
            foreignKeyName: "service_location_availability_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          duration_minutes: number
          id: string
          is_active: boolean
          is_addon: boolean
          metadata: Json
          name: string
          price: number
          requires_consultation: boolean
          salon_id: string
          slug: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          duration_minutes: number
          id?: string
          is_active?: boolean
          is_addon?: boolean
          metadata?: Json
          name: string
          price?: number
          requires_consultation?: boolean
          salon_id: string
          slug: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean
          is_addon?: boolean
          metadata?: Json
          name?: string
          price?: number
          requires_consultation?: boolean
          salon_id?: string
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          created_at: string
          id: string
          location_id: string | null
          salon_id: string | null
          setting_key: string
          setting_value: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          location_id?: string | null
          salon_id?: string | null
          setting_key: string
          setting_value: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          location_id?: string | null
          salon_id?: string | null
          setting_key?: string
          setting_value?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "settings_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "salon_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "settings_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_campaign_recipients: {
        Row: {
          campaign_id: string
          clicked_at: string | null
          conversion_amount: number | null
          conversion_date: string | null
          converted: boolean | null
          created_at: string | null
          customer_id: string
          delivered_at: string | null
          error_message: string | null
          id: string
          opted_out_at: string | null
          personalized_message: string | null
          phone_number: string
          sent_at: string | null
          short_link: string | null
          status: string
        }
        Insert: {
          campaign_id: string
          clicked_at?: string | null
          conversion_amount?: number | null
          conversion_date?: string | null
          converted?: boolean | null
          created_at?: string | null
          customer_id: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          opted_out_at?: string | null
          personalized_message?: string | null
          phone_number: string
          sent_at?: string | null
          short_link?: string | null
          status?: string
        }
        Update: {
          campaign_id?: string
          clicked_at?: string | null
          conversion_amount?: number | null
          conversion_date?: string | null
          converted?: boolean | null
          created_at?: string | null
          customer_id?: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          opted_out_at?: string | null
          personalized_message?: string | null
          phone_number?: string
          sent_at?: string | null
          short_link?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "sms_campaign_recipients_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "sms_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sms_campaign_recipients_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_campaigns: {
        Row: {
          campaign_type: string
          clicked_count: number | null
          completed_at: string | null
          conversion_count: number | null
          conversion_window_hours: number | null
          created_at: string | null
          created_by: string | null
          delivered_count: number | null
          id: string
          message_template: string
          name: string
          opted_out_count: number | null
          revenue_generated: number | null
          salon_id: string
          scheduled_at: string | null
          sent_count: number | null
          started_at: string | null
          status: string
          target_count: number | null
          target_segments: Json | null
          track_conversions: boolean | null
          updated_at: string | null
          use_shortlinks: boolean | null
        }
        Insert: {
          campaign_type: string
          clicked_count?: number | null
          completed_at?: string | null
          conversion_count?: number | null
          conversion_window_hours?: number | null
          created_at?: string | null
          created_by?: string | null
          delivered_count?: number | null
          id?: string
          message_template: string
          name: string
          opted_out_count?: number | null
          revenue_generated?: number | null
          salon_id: string
          scheduled_at?: string | null
          sent_count?: number | null
          started_at?: string | null
          status?: string
          target_count?: number | null
          target_segments?: Json | null
          track_conversions?: boolean | null
          updated_at?: string | null
          use_shortlinks?: boolean | null
        }
        Update: {
          campaign_type?: string
          clicked_count?: number | null
          completed_at?: string | null
          conversion_count?: number | null
          conversion_window_hours?: number | null
          created_at?: string | null
          created_by?: string | null
          delivered_count?: number | null
          id?: string
          message_template?: string
          name?: string
          opted_out_count?: number | null
          revenue_generated?: number | null
          salon_id?: string
          scheduled_at?: string | null
          sent_count?: number | null
          started_at?: string | null
          status?: string
          target_count?: number | null
          target_segments?: Json | null
          track_conversions?: boolean | null
          updated_at?: string | null
          use_shortlinks?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "sms_campaigns_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_opt_outs: {
        Row: {
          id: string
          opted_out_at: string | null
          phone_number: string
          reason: string | null
          salon_id: string | null
        }
        Insert: {
          id?: string
          opted_out_at?: string | null
          phone_number: string
          reason?: string | null
          salon_id?: string | null
        }
        Update: {
          id?: string
          opted_out_at?: string | null
          phone_number?: string
          reason?: string | null
          salon_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sms_opt_outs_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_breaks: {
        Row: {
          break_type: Database["public"]["Enums"]["break_type"]
          created_at: string
          day_of_week: number | null
          end_time: string
          id: string
          is_recurring: boolean
          staff_id: string
          start_time: string
        }
        Insert: {
          break_type?: Database["public"]["Enums"]["break_type"]
          created_at?: string
          day_of_week?: number | null
          end_time: string
          id?: string
          is_recurring?: boolean
          staff_id: string
          start_time: string
        }
        Update: {
          break_type?: Database["public"]["Enums"]["break_type"]
          created_at?: string
          day_of_week?: number | null
          end_time?: string
          id?: string
          is_recurring?: boolean
          staff_id?: string
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_breaks_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_performance_dashboard"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "staff_breaks_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_earnings: {
        Row: {
          appointment_id: string | null
          commission_amount: number | null
          commission_rate: number | null
          created_at: string | null
          id: string
          is_paid_out: boolean | null
          location_id: string | null
          notes: string | null
          paid_out_by: string | null
          paid_out_date: string | null
          payment_method: string | null
          recorded_by: string
          salon_id: string
          service_amount: number
          service_date: string
          service_name: string
          staff_id: string
          tip_amount: number | null
          total_earnings: number | null
          updated_at: string | null
        }
        Insert: {
          appointment_id?: string | null
          commission_amount?: number | null
          commission_rate?: number | null
          created_at?: string | null
          id?: string
          is_paid_out?: boolean | null
          location_id?: string | null
          notes?: string | null
          paid_out_by?: string | null
          paid_out_date?: string | null
          payment_method?: string | null
          recorded_by: string
          salon_id: string
          service_amount?: number
          service_date: string
          service_name: string
          staff_id: string
          tip_amount?: number | null
          total_earnings?: number | null
          updated_at?: string | null
        }
        Update: {
          appointment_id?: string | null
          commission_amount?: number | null
          commission_rate?: number | null
          created_at?: string | null
          id?: string
          is_paid_out?: boolean | null
          location_id?: string | null
          notes?: string | null
          paid_out_by?: string | null
          paid_out_date?: string | null
          payment_method?: string | null
          recorded_by?: string
          salon_id?: string
          service_amount?: number
          service_date?: string
          service_name?: string
          staff_id?: string
          tip_amount?: number | null
          total_earnings?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_earnings_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_earnings_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "salon_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_earnings_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_earnings_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_performance_dashboard"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "staff_earnings_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_profiles: {
        Row: {
          address: string | null
          bio: string | null
          commission_rate: number | null
          created_at: string
          employee_id: string
          hire_date: string | null
          id: string
          is_active: boolean
          is_bookable: boolean
          location_id: string | null
          portfolio_images: string[] | null
          salon_id: string | null
          specialties: string[] | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          bio?: string | null
          commission_rate?: number | null
          created_at?: string
          employee_id: string
          hire_date?: string | null
          id?: string
          is_active?: boolean
          is_bookable?: boolean
          location_id?: string | null
          portfolio_images?: string[] | null
          salon_id?: string | null
          specialties?: string[] | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          bio?: string | null
          commission_rate?: number | null
          created_at?: string
          employee_id?: string
          hire_date?: string | null
          id?: string
          is_active?: boolean
          is_bookable?: boolean
          location_id?: string | null
          portfolio_images?: string[] | null
          salon_id?: string | null
          specialties?: string[] | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_profiles_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "salon_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_profiles_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_schedules: {
        Row: {
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_working: boolean
          staff_id: string
          start_time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_working?: boolean
          staff_id: string
          start_time: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_working?: boolean
          staff_id?: string
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_schedules_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_performance_dashboard"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "staff_schedules_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_services: {
        Row: {
          can_perform: boolean
          created_at: string
          custom_duration: number | null
          id: string
          service_id: string
          staff_id: string
        }
        Insert: {
          can_perform?: boolean
          created_at?: string
          custom_duration?: number | null
          id?: string
          service_id: string
          staff_id: string
        }
        Update: {
          can_perform?: boolean
          created_at?: string
          custom_duration?: number | null
          id?: string
          service_id?: string
          staff_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "service_profitability"
            referencedColumns: ["service_id"]
          },
          {
            foreignKeyName: "staff_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_services_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_performance_dashboard"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "staff_services_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_specialties: {
        Row: {
          created_at: string
          id: string
          specialty: string
          staff_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          specialty: string
          staff_id: string
        }
        Update: {
          created_at?: string
          id?: string
          specialty?: string
          staff_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_specialties_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_performance_dashboard"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "staff_specialties_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_time_off: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          end_date: string
          id: string
          is_approved: boolean | null
          reason: string | null
          staff_id: string
          start_date: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          end_date: string
          id?: string
          is_approved?: boolean | null
          reason?: string | null
          staff_id: string
          start_date: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          end_date?: string
          id?: string
          is_approved?: boolean | null
          reason?: string | null
          staff_id?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_time_off_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_time_off_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_performance_dashboard"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "staff_time_off_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_utilization: {
        Row: {
          average_service_time: number | null
          break_hours: number | null
          client_satisfaction: number | null
          created_at: string | null
          id: string
          idle_hours: number | null
          products_sold: number | null
          rebook_rate: number | null
          revenue_generated: number | null
          revenue_per_hour: number | null
          salon_id: string
          scheduled_hours: number | null
          service_hours: number | null
          services_completed: number | null
          staff_id: string
          tips_earned: number | null
          updated_at: string | null
          utilization_date: string
          utilization_rate: number | null
          worked_hours: number | null
        }
        Insert: {
          average_service_time?: number | null
          break_hours?: number | null
          client_satisfaction?: number | null
          created_at?: string | null
          id?: string
          idle_hours?: number | null
          products_sold?: number | null
          rebook_rate?: number | null
          revenue_generated?: number | null
          revenue_per_hour?: number | null
          salon_id: string
          scheduled_hours?: number | null
          service_hours?: number | null
          services_completed?: number | null
          staff_id: string
          tips_earned?: number | null
          updated_at?: string | null
          utilization_date: string
          utilization_rate?: number | null
          worked_hours?: number | null
        }
        Update: {
          average_service_time?: number | null
          break_hours?: number | null
          client_satisfaction?: number | null
          created_at?: string | null
          id?: string
          idle_hours?: number | null
          products_sold?: number | null
          rebook_rate?: number | null
          revenue_generated?: number | null
          revenue_per_hour?: number | null
          salon_id?: string
          scheduled_hours?: number | null
          service_hours?: number | null
          services_completed?: number | null
          staff_id?: string
          tips_earned?: number | null
          updated_at?: string | null
          utilization_date?: string
          utilization_rate?: number | null
          worked_hours?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_utilization_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_utilization_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_performance_dashboard"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "staff_utilization_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      system_configuration: {
        Row: {
          config_key: string
          config_value: Json
          created_at: string | null
          description: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          config_key: string
          config_value: Json
          created_at?: string | null
          description?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          config_key?: string
          config_value?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      time_off_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          end_date: string
          id: string
          reason: string | null
          request_type: string
          staff_id: string
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          end_date: string
          id?: string
          reason?: string | null
          request_type: string
          staff_id: string
          start_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          end_date?: string
          id?: string
          reason?: string | null
          request_type?: string
          staff_id?: string
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_off_requests_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_performance_dashboard"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "time_off_requests_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_by: string | null
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          location_id: string | null
          permissions: Json
          role: Database["public"]["Enums"]["user_role_type"]
          salon_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_by?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          location_id?: string | null
          permissions?: Json
          role: Database["public"]["Enums"]["user_role_type"]
          salon_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_by?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          location_id?: string | null
          permissions?: Json
          role?: Database["public"]["Enums"]["user_role_type"]
          salon_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "salon_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      customer_lifetime_value: {
        Row: {
          appointment_count: number | null
          customer_id: string | null
          salon_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_loyalty_summary: {
        Row: {
          id: string | null
          lifetime_points_earned: number | null
          lifetime_points_redeemed: number | null
          loyalty_points_balance: number | null
          salon_id: string | null
          user_id: string | null
        }
        Insert: {
          id?: string | null
          lifetime_points_earned?: number | null
          lifetime_points_redeemed?: number | null
          loyalty_points_balance?: number | null
          salon_id?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string | null
          lifetime_points_earned?: number | null
          lifetime_points_redeemed?: number | null
          loyalty_points_balance?: number | null
          salon_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_realtime: {
        Row: {
          confirmed_count: number | null
          pending_count: number | null
          total_appointments: number | null
        }
        Relationships: []
      }
      mv_active_user_roles: {
        Row: {
          location_id: string | null
          location_name: string | null
          location_slug: string | null
          permissions: Json | null
          role: Database["public"]["Enums"]["user_role_type"] | null
          salon_id: string | null
          salon_name: string | null
          salon_slug: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "salon_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      optimization_summary: {
        Row: {
          calculated_at: string | null
          count: number | null
          type: string | null
        }
        Relationships: []
      }
      service_profitability: {
        Row: {
          price: number | null
          salon_id: string | null
          service_id: string | null
          service_name: string | null
        }
        Insert: {
          price?: number | null
          salon_id?: string | null
          service_id?: string | null
          service_name?: string | null
        }
        Update: {
          price?: number | null
          salon_id?: string | null
          service_id?: string | null
          service_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "services_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_earnings_summary: {
        Row: {
          salon_id: string | null
          service_date: string | null
          staff_id: string | null
          total_earnings: number | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_earnings_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_earnings_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_performance_dashboard"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "staff_earnings_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_performance_dashboard: {
        Row: {
          location_id: string | null
          salon_id: string | null
          staff_id: string | null
          user_id: string | null
        }
        Insert: {
          location_id?: string | null
          salon_id?: string | null
          staff_id?: string | null
          user_id?: string | null
        }
        Update: {
          location_id?: string | null
          salon_id?: string | null
          staff_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_profiles_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "salon_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_profiles_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      add_customer_tag: {
        Args: { p_customer_id: string; p_tag: string }
        Returns: undefined
      }
      add_loyalty_points: {
        Args: {
          p_appointment_id?: string
          p_customer_id: string
          p_description?: string
          p_points: number
          p_purchase_amount?: number
          p_salon_id: string
        }
        Returns: string
      }
      adjust_loyalty_points: {
        Args: {
          p_customer_id: string
          p_points: number
          p_reason: string
          p_salon_id: string
        }
        Returns: string
      }
      calculate_customer_clv: {
        Args: { p_customer_id: string; p_salon_id: string }
        Returns: number
      }
      calculate_daily_staff_utilization: {
        Args: { p_date: string; p_staff_id: string }
        Returns: undefined
      }
      change_user_role: {
        Args: {
          p_new_role: Database["public"]["Enums"]["user_role_type"]
          p_user_id: string
        }
        Returns: boolean
      }
      check_appointment_availability: {
        Args:
          | {
              p_date: string
              p_duration_minutes: number
              p_staff_id: string
              p_start_time: string
            }
          | {
              p_date: string
              p_end_time: string
              p_staff_id: string
              p_start_time: string
            }
        Returns: boolean
      }
      check_appointment_availability_enhanced: {
        Args: {
          p_date: string
          p_duration_minutes: number
          p_exclude_appointment_id?: string
          p_staff_id: string
          p_start_time: string
        }
        Returns: Json
      }
      check_data_integrity: {
        Args: Record<PropertyKey, never>
        Returns: {
          check_name: string
          details: string
          issue_count: number
          status: string
        }[]
      }
      check_missing_indexes: {
        Args: Record<PropertyKey, never>
        Returns: {
          column_name: string
          create_index_sql: string
          foreign_table: string
          index_status: string
          table_name: string
        }[]
      }
      check_rate_limit: {
        Args: {
          p_endpoint: string
          p_ip_address: unknown
          p_max_requests?: number
          p_user_id: string
          p_window_minutes?: number
        }
        Returns: boolean
      }
      check_security_status: {
        Args: Record<PropertyKey, never>
        Returns: {
          action_required: string
          check_name: string
          details: string
          status: string
        }[]
      }
      check_table_health: {
        Args: Record<PropertyKey, never>
        Returns: {
          dead_row_percentage: number
          dead_rows: number
          needs_vacuum: boolean
          row_count: number
          table_name: string
          table_size: string
        }[]
      }
      check_user_permission: {
        Args: { required_role: string; required_salon_id?: string }
        Returns: boolean
      }
      cleanup_dead_rows: {
        Args: { p_table_name?: string }
        Returns: {
          message: string
          status: string
          table_name: string
        }[]
      }
      cleanup_old_otp_attempts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_user_manually: {
        Args: {
          p_email: string
          p_full_name: string
          p_password: string
          p_role?: Database["public"]["Enums"]["user_role_type"]
        }
        Returns: string
      }
      delete_user_cascade: {
        Args: { user_id: string }
        Returns: boolean
      }
      export_data: {
        Args: {
          p_export_type: string
          p_filters?: Json
          p_format: string
          p_salon_id: string
        }
        Returns: string
      }
      generate_available_slots: {
        Args: {
          p_date: string
          p_service_duration?: number
          p_slot_interval?: number
          p_staff_id: string
        }
        Returns: {
          is_available: boolean
          slot_time: string
        }[]
      }
      generate_csrf_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_predictions: {
        Args: { p_date: string; p_salon_id: string }
        Returns: undefined
      }
      generate_unique_slug: {
        Args: { p_table_name: string; p_text: string }
        Returns: string
      }
      get_customer_statistics: {
        Args: { p_customer_id: string }
        Returns: {
          average_spend: number
          cancelled_appointments: number
          completed_appointments: number
          favorite_service: string
          favorite_staff: string
          no_show_count: number
          total_appointments: number
          total_spent: number
        }[]
      }
      get_database_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_next_available_slot: {
        Args: {
          p_from_date?: string
          p_service_duration?: number
          p_staff_id: string
        }
        Returns: {
          available_date: string
          available_time: string
        }[]
      }
      get_salon_revenue_report: {
        Args: { p_date_from: string; p_date_to: string; p_salon_id: string }
        Returns: {
          average_ticket: number
          completed_appointments: number
          report_date: string
          top_service: string
          top_staff: string
          total_appointments: number
          total_revenue: number
        }[]
      }
      get_security_headers: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_user_metadata: {
        Args: { key: string }
        Returns: Json
      }
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role_type"]
      }
      get_user_salon: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_salon_id: {
        Args: Record<PropertyKey, never> | { user_id: string }
        Returns: string
      }
      get_user_statistics: {
        Args: Record<PropertyKey, never>
        Returns: {
          confirmed_users: number
          recent_users: number
          total_users: number
          verified_profiles: number
        }[]
      }
      has_role: {
        Args: { check_role: string } | { role_name: string; user_uuid?: string }
        Returns: boolean
      }
      is_admin: {
        Args: { user_uuid?: string }
        Returns: boolean
      }
      is_salon_admin: {
        Args: { p_salon_id: string }
        Returns: boolean
      }
      is_salon_member: {
        Args: { check_salon_id: string }
        Returns: boolean
      }
      is_salon_staff: {
        Args: { p_salon_id: string }
        Returns: boolean
      }
      is_staff: {
        Args: Record<PropertyKey, never> | { user_id: string }
        Returns: boolean
      }
      is_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_valid_email: {
        Args: { email: string }
        Returns: boolean
      }
      is_valid_phone: {
        Args: { phone: string }
        Returns: boolean
      }
      record_staff_earning: {
        Args: {
          p_commission_rate?: number
          p_notes?: string
          p_service_amount: number
          p_service_date: string
          p_service_name: string
          p_staff_id: string
          p_tip_amount?: number
        }
        Returns: string
      }
      refresh_active_user_roles: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      refresh_audit_summary: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      remove_customer_tag: {
        Args: { p_customer_id: string; p_tag: string }
        Returns: undefined
      }
      run_full_health_check: {
        Args: Record<PropertyKey, never>
        Returns: {
          action_required: string
          category: string
          check_name: string
          details: string
          status: string
        }[]
      }
      sanitize_input: {
        Args: { input: string }
        Returns: string
      }
      schedule_maintenance: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      search_available_appointments: {
        Args: {
          p_date_from?: string
          p_date_to?: string
          p_location_id?: string
          p_salon_id: string
          p_service_id?: string
          p_staff_id?: string
          p_time_from?: string
          p_time_to?: string
        }
        Returns: {
          available_date: string
          available_time: string
          service_duration: number
          staff_id: string
          staff_name: string
        }[]
      }
      seed_default_settings: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_dashboard_metrics: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      vacuum_tables: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      validate_csrf_token: {
        Args: { p_token: string }
        Returns: boolean
      }
      validate_email: {
        Args: { email: string }
        Returns: boolean
      }
      validate_phone: {
        Args: { phone: string }
        Returns: boolean
      }
      validate_uuid: {
        Args: { id: string }
        Returns: boolean
      }
    }
    Enums: {
      appointment_status:
        | "pending"
        | "confirmed"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "no_show"
      break_type: "lunch" | "break" | "other"
      notification_type:
        | "appointment_confirmation"
        | "appointment_reminder"
        | "appointment_cancelled"
        | "staff_message"
        | "promotion"
        | "system"
        | "loyalty_points"
      preference_type: "allergies" | "preferences" | "restrictions"
      user_role_type:
        | "super_admin"
        | "salon_owner"
        | "location_manager"
        | "staff"
        | "customer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]
export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never
export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never
export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never
export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never
export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
export const Constants = {
  public: {
    Enums: {
      appointment_status: [
        "pending",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
        "no_show",
      ],
      break_type: ["lunch", "break", "other"],
      notification_type: [
        "appointment_confirmation",
        "appointment_reminder",
        "appointment_cancelled",
        "staff_message",
        "promotion",
        "system",
        "loyalty_points",
      ],
      preference_type: ["allergies", "preferences", "restrictions"],
      user_role_type: [
        "super_admin",
        "salon_owner",
        "location_manager",
        "staff",
        "customer",
      ],
    },
  },
} as const
