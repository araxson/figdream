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
      alert_configuration: {
        Row: {
          alert_name: string
          check_frequency_minutes: number | null
          created_at: string
          critical_threshold: number | null
          id: string
          is_enabled: boolean | null
          metric_name: string
          notification_channels: string[] | null
          updated_at: string
          warning_threshold: number | null
        }
        Insert: {
          alert_name: string
          check_frequency_minutes?: number | null
          created_at?: string
          critical_threshold?: number | null
          id?: string
          is_enabled?: boolean | null
          metric_name: string
          notification_channels?: string[] | null
          updated_at?: string
          warning_threshold?: number | null
        }
        Update: {
          alert_name?: string
          check_frequency_minutes?: number | null
          created_at?: string
          critical_threshold?: number | null
          id?: string
          is_enabled?: boolean | null
          metric_name?: string
          notification_channels?: string[] | null
          updated_at?: string
          warning_threshold?: number | null
        }
        Relationships: []
      }
      alert_history: {
        Row: {
          alert_name: string
          context: Json | null
          id: string
          message: string | null
          metric_value: number | null
          resolved_at: string | null
          severity: string | null
          threshold_exceeded: number | null
          triggered_at: string | null
        }
        Insert: {
          alert_name: string
          context?: Json | null
          id?: string
          message?: string | null
          metric_value?: number | null
          resolved_at?: string | null
          severity?: string | null
          threshold_exceeded?: number | null
          triggered_at?: string | null
        }
        Update: {
          alert_name?: string
          context?: Json | null
          id?: string
          message?: string | null
          metric_value?: number | null
          resolved_at?: string | null
          severity?: string | null
          threshold_exceeded?: number | null
          triggered_at?: string | null
        }
        Relationships: []
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
          salon_id: string
          status_code: number | null
          updated_at: string
          user_agent: string | null
          user_id: string
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
          salon_id: string
          status_code?: number | null
          updated_at?: string
          user_agent?: string | null
          user_id: string
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
          salon_id?: string
          status_code?: number | null
          updated_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_usage_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "mv_salon_dashboard"
            referencedColumns: ["salon_id"]
          },
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
            foreignKeyName: "appointment_notes_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "revenue_summary"
            referencedColumns: ["appointment_id"]
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
          updated_at: string
        }
        Insert: {
          appointment_id: string
          created_at?: string
          display_order?: number | null
          duration_minutes: number
          id?: string
          price: number
          service_id: string
          updated_at?: string
        }
        Update: {
          appointment_id?: string
          created_at?: string
          display_order?: number | null
          duration_minutes?: number
          id?: string
          price?: number
          service_id?: string
          updated_at?: string
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
            foreignKeyName: "appointment_services_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "revenue_summary"
            referencedColumns: ["appointment_id"]
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
          computed_total_duration: number | null
          computed_total_price: number | null
          confirmed_at: string | null
          created_at: string
          customer_id: string
          end_time: string
          id: string
          internal_notes: string | null
          is_walk_in: boolean
          location_id: string
          manual_tip_amount: number | null
          manual_total_amount: number | null
          notes: string | null
          payment_collected: boolean | null
          payment_collected_at: string | null
          payment_collected_by: string | null
          payment_method: string | null
          salon_id: string
          services: Json | null
          staff_id: string
          start_time: string
          status: Database["public"]["Enums"]["appointment_status"]
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
          computed_total_duration?: number | null
          computed_total_price?: number | null
          confirmed_at?: string | null
          created_at?: string
          customer_id: string
          end_time: string
          id?: string
          internal_notes?: string | null
          is_walk_in?: boolean
          location_id: string
          manual_tip_amount?: number | null
          manual_total_amount?: number | null
          notes?: string | null
          payment_collected?: boolean | null
          payment_collected_at?: string | null
          payment_collected_by?: string | null
          payment_method?: string | null
          salon_id: string
          services?: Json | null
          staff_id: string
          start_time: string
          status?: Database["public"]["Enums"]["appointment_status"]
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
          computed_total_duration?: number | null
          computed_total_price?: number | null
          confirmed_at?: string | null
          created_at?: string
          customer_id?: string
          end_time?: string
          id?: string
          internal_notes?: string | null
          is_walk_in?: boolean
          location_id?: string
          manual_tip_amount?: number | null
          manual_total_amount?: number | null
          notes?: string | null
          payment_collected?: boolean | null
          payment_collected_at?: string | null
          payment_collected_by?: string | null
          payment_method?: string | null
          salon_id?: string
          services?: Json | null
          staff_id?: string
          start_time?: string
          status?: Database["public"]["Enums"]["appointment_status"]
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
            foreignKeyName: "appointments_payment_collected_by_fkey"
            columns: ["payment_collected_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "mv_salon_dashboard"
            referencedColumns: ["salon_id"]
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
          updated_at: string
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
          updated_at?: string
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
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "mv_salon_dashboard"
            referencedColumns: ["salon_id"]
          },
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
          created_at: string
          id: string
          summary_data: Json | null
          summary_date: string
          total_records: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          summary_data?: Json | null
          summary_date: string
          total_records?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          summary_data?: Json | null
          summary_date?: string
          total_records?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      auth_otp_attempts: {
        Row: {
          attempts: number | null
          created_at: string
          email: string
          id: string
          last_attempt_at: string | null
          locked_until_at: string | null
          otp_type: string
          updated_at: string
        }
        Insert: {
          attempts?: number | null
          created_at?: string
          email: string
          id?: string
          last_attempt_at?: string | null
          locked_until_at?: string | null
          otp_type: string
          updated_at?: string
        }
        Update: {
          attempts?: number | null
          created_at?: string
          email?: string
          id?: string
          last_attempt_at?: string | null
          locked_until_at?: string | null
          otp_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      auth_otp_config: {
        Row: {
          config_type: string
          cooldown_seconds: number | null
          created_at: string
          id: string
          is_enabled: boolean | null
          max_attempts: number | null
          otp_expiry_seconds: number | null
          otp_length: number | null
          updated_at: string
        }
        Insert: {
          config_type: string
          cooldown_seconds?: number | null
          created_at?: string
          id?: string
          is_enabled?: boolean | null
          max_attempts?: number | null
          otp_expiry_seconds?: number | null
          otp_length?: number | null
          updated_at?: string
        }
        Update: {
          config_type?: string
          cooldown_seconds?: number | null
          created_at?: string
          id?: string
          is_enabled?: boolean | null
          max_attempts?: number | null
          otp_expiry_seconds?: number | null
          otp_length?: number | null
          updated_at?: string
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
          updated_at: string
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
          updated_at?: string
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
          updated_at?: string
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
            referencedRelation: "mv_salon_dashboard"
            referencedColumns: ["salon_id"]
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
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      csrf_tokens: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          is_used: boolean | null
          session_id: string | null
          session_uuid: string | null
          token: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          is_used?: boolean | null
          session_id?: string | null
          session_uuid?: string | null
          token: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          is_used?: boolean | null
          session_id?: string | null
          session_uuid?: string | null
          token?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "csrf_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_engagement_analytics: {
        Row: {
          avg_visit_value: number | null
          customer_id: string | null
          customer_name: string | null
          customer_segment: string | null
          engagement_score: number | null
          id: string
          last_updated_at: string | null
          last_visit_date: string | null
          salon_id: string
          total_spent: number | null
          total_visits: number | null
        }
        Insert: {
          avg_visit_value?: number | null
          customer_id?: string | null
          customer_name?: string | null
          customer_segment?: string | null
          engagement_score?: number | null
          id?: string
          last_updated_at?: string | null
          last_visit_date?: string | null
          salon_id: string
          total_spent?: number | null
          total_visits?: number | null
        }
        Update: {
          avg_visit_value?: number | null
          customer_id?: string | null
          customer_name?: string | null
          customer_segment?: string | null
          engagement_score?: number | null
          id?: string
          last_updated_at?: string | null
          last_visit_date?: string | null
          salon_id?: string
          total_spent?: number | null
          total_visits?: number | null
        }
        Relationships: []
      }
      customer_favorites: {
        Row: {
          created_at: string
          customer_id: string
          favorite_type: string
          id: string
          salon_id: string
          service_id: string
          staff_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          favorite_type: string
          id?: string
          salon_id: string
          service_id: string
          staff_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          favorite_type?: string
          id?: string
          salon_id?: string
          service_id?: string
          staff_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_favorites_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_favorites_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "mv_salon_dashboard"
            referencedColumns: ["salon_id"]
          },
          {
            foreignKeyName: "customer_favorites_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_favorites_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_favorites_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
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
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          preference_type: Database["public"]["Enums"]["preference_type"]
          preference_value: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          preference_type?: Database["public"]["Enums"]["preference_type"]
          preference_value?: string
          updated_at?: string
        }
        Relationships: [
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
          computed_avg_appointment_value: number | null
          computed_total_spent: number | null
          computed_total_visits: number | null
          created_at: string
          customer_since: string | null
          email: string | null
          first_name: string | null
          has_tags: boolean | null
          id: string
          is_vip: boolean
          last_name: string | null
          last_visit_date: string | null
          notes: string | null
          phone: string | null
          preferred_staff_id: string | null
          referral_source: string | null
          salon_id: string
          tags: string[] | null
          total_spent: number | null
          updated_at: string
          user_id: string
          visit_count: number
        }
        Insert: {
          computed_avg_appointment_value?: number | null
          computed_total_spent?: number | null
          computed_total_visits?: number | null
          created_at?: string
          customer_since?: string | null
          email?: string | null
          first_name?: string | null
          has_tags?: boolean | null
          id?: string
          is_vip?: boolean
          last_name?: string | null
          last_visit_date?: string | null
          notes?: string | null
          phone?: string | null
          preferred_staff_id?: string | null
          referral_source?: string | null
          salon_id: string
          tags?: string[] | null
          total_spent?: number | null
          updated_at?: string
          user_id: string
          visit_count?: number
        }
        Update: {
          computed_avg_appointment_value?: number | null
          computed_total_spent?: number | null
          computed_total_visits?: number | null
          created_at?: string
          customer_since?: string | null
          email?: string | null
          first_name?: string | null
          has_tags?: boolean | null
          id?: string
          is_vip?: boolean
          last_name?: string | null
          last_visit_date?: string | null
          notes?: string | null
          phone?: string | null
          preferred_staff_id?: string | null
          referral_source?: string | null
          salon_id?: string
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
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "mv_salon_dashboard"
            referencedColumns: ["salon_id"]
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
          created_at: string
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
          updated_at: string
        }
        Insert: {
          appointments_booked?: number | null
          appointments_cancelled?: number | null
          appointments_completed?: number | null
          appointments_no_show?: number | null
          average_service_time?: number | null
          average_ticket?: number | null
          created_at?: string
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
          updated_at?: string
        }
        Update: {
          appointments_booked?: number | null
          appointments_cancelled?: number | null
          appointments_completed?: number | null
          appointments_no_show?: number | null
          average_service_time?: number | null
          average_ticket?: number | null
          created_at?: string
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
          updated_at?: string
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
            referencedRelation: "mv_salon_dashboard"
            referencedColumns: ["salon_id"]
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
      developer_guide: {
        Row: {
          category: string
          code_example: string | null
          content: string
          created_at: string | null
          display_order: number | null
          id: string
          important_notes: string | null
          title: string
        }
        Insert: {
          category: string
          code_example?: string | null
          content: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          important_notes?: string | null
          title: string
        }
        Update: {
          category?: string
          code_example?: string | null
          content?: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          important_notes?: string | null
          title?: string
        }
        Relationships: []
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
          updated_at: string
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
          updated_at?: string
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
          updated_at?: string
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
          template_uuid: string | null
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
          template_uuid?: string | null
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
          template_uuid?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_campaigns_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "mv_salon_dashboard"
            referencedColumns: ["salon_id"]
          },
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
          updated_at: string
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
          updated_at?: string
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
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "error_logs_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "mv_salon_dashboard"
            referencedColumns: ["salon_id"]
          },
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
          created_at: string
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
          last_run_at: string | null
          next_run_at: string | null
          salon_id: string
          schedule_day: number | null
          schedule_frequency: string | null
          schedule_time: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
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
          last_run_at?: string | null
          next_run_at?: string | null
          salon_id: string
          schedule_day?: number | null
          schedule_frequency?: string | null
          schedule_time?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
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
          last_run_at?: string | null
          next_run_at?: string | null
          salon_id?: string
          schedule_day?: number | null
          schedule_frequency?: string | null
          schedule_time?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "export_configurations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "export_configurations_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "mv_salon_dashboard"
            referencedColumns: ["salon_id"]
          },
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
          created_at: string
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
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          configuration_id?: string | null
          created_at?: string
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
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          configuration_id?: string | null
          created_at?: string
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
          updated_at?: string
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
            foreignKeyName: "export_history_exported_by_fkey"
            columns: ["exported_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "export_history_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "mv_salon_dashboard"
            referencedColumns: ["salon_id"]
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
      faq_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          slug: string
          sort_order: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      faq_questions: {
        Row: {
          answer: string
          category_id: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          question: string
          sort_order: number
          updated_at: string | null
        }
        Insert: {
          answer: string
          category_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          question: string
          sort_order?: number
          updated_at?: string | null
        }
        Update: {
          answer?: string
          category_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          question?: string
          sort_order?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "faq_questions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "faq_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_settings: {
        Row: {
          created_at: string
          id: string
          is_email_appointments_enabled: boolean | null
          is_email_marketing_enabled: boolean | null
          is_email_reminders_enabled: boolean | null
          is_push_appointments_enabled: boolean | null
          is_push_marketing_enabled: boolean | null
          is_push_reminders_enabled: boolean | null
          is_sms_appointments_enabled: boolean | null
          is_sms_marketing_enabled: boolean | null
          is_sms_reminders_enabled: boolean | null
          reminder_hours_before: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_email_appointments_enabled?: boolean | null
          is_email_marketing_enabled?: boolean | null
          is_email_reminders_enabled?: boolean | null
          is_push_appointments_enabled?: boolean | null
          is_push_marketing_enabled?: boolean | null
          is_push_reminders_enabled?: boolean | null
          is_sms_appointments_enabled?: boolean | null
          is_sms_marketing_enabled?: boolean | null
          is_sms_reminders_enabled?: boolean | null
          reminder_hours_before?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_email_appointments_enabled?: boolean | null
          is_email_marketing_enabled?: boolean | null
          is_email_reminders_enabled?: boolean | null
          is_push_appointments_enabled?: boolean | null
          is_push_marketing_enabled?: boolean | null
          is_push_reminders_enabled?: boolean | null
          is_sms_appointments_enabled?: boolean | null
          is_sms_marketing_enabled?: boolean | null
          is_sms_reminders_enabled?: boolean | null
          reminder_hours_before?: number | null
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
          updated_at: string
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
          updated_at?: string
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
          updated_at?: string
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
      otp_verifications: {
        Row: {
          attempts: number | null
          created_at: string
          email: string
          expires_at: string
          id: string
          is_verified: boolean | null
          max_attempts: number | null
          metadata: Json | null
          otp_code: string
          otp_type: string
          updated_at: string
          user_id: string | null
          verified_at: string | null
        }
        Insert: {
          attempts?: number | null
          created_at?: string
          email: string
          expires_at: string
          id?: string
          is_verified?: boolean | null
          max_attempts?: number | null
          metadata?: Json | null
          otp_code: string
          otp_type: string
          updated_at?: string
          user_id?: string | null
          verified_at?: string | null
        }
        Update: {
          attempts?: number | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          is_verified?: boolean | null
          max_attempts?: number | null
          metadata?: Json | null
          otp_code?: string
          otp_type?: string
          updated_at?: string
          user_id?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "otp_verifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      password_history: {
        Row: {
          created_at: string
          id: string
          password_hash: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          password_hash: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          password_hash?: string
          user_id?: string
        }
        Relationships: []
      }
      password_reset_tokens: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          is_verified: boolean | null
          token: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          expires_at: string
          id?: string
          is_verified?: boolean | null
          token: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          is_verified?: boolean | null
          token?: string
          updated_at?: string
        }
        Relationships: []
      }
      password_security_audit: {
        Row: {
          created_at: string
          details: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      performance_trends: {
        Row: {
          current_value: number | null
          id: string
          metric_category: string
          metric_name: string
          percentage_change: number | null
          previous_value: number | null
          recorded_at: string | null
          trend_direction: string | null
        }
        Insert: {
          current_value?: number | null
          id?: string
          metric_category: string
          metric_name: string
          percentage_change?: number | null
          previous_value?: number | null
          recorded_at?: string | null
          trend_direction?: string | null
        }
        Update: {
          current_value?: number | null
          id?: string
          metric_category?: string
          metric_name?: string
          percentage_change?: number | null
          previous_value?: number | null
          recorded_at?: string | null
          trend_direction?: string | null
        }
        Relationships: []
      }
      platform_subscription_plans: {
        Row: {
          billing_notes: string | null
          billing_period: string
          created_at: string
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
          updated_at: string
        }
        Insert: {
          billing_notes?: string | null
          billing_period: string
          created_at?: string
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
          updated_at?: string
        }
        Update: {
          billing_notes?: string | null
          billing_period?: string
          created_at?: string
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
          updated_at?: string
        }
        Relationships: []
      }
      platform_subscriptions: {
        Row: {
          amount: number
          cancel_at_period_end: boolean | null
          created_at: string
          current_period_end: string
          current_period_start: string
          id: string
          plan_id: string
          salon_id: string
          status: string
          stripe_customer_id: string | null
          stripe_status: string | null
          stripe_subscription_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end: string
          current_period_start: string
          id?: string
          plan_id: string
          salon_id: string
          status: string
          stripe_customer_id?: string | null
          stripe_status?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          id?: string
          plan_id?: string
          salon_id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_status?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
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
            referencedRelation: "mv_salon_dashboard"
            referencedColumns: ["salon_id"]
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
      pricing_features: {
        Row: {
          created_at: string | null
          feature_text: string
          id: string
          is_additional: boolean | null
          is_included: boolean | null
          plan_id: string | null
          sort_order: number
        }
        Insert: {
          created_at?: string | null
          feature_text: string
          id?: string
          is_additional?: boolean | null
          is_included?: boolean | null
          plan_id?: string | null
          sort_order?: number
        }
        Update: {
          created_at?: string | null
          feature_text?: string
          id?: string
          is_additional?: boolean | null
          is_included?: boolean | null
          plan_id?: string | null
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "pricing_features_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "pricing_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_plans: {
        Row: {
          created_at: string | null
          description: string
          id: string
          is_popular: boolean | null
          monthly_price: number
          name: string
          savings_text: string | null
          slug: string
          sort_order: number
          updated_at: string | null
          yearly_price: number
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          is_popular?: boolean | null
          monthly_price: number
          name: string
          savings_text?: string | null
          slug: string
          sort_order?: number
          updated_at?: string | null
          yearly_price: number
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          is_popular?: boolean | null
          monthly_price?: number
          name?: string
          savings_text?: string | null
          slug?: string
          sort_order?: number
          updated_at?: string | null
          yearly_price?: number
        }
        Relationships: []
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
          user_id: string
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
          user_id: string
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
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          ip_address: unknown | null
          request_count: number | null
          updated_at: string
          user_id: string
          window_start_at: string | null
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          ip_address?: unknown | null
          request_count?: number | null
          updated_at?: string
          user_id: string
          window_start_at?: string | null
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          ip_address?: unknown | null
          request_count?: number | null
          updated_at?: string
          user_id?: string
          window_start_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rate_limits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      review_requests: {
        Row: {
          appointment_id: string
          click_token: string | null
          clicked_at: string | null
          created_at: string
          customer_id: string
          follow_up_count: number | null
          id: string
          last_follow_up_at: string | null
          opened_at: string | null
          personalization_data: Json | null
          rating_given: number | null
          request_type: string
          review_id: string | null
          reviewed_at: string | null
          salon_id: string
          scheduled_for_at: string
          sent_at: string | null
          staff_id: string | null
          status: string
          template_used: string | null
          updated_at: string
        }
        Insert: {
          appointment_id: string
          click_token?: string | null
          clicked_at?: string | null
          created_at?: string
          customer_id: string
          follow_up_count?: number | null
          id?: string
          last_follow_up_at?: string | null
          opened_at?: string | null
          personalization_data?: Json | null
          rating_given?: number | null
          request_type: string
          review_id?: string | null
          reviewed_at?: string | null
          salon_id: string
          scheduled_for_at?: string
          sent_at?: string | null
          staff_id?: string | null
          status?: string
          template_used?: string | null
          updated_at?: string
        }
        Update: {
          appointment_id?: string
          click_token?: string | null
          clicked_at?: string | null
          created_at?: string
          customer_id?: string
          follow_up_count?: number | null
          id?: string
          last_follow_up_at?: string | null
          opened_at?: string | null
          personalization_data?: Json | null
          rating_given?: number | null
          request_type?: string
          review_id?: string | null
          reviewed_at?: string | null
          salon_id?: string
          scheduled_for_at?: string
          sent_at?: string | null
          staff_id?: string | null
          status?: string
          template_used?: string | null
          updated_at?: string
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
            foreignKeyName: "review_requests_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "revenue_summary"
            referencedColumns: ["appointment_id"]
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
            referencedRelation: "mv_salon_dashboard"
            referencedColumns: ["salon_id"]
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
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          appointment_id: string
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
          appointment_id: string
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
          appointment_id?: string
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
            foreignKeyName: "reviews_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "revenue_summary"
            referencedColumns: ["appointment_id"]
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
            referencedRelation: "mv_salon_dashboard"
            referencedColumns: ["salon_id"]
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
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permission_templates: {
        Row: {
          can_create: boolean | null
          can_delete: boolean | null
          can_read: boolean | null
          can_update: boolean | null
          created_at: string
          description: string | null
          id: string
          permission_category: string
          permission_name: string
          role_type: Database["public"]["Enums"]["user_role_type"]
          scope: string | null
          updated_at: string
        }
        Insert: {
          can_create?: boolean | null
          can_delete?: boolean | null
          can_read?: boolean | null
          can_update?: boolean | null
          created_at?: string
          description?: string | null
          id?: string
          permission_category: string
          permission_name: string
          role_type: Database["public"]["Enums"]["user_role_type"]
          scope?: string | null
          updated_at?: string
        }
        Update: {
          can_create?: boolean | null
          can_delete?: boolean | null
          can_read?: boolean | null
          can_update?: boolean | null
          created_at?: string
          description?: string | null
          id?: string
          permission_category?: string
          permission_name?: string
          role_type?: Database["public"]["Enums"]["user_role_type"]
          scope?: string | null
          updated_at?: string
        }
        Relationships: []
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
            referencedRelation: "mv_salon_dashboard"
            referencedColumns: ["salon_id"]
          },
          {
            foreignKeyName: "salon_locations_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      salon_performance_analytics: {
        Row: {
          avg_appointment_value: number | null
          customer_count: number | null
          id: string
          last_updated_at: string | null
          period_end: string | null
          period_start: string | null
          salon_id: string
          salon_name: string | null
          staff_count: number | null
          total_appointments: number | null
          total_revenue: number | null
        }
        Insert: {
          avg_appointment_value?: number | null
          customer_count?: number | null
          id?: string
          last_updated_at?: string | null
          period_end?: string | null
          period_start?: string | null
          salon_id: string
          salon_name?: string | null
          staff_count?: number | null
          total_appointments?: number | null
          total_revenue?: number | null
        }
        Update: {
          avg_appointment_value?: number | null
          customer_count?: number | null
          id?: string
          last_updated_at?: string | null
          period_end?: string | null
          period_start?: string | null
          salon_id?: string
          salon_name?: string | null
          staff_count?: number | null
          total_appointments?: number | null
          total_revenue?: number | null
        }
        Relationships: []
      }
      salons: {
        Row: {
          address: string | null
          created_at: string
          created_by: string | null
          description: string | null
          email: string
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
          address?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          email: string
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
          address?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          email?: string
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
            referencedRelation: "mv_salon_dashboard"
            referencedColumns: ["salon_id"]
          },
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
          created_at: string
          equipment_cost: number | null
          gross_margin: number | null
          id: string
          last_calculated_at: string | null
          margin_percentage: number | null
          overhead_allocation: number | null
          product_cost: number | null
          salon_id: string
          service_id: string
          setup_time_minutes: number | null
          supply_cost: number | null
          total_cost: number | null
          updated_at: string
        }
        Insert: {
          average_duration_minutes?: number | null
          average_price?: number | null
          cleanup_time_minutes?: number | null
          created_at?: string
          equipment_cost?: number | null
          gross_margin?: number | null
          id?: string
          last_calculated_at?: string | null
          margin_percentage?: number | null
          overhead_allocation?: number | null
          product_cost?: number | null
          salon_id: string
          service_id: string
          setup_time_minutes?: number | null
          supply_cost?: number | null
          total_cost?: number | null
          updated_at?: string
        }
        Update: {
          average_duration_minutes?: number | null
          average_price?: number | null
          cleanup_time_minutes?: number | null
          created_at?: string
          equipment_cost?: number | null
          gross_margin?: number | null
          id?: string
          last_calculated_at?: string | null
          margin_percentage?: number | null
          overhead_allocation?: number | null
          product_cost?: number | null
          salon_id?: string
          service_id?: string
          setup_time_minutes?: number | null
          supply_cost?: number | null
          total_cost?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_costs_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "mv_salon_dashboard"
            referencedColumns: ["salon_id"]
          },
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
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_available?: boolean
          location_id: string
          override_price?: number | null
          service_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_available?: boolean
          location_id?: string
          override_price?: number | null
          service_id?: string
          updated_at?: string
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
          has_equipment_needed: boolean | null
          has_metadata_tags: boolean | null
          has_special_requirements: boolean | null
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
          has_equipment_needed?: boolean | null
          has_metadata_tags?: boolean | null
          has_special_requirements?: boolean | null
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
          has_equipment_needed?: boolean | null
          has_metadata_tags?: boolean | null
          has_special_requirements?: boolean | null
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
            referencedRelation: "mv_salon_dashboard"
            referencedColumns: ["salon_id"]
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
          salon_id: string
          setting_key: string
          setting_value: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          location_id?: string | null
          salon_id: string
          setting_key: string
          setting_value: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          location_id?: string | null
          salon_id?: string
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
            referencedRelation: "mv_salon_dashboard"
            referencedColumns: ["salon_id"]
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
          conversion_date_only: string | null
          converted: boolean | null
          created_at: string
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
          updated_at: string
        }
        Insert: {
          campaign_id: string
          clicked_at?: string | null
          conversion_amount?: number | null
          conversion_date?: string | null
          conversion_date_only?: string | null
          converted?: boolean | null
          created_at?: string
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
          updated_at?: string
        }
        Update: {
          campaign_id?: string
          clicked_at?: string | null
          conversion_amount?: number | null
          conversion_date?: string | null
          conversion_date_only?: string | null
          converted?: boolean | null
          created_at?: string
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
          updated_at?: string
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
          created_at: string
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
          updated_at: string
          use_shortlinks: boolean | null
        }
        Insert: {
          campaign_type: string
          clicked_count?: number | null
          completed_at?: string | null
          conversion_count?: number | null
          conversion_window_hours?: number | null
          created_at?: string
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
          updated_at?: string
          use_shortlinks?: boolean | null
        }
        Update: {
          campaign_type?: string
          clicked_count?: number | null
          completed_at?: string | null
          conversion_count?: number | null
          conversion_window_hours?: number | null
          created_at?: string
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
          updated_at?: string
          use_shortlinks?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "sms_campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sms_campaigns_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "mv_salon_dashboard"
            referencedColumns: ["salon_id"]
          },
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
          updated_at: string
        }
        Insert: {
          id?: string
          opted_out_at?: string | null
          phone_number: string
          reason?: string | null
          salon_id?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          opted_out_at?: string | null
          phone_number?: string
          reason?: string | null
          salon_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sms_opt_outs_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "mv_salon_dashboard"
            referencedColumns: ["salon_id"]
          },
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
          updated_at: string
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
          updated_at?: string
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
          updated_at?: string
        }
        Relationships: [
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
          category: string | null
          commission_amount: number | null
          commission_rate: number | null
          created_at: string
          customer_name: string | null
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
          updated_at: string
        }
        Insert: {
          appointment_id?: string | null
          category?: string | null
          commission_amount?: number | null
          commission_rate?: number | null
          created_at?: string
          customer_name?: string | null
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
          updated_at?: string
        }
        Update: {
          appointment_id?: string | null
          category?: string | null
          commission_amount?: number | null
          commission_rate?: number | null
          created_at?: string
          customer_name?: string | null
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
          updated_at?: string
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
            foreignKeyName: "staff_earnings_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "revenue_summary"
            referencedColumns: ["appointment_id"]
          },
          {
            foreignKeyName: "staff_earnings_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "salon_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_earnings_paid_out_by_fkey"
            columns: ["paid_out_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_earnings_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_earnings_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "mv_salon_dashboard"
            referencedColumns: ["salon_id"]
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
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_invitations: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invitation_token: string
          invited_by: string
          location_id: string | null
          metadata: Json | null
          role: string
          salon_id: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invitation_token?: string
          invited_by: string
          location_id?: string | null
          metadata?: Json | null
          role?: string
          salon_id: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invitation_token?: string
          invited_by?: string
          location_id?: string | null
          metadata?: Json | null
          role?: string
          salon_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_invitations_accepted_by_fkey"
            columns: ["accepted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_invitations_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "mv_salon_dashboard"
            referencedColumns: ["salon_id"]
          },
          {
            foreignKeyName: "staff_invitations_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
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
          employee_uuid: string | null
          has_portfolio: boolean | null
          has_specialties: boolean | null
          hire_date: string | null
          id: string
          is_active: boolean
          is_bookable: boolean
          location_id: string | null
          portfolio_images: string[] | null
          salon_id: string
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
          employee_uuid?: string | null
          has_portfolio?: boolean | null
          has_specialties?: boolean | null
          hire_date?: string | null
          id?: string
          is_active?: boolean
          is_bookable?: boolean
          location_id?: string | null
          portfolio_images?: string[] | null
          salon_id: string
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
          employee_uuid?: string | null
          has_portfolio?: boolean | null
          has_specialties?: boolean | null
          hire_date?: string | null
          id?: string
          is_active?: boolean
          is_bookable?: boolean
          location_id?: string | null
          portfolio_images?: string[] | null
          salon_id?: string
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
            referencedRelation: "mv_salon_dashboard"
            referencedColumns: ["salon_id"]
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
          updated_at: string
        }
        Insert: {
          can_perform?: boolean
          created_at?: string
          custom_duration?: number | null
          id?: string
          service_id: string
          staff_id: string
          updated_at?: string
        }
        Update: {
          can_perform?: boolean
          created_at?: string
          custom_duration?: number | null
          id?: string
          service_id?: string
          staff_id?: string
          updated_at?: string
        }
        Relationships: [
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
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          specialty: string
          staff_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          specialty?: string
          staff_id?: string
          updated_at?: string
        }
        Relationships: [
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
          created_at: string
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
          updated_at: string
          utilization_date: string
          utilization_rate: number | null
          worked_hours: number | null
        }
        Insert: {
          average_service_time?: number | null
          break_hours?: number | null
          client_satisfaction?: number | null
          created_at?: string
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
          updated_at?: string
          utilization_date: string
          utilization_rate?: number | null
          worked_hours?: number | null
        }
        Update: {
          average_service_time?: number | null
          break_hours?: number | null
          client_satisfaction?: number | null
          created_at?: string
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
          updated_at?: string
          utilization_date?: string
          utilization_rate?: number | null
          worked_hours?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_utilization_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "mv_salon_dashboard"
            referencedColumns: ["salon_id"]
          },
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
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_utilization_analytics: {
        Row: {
          avg_service_time: number | null
          efficiency_score: number | null
          id: string
          last_updated: string | null
          period_end: string | null
          period_start: string | null
          revenue_generated: number | null
          salon_id: string
          staff_id: string | null
          staff_name: string | null
          total_appointments: number | null
          total_hours_worked: number | null
          utilization_rate: number | null
        }
        Insert: {
          avg_service_time?: number | null
          efficiency_score?: number | null
          id?: string
          last_updated?: string | null
          period_end?: string | null
          period_start?: string | null
          revenue_generated?: number | null
          salon_id: string
          staff_id?: string | null
          staff_name?: string | null
          total_appointments?: number | null
          total_hours_worked?: number | null
          utilization_rate?: number | null
        }
        Update: {
          avg_service_time?: number | null
          efficiency_score?: number | null
          id?: string
          last_updated?: string | null
          period_end?: string | null
          period_start?: string | null
          revenue_generated?: number | null
          salon_id?: string
          staff_id?: string | null
          staff_name?: string | null
          total_appointments?: number | null
          total_hours_worked?: number | null
          utilization_rate?: number | null
        }
        Relationships: []
      }
      system_configuration: {
        Row: {
          config_key: string
          config_value: Json
          created_at: string
          description: string | null
          has_nested_config: boolean | null
          id: string
          updated_at: string
        }
        Insert: {
          config_key: string
          config_value: Json
          created_at?: string
          description?: string | null
          has_nested_config?: boolean | null
          id?: string
          updated_at?: string
        }
        Update: {
          config_key?: string
          config_value?: Json
          created_at?: string
          description?: string | null
          has_nested_config?: boolean | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      system_health_metrics: {
        Row: {
          collected_at: string | null
          context: Json | null
          id: string
          metric_name: string
          metric_unit: string | null
          metric_value: number | null
          status: string | null
          threshold_critical: number | null
          threshold_warning: number | null
        }
        Insert: {
          collected_at?: string | null
          context?: Json | null
          id?: string
          metric_name: string
          metric_unit?: string | null
          metric_value?: number | null
          status?: string | null
          threshold_critical?: number | null
          threshold_warning?: number | null
        }
        Update: {
          collected_at?: string | null
          context?: Json | null
          id?: string
          metric_name?: string
          metric_unit?: string | null
          metric_value?: number | null
          status?: string | null
          threshold_critical?: number | null
          threshold_warning?: number | null
        }
        Relationships: []
      }
      team_members: {
        Row: {
          bio: string | null
          created_at: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          role: string
          sort_order: number
          updated_at: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          role: string
          sort_order?: number
          updated_at?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          role?: string
          sort_order?: number
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
            foreignKeyName: "time_off_requests_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
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
          salon_id: string
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
          salon_id: string
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
          salon_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
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
            referencedRelation: "mv_salon_dashboard"
            referencedColumns: ["salon_id"]
          },
          {
            foreignKeyName: "user_roles_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      connection_pool_monitor: {
        Row: {
          avg_duration_seconds: number | null
          connection_count: number | null
          state: string | null
        }
        Relationships: []
      }
      current_system_status: {
        Row: {
          collected_at: string | null
          critical_threshold: number | null
          metric_name: string | null
          metric_unit: string | null
          metric_value: number | null
          status: string | null
          warning_threshold: number | null
        }
        Relationships: []
      }
      database_architecture_overview: {
        Row: {
          object_count: number | null
          object_type: string | null
          total_size: string | null
        }
        Relationships: []
      }
      database_performance_metrics: {
        Row: {
          metric_category: string | null
          metric_name: string | null
          metric_value: string | null
        }
        Relationships: []
      }
      database_performance_monitor: {
        Row: {
          active_connections: number | null
          database_name: unknown | null
          database_size: string | null
          idle_connections: number | null
          last_updated: string | null
        }
        Relationships: []
      }
      index_performance_monitor: {
        Row: {
          efficiency_pct: number | null
          index_size: string | null
          indexname: unknown | null
          schemaname: unknown | null
          tablename: unknown | null
          times_used: number | null
          tuples_fetched: number | null
          tuples_read: number | null
        }
        Relationships: []
      }
      mv_salon_dashboard: {
        Row: {
          active_staff: number | null
          appointments_today: number | null
          appointments_upcoming: number | null
          average_rating: number | null
          salon_id: string | null
          salon_name: string | null
          total_customers: number | null
          total_reviews: number | null
        }
        Relationships: []
      }
      performance_metrics: {
        Row: {
          active_connections: number | null
          cache_hit_ratio: number | null
          slow_queries_count: number | null
          snapshot_time: string | null
          tables_needing_vacuum: number | null
        }
        Relationships: []
      }
      recent_alerts: {
        Row: {
          alert_name: string | null
          alert_status: string | null
          message: string | null
          metric_value: number | null
          severity: string | null
          threshold_exceeded: number | null
          triggered_at: string | null
        }
        Insert: {
          alert_name?: string | null
          alert_status?: never
          message?: string | null
          metric_value?: number | null
          severity?: string | null
          threshold_exceeded?: number | null
          triggered_at?: string | null
        }
        Update: {
          alert_name?: string | null
          alert_status?: never
          message?: string | null
          metric_value?: number | null
          severity?: string | null
          threshold_exceeded?: number | null
          triggered_at?: string | null
        }
        Relationships: []
      }
      revenue_summary: {
        Row: {
          appointment_date: string | null
          appointment_id: string | null
          created_at: string | null
          customer_id: string | null
          is_walk_in: boolean | null
          payment_collected: boolean | null
          payment_method: string | null
          salon_id: string | null
          staff_id: string | null
          status: Database["public"]["Enums"]["appointment_status"] | null
          tip_amount: number | null
          total_amount: number | null
          total_revenue: number | null
          updated_at: string | null
        }
        Insert: {
          appointment_date?: string | null
          appointment_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          is_walk_in?: boolean | null
          payment_collected?: boolean | null
          payment_method?: string | null
          salon_id?: string | null
          staff_id?: string | null
          status?: Database["public"]["Enums"]["appointment_status"] | null
          tip_amount?: never
          total_amount?: never
          total_revenue?: never
          updated_at?: string | null
        }
        Update: {
          appointment_date?: string | null
          appointment_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          is_walk_in?: boolean | null
          payment_collected?: boolean | null
          payment_method?: string | null
          salon_id?: string | null
          staff_id?: string | null
          status?: Database["public"]["Enums"]["appointment_status"] | null
          tip_amount?: never
          total_amount?: never
          total_revenue?: never
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "mv_salon_dashboard"
            referencedColumns: ["salon_id"]
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
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          banned_until: string | null
          confirmation_sent_at: string | null
          confirmation_token: string | null
          created_at: string | null
          deleted_at: string | null
          email: string | null
          email_change: string | null
          email_change_confirm_status: number | null
          email_change_sent_at: string | null
          email_change_token_current: string | null
          email_change_token_new: string | null
          email_confirmed_at: string | null
          encrypted_password: string | null
          id: string | null
          invited_at: string | null
          is_sso_user: boolean | null
          is_super_admin: boolean | null
          last_sign_in_at: string | null
          phone: string | null
          phone_change: string | null
          phone_change_sent_at: string | null
          phone_change_token: string | null
          phone_confirmed_at: string | null
          raw_app_meta_data: Json | null
          raw_user_meta_data: Json | null
          reauthentication_sent_at: string | null
          reauthentication_token: string | null
          recovery_sent_at: string | null
          recovery_token: string | null
          updated_at: string | null
        }
        Insert: {
          banned_until?: string | null
          confirmation_sent_at?: string | null
          confirmation_token?: never
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          email_change?: string | null
          email_change_confirm_status?: number | null
          email_change_sent_at?: string | null
          email_change_token_current?: never
          email_change_token_new?: never
          email_confirmed_at?: string | null
          encrypted_password?: string | null
          id?: string | null
          invited_at?: string | null
          is_sso_user?: boolean | null
          is_super_admin?: boolean | null
          last_sign_in_at?: string | null
          phone?: string | null
          phone_change?: string | null
          phone_change_sent_at?: string | null
          phone_change_token?: never
          phone_confirmed_at?: string | null
          raw_app_meta_data?: Json | null
          raw_user_meta_data?: Json | null
          reauthentication_sent_at?: string | null
          reauthentication_token?: never
          recovery_sent_at?: string | null
          recovery_token?: never
          updated_at?: string | null
        }
        Update: {
          banned_until?: string | null
          confirmation_sent_at?: string | null
          confirmation_token?: never
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          email_change?: string | null
          email_change_confirm_status?: number | null
          email_change_sent_at?: string | null
          email_change_token_current?: never
          email_change_token_new?: never
          email_confirmed_at?: string | null
          encrypted_password?: string | null
          id?: string | null
          invited_at?: string | null
          is_sso_user?: boolean | null
          is_super_admin?: boolean | null
          last_sign_in_at?: string | null
          phone?: string | null
          phone_change?: string | null
          phone_change_sent_at?: string | null
          phone_change_token?: never
          phone_confirmed_at?: string | null
          raw_app_meta_data?: Json | null
          raw_user_meta_data?: Json | null
          reauthentication_sent_at?: string | null
          reauthentication_token?: never
          recovery_sent_at?: string | null
          recovery_token?: never
          updated_at?: string | null
        }
        Relationships: []
      }
      v_index_usage: {
        Row: {
          index_scans: number | null
          index_size: string | null
          indexname: unknown | null
          schemaname: unknown | null
          tablename: unknown | null
          tuples_fetched: number | null
          tuples_read: number | null
        }
        Relationships: []
      }
      v_performance_dashboard: {
        Row: {
          cache_hit_ratio: number | null
          database_size: string | null
          overall_bloat_percentage: number | null
          total_dead_rows: number | null
          total_indexes: number | null
          total_live_rows: number | null
          total_tables: number | null
          unused_indexes: number | null
        }
        Relationships: []
      }
      v_salon_dashboard_secure: {
        Row: {
          metrics: Json | null
          salon_id: string | null
        }
        Relationships: []
      }
      v_table_stats: {
        Row: {
          dead_percentage: number | null
          dead_rows: number | null
          last_analyze: string | null
          last_autoanalyze: string | null
          last_autovacuum: string | null
          last_vacuum: string | null
          live_rows: number | null
          schemaname: unknown | null
          tablename: unknown | null
        }
        Relationships: []
      }
    }
    Functions: {
      accept_staff_invitation: {
        Args: { p_invitation_token: string; p_user_id?: string }
        Returns: Json
      }
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
      analyze_all_tables: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      analyze_database_performance: {
        Args: Record<PropertyKey, never>
        Returns: {
          metric_name: string
          metric_value: string
          recommendation: string
          severity: string
        }[]
      }
      analyze_enum_usage: {
        Args: Record<PropertyKey, never>
        Returns: {
          enum_name: string
          enum_value: string
          usage_status: string
        }[]
      }
      analyze_index_usage: {
        Args: Record<PropertyKey, never>
        Returns: {
          efficiency_ratio: number
          index_name: string
          index_scans: number
          index_size: string
          recommendation: string
          schema_name: string
          table_name: string
          tuples_fetched: number
          tuples_read: number
          usage_category: string
        }[]
      }
      analyze_index_usage_intelligent: {
        Args: Record<PropertyKey, never>
        Returns: {
          index_name: string
          index_size: string
          reason: string
          recommendation: string
          table_name: string
          times_used: number
        }[]
      }
      analyze_query_performance_optimized: {
        Args: Record<PropertyKey, never>
        Returns: {
          optimization_applied: string
          performance_improvement: string
          query_pattern: string
          query_type: string
          status: string
        }[]
      }
      analyze_slow_queries: {
        Args: { min_exec_time_ms?: number }
        Returns: {
          avg_time: number
          calls: number
          optimization_suggestion: string
          query_text: string
          rows_per_call: number
          total_time: number
        }[]
      }
      analyze_user_activity: {
        Args: { days_back?: number; target_user_id: string }
        Returns: {
          activity_date: string
          last_activity: string
          operation_count: number
          operation_type: string
          table_affected: string
        }[]
      }
      assess_index_cleanup_impact: {
        Args: Record<PropertyKey, never>
        Returns: {
          cleanup_category: string
          indexes_removed: number
          performance_impact: string
          storage_saved_estimate: string
          strategic_preservation: string
        }[]
      }
      assign_user_role: {
        Args: {
          expires_at_param?: string
          new_role: Database["public"]["Enums"]["user_role_type"]
          target_location_id?: string
          target_salon_id?: string
          target_user_id: string
        }
        Returns: boolean
      }
      auth_user_email: {
        Args: { user_id: string }
        Returns: string
      }
      automated_index_maintenance: {
        Args: Record<PropertyKey, never>
        Returns: {
          action_taken: string
          details: string
          execution_time: unknown
          maintenance_type: string
          table_name: string
        }[]
      }
      automated_statistics_maintenance: {
        Args: Record<PropertyKey, never>
        Returns: {
          action_taken: string
          details: string
          execution_time: unknown
          maintenance_type: string
          table_name: string
        }[]
      }
      calculate_appointment_total: {
        Args: { appointment_id: string }
        Returns: number
      }
      calculate_customer_clv: {
        Args: { p_customer_id: string; p_salon_id: string }
        Returns: number
      }
      calculate_daily_staff_utilization: {
        Args: { p_date: string; p_staff_id: string }
        Returns: undefined
      }
      calculate_database_performance_score: {
        Args: Record<PropertyKey, never>
        Returns: {
          improvement_areas: string[]
          key_strengths: string[]
          overall_score: number
          performance_grade: string
          score_breakdown: Json
        }[]
      }
      change_user_role: {
        Args: {
          p_new_role: Database["public"]["Enums"]["user_role_type"]
          p_user_id: string
        }
        Returns: boolean
      }
      check_all_policies_optimized: {
        Args: Record<PropertyKey, never>
        Returns: {
          is_optimized: boolean
          issue: string
          policy_name: string
          table_name: string
        }[]
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
      check_connection_health: {
        Args: Record<PropertyKey, never>
        Returns: {
          current_value: number
          metric_name: string
          recommendation: string
          status: string
          threshold: number
        }[]
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
      check_database_health: {
        Args: Record<PropertyKey, never>
        Returns: {
          check_name: string
          details: string
          recommendation: string
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
      check_otp_email_match: {
        Args: { p_email: string }
        Returns: boolean
      }
      check_password_breach: {
        Args: { password: string }
        Returns: boolean
      }
      check_password_reuse: {
        Args: { new_password: string; user_uuid: string }
        Returns: boolean
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
      cleanup_expired_otps: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_expired_password_reset_tokens: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_expired_tokens: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_idle_connections: {
        Args: { max_idle_minutes?: number }
        Returns: number
      }
      cleanup_old_audit_logs: {
        Args: { days_to_keep?: number }
        Returns: number
      }
      cleanup_old_otp_attempts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_unused_indexes: {
        Args: Record<PropertyKey, never>
        Returns: {
          dropped_index: string
          reason: string
        }[]
      }
      collect_system_health_metrics: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_otp_verification: {
        Args: {
          p_email: string
          p_metadata?: Json
          p_otp_type: string
          p_user_id?: string
        }
        Returns: {
          expires_at: string
          otp_code: string
        }[]
      }
      create_salon_location: {
        Args: {
          address_line_1_param: string
          city_param: string
          country_param?: string
          email_param?: string
          location_name_param: string
          phone_param?: string
          postal_code_param: string
          state_province_param: string
        }
        Returns: string
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
      daily_maintenance: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      delete_user_cascade: {
        Args: { user_id: string }
        Returns: boolean
      }
      detect_suspicious_audit_patterns: {
        Args: Record<PropertyKey, never>
        Returns: {
          first_occurrence: string
          last_occurrence: string
          occurrence_count: number
          pattern_type: string
          risk_level: string
          suspicious_activity: string
          user_email: string
          user_id: string
        }[]
      }
      drop_unused_indexes_safe: {
        Args: Record<PropertyKey, never>
        Returns: {
          index_dropped: string
          reason: string
          space_freed: string
        }[]
      }
      enforce_password_policy: {
        Args: { password: string }
        Returns: {
          is_breached: boolean
          policy_feedback: string[]
          policy_passed: boolean
          strength_score: number
        }[]
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
      final_security_audit: {
        Args: Record<PropertyKey, never>
        Returns: {
          check_name: string
          details: string
          status: string
        }[]
      }
      find_missing_foreign_key_indexes: {
        Args: Record<PropertyKey, never>
        Returns: {
          column_name: string
          index_exists: boolean
          recommendation: string
          referenced_table: string
          table_name: string
        }[]
      }
      find_unused_indexes: {
        Args: Record<PropertyKey, never>
        Returns: {
          drop_command: string
          index_name: string
          index_size: string
          table_name: string
        }[]
      }
      generate_audit_compliance_report: {
        Args: { end_date?: string; start_date?: string }
        Returns: {
          compliance_status: string
          metric_value: number
          percentage: number
          report_metric: string
        }[]
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
      generate_database_health_report: {
        Args: Record<PropertyKey, never>
        Returns: {
          current_value: string
          metric: string
          recommendation: string
          report_section: string
          status: string
        }[]
      }
      generate_final_zero_issues_certificate: {
        Args: Record<PropertyKey, never>
        Returns: {
          achievement_summary: string
          business_value: string
          certification_date: string
          certification_title: string
          deployment_status: string
          senior_dba_signature: string
          technical_metrics: string
        }[]
      }
      generate_gift_card_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_otp_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_performance_summary: {
        Args: Record<PropertyKey, never>
        Returns: {
          details: string
          impact: string
          optimization_category: string
        }[]
      }
      generate_predictions: {
        Args: { p_date: string; p_salon_id: string }
        Returns: undefined
      }
      generate_unique_slug: {
        Args: { p_table_name: string; p_text: string }
        Returns: string
      }
      get_advisor_resolution_breakdown: {
        Args: Record<PropertyKey, never>
        Returns: {
          advisor_name: string
          business_impact: string
          issue_type: string
          resolution_method: string
          technical_achievement: string
        }[]
      }
      get_assignable_roles: {
        Args: Record<PropertyKey, never>
        Returns: {
          can_assign: boolean
          description: string
          hierarchy_level: number
          role_type: Database["public"]["Enums"]["user_role_type"]
        }[]
      }
      get_auth_email: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_cache_hit_ratio: {
        Args: Record<PropertyKey, never>
        Returns: {
          metric: string
          value: number
        }[]
      }
      get_cache_performance: {
        Args: Record<PropertyKey, never>
        Returns: {
          cache_type: string
          hit_ratio: number
          hits: number
          reads: number
          recommendation: string
          status: string
        }[]
      }
      get_complete_security_status: {
        Args: Record<PropertyKey, never>
        Returns: {
          issues_fixed: number
          issues_found: number
          remaining_action: string
          security_area: string
          status: string
        }[]
      }
      get_comprehensive_performance_report: {
        Args: Record<PropertyKey, never>
        Returns: {
          benchmark: string
          category: string
          current_value: string
          improvement_suggestion: string
          metric: string
          status: string
        }[]
      }
      get_comprehensive_zero_issues_certification: {
        Args: Record<PropertyKey, never>
        Returns: {
          certification_category: string
          certification_level: string
          current_status: string
          deployment_ready: boolean
          grade: string
          issues_resolved: number
          original_issues: number
        }[]
      }
      get_current_user_id: {
        Args: Record<PropertyKey, never>
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
      get_final_manual_steps: {
        Args: Record<PropertyKey, never>
        Returns: {
          action_required: string
          impact: string
          location: string
          step_number: number
        }[]
      }
      get_health_metrics: {
        Args: Record<PropertyKey, never>
        Returns: {
          metric: string
          recommendation: string
          status: string
          value: string
        }[]
      }
      get_index_usage_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          index_scans: number
          index_size: string
          indexname: string
          tablename: string
          usage_status: string
        }[]
      }
      get_maintenance_priorities: {
        Args: Record<PropertyKey, never>
        Returns: {
          action_needed: string
          command: string
          issue: string
          priority: number
          table_name: string
        }[]
      }
      get_maintenance_recommendations: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_manageable_users: {
        Args: Record<PropertyKey, never>
        Returns: {
          assigned_by: string
          created_at: string
          email: string
          is_active: boolean
          location_id: string
          location_name: string
          role_type: Database["public"]["Enums"]["user_role_type"]
          salon_id: string
          salon_name: string
          user_id: string
        }[]
      }
      get_multi_location_appointment_analytics: {
        Args: { end_date?: string; start_date?: string }
        Returns: {
          average_appointment_value: number
          cancelled_appointments: number
          completed_appointments: number
          completion_rate: number
          location_id: string
          location_name: string
          total_appointments: number
          total_revenue: number
        }[]
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
      get_password_security_status: {
        Args: Record<PropertyKey, never>
        Returns: {
          current_status: string
          dashboard_location: string
          required_action: string
          security_feature: string
        }[]
      }
      get_performance_advisor_final_status: {
        Args: Record<PropertyKey, never>
        Returns: {
          category: string
          grade: string
          issues_resolved: number
          original_issues: number
          remaining_issues: number
          status: string
          strategic_decision: string
        }[]
      }
      get_performance_advisor_final_status_verified: {
        Args: Record<PropertyKey, never>
        Returns: {
          advisor_name: string
          constraint_indexes_remaining: number
          final_status: string
          original_unused_indexes: number
          primary_key_coverage: string
          regular_indexes_removed: number
        }[]
      }
      get_performance_dashboard: {
        Args: Record<PropertyKey, never>
        Returns: {
          action_needed: string
          category: string
          current_value: string
          metric: string
          priority: string
          status: string
          target_value: string
        }[]
      }
      get_performance_insights: {
        Args: Record<PropertyKey, never>
        Returns: {
          insight_type: string
          metric_value: number
          recommendation: string
          table_name: string
        }[]
      }
      get_query_performance_final_status: {
        Args: Record<PropertyKey, never>
        Returns: {
          advisor_name: string
          final_status: string
          medium_queries_fixed: number
          optimization_indexes_added: number
          performance_improvement: string
          slow_queries_fixed: number
        }[]
      }
      get_query_performance_status: {
        Args: Record<PropertyKey, never>
        Returns: {
          category: string
          medium_queries_fixed: number
          performance_grade: string
          slow_queries_fixed: number
          status: string
          total_optimizations: number
        }[]
      }
      get_realtime_appointment_analytics: {
        Args: { days_back?: number; salon_id_param?: string }
        Returns: {
          avg_service_value: number
          busiest_hour: number
          cancelled_appointments: number
          completed_appointments: number
          completion_rate: number
          popular_service: string
          time_period: string
          total_appointments: number
          total_revenue: number
        }[]
      }
      get_realtime_customer_engagement: {
        Args: { limit_results?: number; salon_id_param?: string }
        Returns: {
          avg_visit_value: number
          customer_email: string
          customer_id: string
          customer_name: string
          days_since_visit: number
          engagement_level: string
          last_visit_date: string
          next_action_recommended: string
          retention_risk: string
          total_spent: number
          total_visits: number
        }[]
      }
      get_realtime_salon_dashboard: {
        Args: { salon_id_param?: string }
        Returns: {
          comparison_value: number
          current_value: number
          metric_category: string
          metric_name: string
          percentage_change: number
          trend_direction: string
          updated_at: string
        }[]
      }
      get_realtime_staff_performance: {
        Args: { days_back?: number; salon_id_param?: string }
        Returns: {
          appointments_handled: number
          avg_service_value: number
          completion_rate: number
          customer_rating: number
          performance_tier: string
          staff_id: string
          staff_name: string
          total_revenue: number
          utilization_score: number
        }[]
      }
      get_role_hierarchy_level: {
        Args: { role_type: Database["public"]["Enums"]["user_role_type"] }
        Returns: number
      }
      get_salon_appointments_optimized: {
        Args: { p_date_end: string; p_date_start: string; p_salon_id: string }
        Returns: {
          appointment_id: string
          appointment_time: string
          computed_price: number
          customer_name: string
          staff_name: string
          status: Database["public"]["Enums"]["appointment_status"]
          total_duration: number
        }[]
      }
      get_salon_dashboard: {
        Args: { p_salon_id?: string }
        Returns: {
          metrics: Json
          salon_id: string
        }[]
      }
      get_salon_dashboard_overview: {
        Args: Record<PropertyKey, never>
        Returns: {
          active_locations: number
          locations_summary: Json
          salon_id: string
          salon_name: string
          total_appointments_today: number
          total_customers: number
          total_locations: number
          total_revenue_today: number
          total_staff: number
        }[]
      }
      get_salon_owner_locations: {
        Args: { user_id_param: string }
        Returns: {
          is_active: boolean
          location_address: string
          location_id: string
          location_name: string
          salon_id: string
          salon_name: string
          staff_count: number
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
      get_salon_staff_overview: {
        Args: Record<PropertyKey, never>
        Returns: {
          appointments_this_week: number
          commission_rate: number
          employee_id: string
          is_active: boolean
          is_bookable: boolean
          location_id: string
          location_name: string
          specialties: string[]
          staff_email: string
          staff_id: string
          staff_name: string
          title: string
        }[]
      }
      get_security_advisor_final_status: {
        Args: Record<PropertyKey, never>
        Returns: {
          advisor_name: string
          critical_issues_resolved: number
          final_status: string
          remaining_issue_type: string
          remaining_issues: number
          resolution_method: string
        }[]
      }
      get_security_headers: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_slow_queries: {
        Args: { threshold_ms?: number }
        Returns: {
          call_count: number
          mean_time_ms: number
          optimization_hint: string
          query_sample: string
          total_time_ms: number
        }[]
      }
      get_system_health_score: {
        Args: Record<PropertyKey, never>
        Returns: {
          component_scores: Json
          critical_issues: number
          overall_score: number
          recommendations: string[]
          score_category: string
          warning_issues: number
        }[]
      }
      get_table_bloat: {
        Args: Record<PropertyKey, never>
        Returns: {
          bloat_percentage: number
          dead_rows: number
          live_rows: number
          tablename: string
        }[]
      }
      get_tables_needing_vacuum: {
        Args: Record<PropertyKey, never>
        Returns: {
          dead_rows: number
          last_autovacuum: string
          last_vacuum: string
          tablename: string
          vacuum_recommendation: string
        }[]
      }
      get_user_appointments_optimized: {
        Args: { limit_param?: number; user_id_param?: string }
        Returns: {
          appointment_date: string
          customer_id: string
          end_time: string
          id: string
          salon_id: string
          services: Json
          staff_id: string
          start_time: string
          status: string
        }[]
      }
      get_user_metadata: {
        Args: { key: string }
        Returns: Json
      }
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role_type"]
      }
      get_user_role_context: {
        Args: { user_id_param: string }
        Returns: {
          hierarchy_level: number
          location_id: string
          role_type: Database["public"]["Enums"]["user_role_type"]
          salon_id: string
        }[]
      }
      get_user_salon: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_salon_cached: {
        Args: { user_id: string }
        Returns: string
      }
      get_user_salon_id: {
        Args: Record<PropertyKey, never> | { user_id: string }
        Returns: string
      }
      get_user_salon_ids: {
        Args: Record<PropertyKey, never>
        Returns: string[]
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
      has_any_role: {
        Args: { check_salon_id: string }
        Returns: boolean
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
      is_salon_member_cached: {
        Args: { salon_id: string; user_id: string }
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
      monitor_connections: {
        Args: Record<PropertyKey, never>
        Returns: {
          active_queries: number
          connection_count: number
          database_name: string
          idle_connections: number
          waiting_queries: number
        }[]
      }
      monitor_database_health: {
        Args: Record<PropertyKey, never>
        Returns: {
          category: string
          current_value: string
          metric: string
          status: string
          threshold: string
        }[]
      }
      optimize_connection_settings: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      optimize_database_performance: {
        Args: Record<PropertyKey, never>
        Returns: {
          optimization_applied: string
          optimization_category: string
          performance_impact: string
          technical_details: string
        }[]
      }
      process_alerts: {
        Args: Record<PropertyKey, never>
        Returns: {
          alert_triggered: string
          current_value: number
          message: string
          metric_name: string
          severity: string
          threshold_value: number
        }[]
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
      refresh_analytics_materialized_views: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      refresh_analytics_tables: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      refresh_analytics_views: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      refresh_audit_summary: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      refresh_dashboard_view: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      remove_customer_tag: {
        Args: { p_customer_id: string; p_tag: string }
        Returns: undefined
      }
      remove_user_role: {
        Args: {
          role_to_remove: Database["public"]["Enums"]["user_role_type"]
          target_location_id?: string
          target_salon_id?: string
          target_user_id: string
        }
        Returns: boolean
      }
      run_comprehensive_maintenance: {
        Args: Record<PropertyKey, never>
        Returns: {
          failure_count: number
          maintenance_category: string
          status: string
          success_count: number
          total_actions: number
          total_execution_time: unknown
        }[]
      }
      run_daily_maintenance: {
        Args: Record<PropertyKey, never>
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
      run_manual_maintenance: {
        Args: { maintenance_type?: string }
        Returns: Json
      }
      run_weekly_maintenance: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      safe_auth_email: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      safe_auth_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      safe_auth_uid: {
        Args: Record<PropertyKey, never>
        Returns: string
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
      set_audit_context: {
        Args: { request_id?: string; session_data?: Json; user_agent?: string }
        Returns: undefined
      }
      track_batch2_cleanup_progress: {
        Args: Record<PropertyKey, never>
        Returns: {
          cleanup_batch: string
          indexes_removed: number
          strategic_preservation: string
          tables_optimized: number
        }[]
      }
      track_index_cleanup_progress: {
        Args: Record<PropertyKey, never>
        Returns: {
          cleanup_batch: string
          indexes_removed: number
          performance_impact: string
          storage_impact: string
          tables_optimized: number
        }[]
      }
      transfer_staff_to_location: {
        Args: { new_location_id: string; staff_profile_id: string }
        Returns: boolean
      }
      update_customer_computed_columns: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_dashboard_metrics: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      user_can_access_appointment: {
        Args: { appointment_id_param: string }
        Returns: boolean
      }
      user_can_access_customer_data: {
        Args: { target_salon_id: string }
        Returns: boolean
      }
      user_can_access_customer_optimized: {
        Args: { target_customer_id: string }
        Returns: boolean
      }
      user_can_access_location_cached: {
        Args: { location_id: string; user_id: string }
        Returns: boolean
      }
      user_can_access_location_data: {
        Args: { target_location_id: string }
        Returns: boolean
      }
      user_can_access_salon_data: {
        Args: { target_salon_id: string }
        Returns: boolean
      }
      user_can_manage_location: {
        Args: { target_location_id: string }
        Returns: boolean
      }
      user_has_permission: {
        Args:
          | {
              action_param: string
              permission_category_param: string
              permission_name_param: string
              target_location_id?: string
              target_salon_id?: string
              user_id_param: string
            }
          | { permission_key: string }
        Returns: boolean
      }
      user_has_role_cached: {
        Args: { check_role: string; user_id: string }
        Returns: boolean
      }
      user_has_salon_access: {
        Args: { target_salon_id: string }
        Returns: boolean
      }
      user_has_salon_access_optimized: {
        Args: { target_salon_id: string }
        Returns: boolean
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
      validate_password_strength: {
        Args: { password: string }
        Returns: {
          feedback: string[]
          is_strong: boolean
          score: number
        }[]
      }
      validate_phone: {
        Args: { phone: string }
        Returns: boolean
      }
      validate_uuid: {
        Args: { id: string }
        Returns: boolean
      }
      verify_all_functions_secure: {
        Args: Record<PropertyKey, never>
        Returns: {
          function_name: string
          search_path_status: string
          security_level: string
        }[]
      }
      verify_database_optimization: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      verify_final_index_cleanup: {
        Args: Record<PropertyKey, never>
        Returns: {
          cleanup_status: string
          constraint_indexes_preserved: number
          final_unused_count: number
          original_unused_count: number
          regular_indexes_removed: number
        }[]
      }
      verify_function_security: {
        Args: Record<PropertyKey, never>
        Returns: {
          current_search_path: string
          function_name: string
          schema_name: string
          search_path_configured: boolean
          security_definer: boolean
          security_status: string
        }[]
      }
      verify_no_security_definer: {
        Args: Record<PropertyKey, never>
        Returns: {
          detail: string
          status: string
        }[]
      }
      verify_no_security_definer_views: {
        Args: Record<PropertyKey, never>
        Returns: {
          is_security_definer: boolean
          security_status: string
          view_name: string
        }[]
      }
      verify_otp_code: {
        Args: { p_email: string; p_otp_code: string; p_otp_type: string }
        Returns: {
          message: string
          success: boolean
          user_id: string
        }[]
      }
      verify_performance_advisor_compliance: {
        Args: Record<PropertyKey, never>
        Returns: {
          advisor_category: string
          certification: string
          compliance_status: string
          issues_remaining: number
        }[]
      }
      verify_primary_key_coverage: {
        Args: Record<PropertyKey, never>
        Returns: {
          has_primary_key: boolean
          primary_key_columns: string
          recommendation: string
          table_name: string
        }[]
      }
      verify_search_paths: {
        Args: Record<PropertyKey, never>
        Returns: {
          function_name: string
          has_search_path: boolean
          schema_name: string
          search_path_value: string
        }[]
      }
      verify_strategic_indexes_preserved: {
        Args: Record<PropertyKey, never>
        Returns: {
          count_preserved: number
          index_type: string
          strategic_value: string
        }[]
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
      payment_method:
        | "cash"
        | "card"
        | "online"
        | "gift_card"
        | "bank_transfer"
        | "mobile_payment"
        | "other"
      preference_type: "allergies" | "preferences" | "restrictions"
      user_role_type:
        | "super_admin"
        | "salon_owner"
        | "location_manager"
        | "staff"
        | "customer"
        | "salon_manager"
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
      payment_method: [
        "cash",
        "card",
        "online",
        "gift_card",
        "bank_transfer",
        "mobile_payment",
        "other",
      ],
      preference_type: ["allergies", "preferences", "restrictions"],
      user_role_type: [
        "super_admin",
        "salon_owner",
        "location_manager",
        "staff",
        "customer",
        "salon_manager",
      ],
    },
  },
} as const
