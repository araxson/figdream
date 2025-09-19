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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      appointment_services: {
        Row: {
          appointment_id: string | null
          completed_at: string | null
          created_at: string | null
          discount_percentage: number | null
          duration_minutes: number | null
          end_time: string | null
          id: string | null
          is_completed: boolean | null
          notes: string | null
          quantity: number | null
          service_id: string | null
          service_name: string | null
          service_order: number | null
          staff_id: string | null
          start_time: string | null
          subtotal: number | null
          unit_price: number | null
        }
        Insert: {
          appointment_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          discount_percentage?: number | null
          duration_minutes?: number | null
          end_time?: string | null
          id?: string | null
          is_completed?: boolean | null
          notes?: string | null
          quantity?: number | null
          service_id?: string | null
          service_name?: string | null
          service_order?: number | null
          staff_id?: string | null
          start_time?: string | null
          subtotal?: number | null
          unit_price?: number | null
        }
        Update: {
          appointment_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          discount_percentage?: number | null
          duration_minutes?: number | null
          end_time?: string | null
          id?: string | null
          is_completed?: boolean | null
          notes?: string | null
          quantity?: number | null
          service_id?: string | null
          service_name?: string | null
          service_order?: number | null
          staff_id?: string | null
          start_time?: string | null
          subtotal?: number | null
          unit_price?: number | null
        }
        Relationships: []
      }
      appointments: {
        Row: {
          booking_source: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          checked_in_at: string | null
          checked_in_by: string | null
          completed_at: string | null
          completed_by: string | null
          confirmation_code: string | null
          created_at: string | null
          customer_id: string | null
          deposit_amount: number | null
          deposit_paid: boolean | null
          deposit_required: boolean | null
          discount_amount: number | null
          duration_minutes: number | null
          end_time: string | null
          followup_sent: boolean | null
          id: string | null
          internal_notes: string | null
          marked_no_show_at: string | null
          marked_no_show_by: string | null
          metadata: Json | null
          notes: string | null
          paid_at: string | null
          payment_method: string | null
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          preferences: Json | null
          referral_source: string | null
          reminder_sent: boolean | null
          reminder_sent_at: string | null
          resource_id: string | null
          resource_type: string | null
          salon_id: string | null
          service_count: number | null
          staff_id: string | null
          start_time: string | null
          status: Database["public"]["Enums"]["appointment_status"] | null
          subtotal: number | null
          tax_amount: number | null
          tip_amount: number | null
          total_amount: number | null
          updated_at: string | null
        }
        Insert: {
          booking_source?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          checked_in_at?: string | null
          checked_in_by?: string | null
          completed_at?: string | null
          completed_by?: string | null
          confirmation_code?: string | null
          created_at?: string | null
          customer_id?: string | null
          deposit_amount?: number | null
          deposit_paid?: boolean | null
          deposit_required?: boolean | null
          discount_amount?: number | null
          duration_minutes?: number | null
          end_time?: string | null
          followup_sent?: boolean | null
          id?: string | null
          internal_notes?: string | null
          marked_no_show_at?: string | null
          marked_no_show_by?: string | null
          metadata?: Json | null
          notes?: string | null
          paid_at?: string | null
          payment_method?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          preferences?: Json | null
          referral_source?: string | null
          reminder_sent?: boolean | null
          reminder_sent_at?: string | null
          resource_id?: string | null
          resource_type?: string | null
          salon_id?: string | null
          service_count?: number | null
          staff_id?: string | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["appointment_status"] | null
          subtotal?: number | null
          tax_amount?: number | null
          tip_amount?: number | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          booking_source?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          checked_in_at?: string | null
          checked_in_by?: string | null
          completed_at?: string | null
          completed_by?: string | null
          confirmation_code?: string | null
          created_at?: string | null
          customer_id?: string | null
          deposit_amount?: number | null
          deposit_paid?: boolean | null
          deposit_required?: boolean | null
          discount_amount?: number | null
          duration_minutes?: number | null
          end_time?: string | null
          followup_sent?: boolean | null
          id?: string | null
          internal_notes?: string | null
          marked_no_show_at?: string | null
          marked_no_show_by?: string | null
          metadata?: Json | null
          notes?: string | null
          paid_at?: string | null
          payment_method?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          preferences?: Json | null
          referral_source?: string | null
          reminder_sent?: boolean | null
          reminder_sent_at?: string | null
          resource_id?: string | null
          resource_type?: string | null
          salon_id?: string | null
          service_count?: number | null
          staff_id?: string | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["appointment_status"] | null
          subtotal?: number | null
          tax_amount?: number | null
          tip_amount?: number | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      blocked_times: {
        Row: {
          block_type: string | null
          created_at: string | null
          created_by: string | null
          end_time: string | null
          id: string | null
          is_active: boolean | null
          is_recurring: boolean | null
          reason: string | null
          recurrence_pattern: string | null
          salon_id: string | null
          staff_id: string | null
          start_time: string | null
          updated_at: string | null
        }
        Insert: {
          block_type?: string | null
          created_at?: string | null
          created_by?: string | null
          end_time?: string | null
          id?: string | null
          is_active?: boolean | null
          is_recurring?: boolean | null
          reason?: string | null
          recurrence_pattern?: string | null
          salon_id?: string | null
          staff_id?: string | null
          start_time?: string | null
          updated_at?: string | null
        }
        Update: {
          block_type?: string | null
          created_at?: string | null
          created_by?: string | null
          end_time?: string | null
          id?: string | null
          is_active?: boolean | null
          is_recurring?: boolean | null
          reason?: string | null
          recurrence_pattern?: string | null
          salon_id?: string | null
          staff_id?: string | null
          start_time?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      customer_analytics: {
        Row: {
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
        Insert: {
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
        Update: {
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
        Relationships: []
      }
      customer_favorites: {
        Row: {
          created_at: string | null
          customer_id: string | null
          id: string | null
          notes: string | null
          salon_id: string | null
          service_id: string | null
          staff_id: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          id?: string | null
          notes?: string | null
          salon_id?: string | null
          service_id?: string | null
          staff_id?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          id?: string | null
          notes?: string | null
          salon_id?: string | null
          service_id?: string | null
          staff_id?: string | null
        }
        Relationships: []
      }
      daily_metrics: {
        Row: {
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
        Insert: {
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
        Update: {
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
        Relationships: []
      }
      loyalty_programs: {
        Row: {
          benefits: Json | null
          created_at: string | null
          description: string | null
          ends_at: string | null
          id: string | null
          is_active: boolean | null
          name: string | null
          points_per_dollar: number | null
          points_per_visit: number | null
          redemption_rate: number | null
          salon_id: string | null
          starts_at: string | null
          terms_conditions: string | null
          tier_config: Json | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          benefits?: Json | null
          created_at?: string | null
          description?: string | null
          ends_at?: string | null
          id?: string | null
          is_active?: boolean | null
          name?: string | null
          points_per_dollar?: number | null
          points_per_visit?: number | null
          redemption_rate?: number | null
          salon_id?: string | null
          starts_at?: string | null
          terms_conditions?: string | null
          tier_config?: Json | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          benefits?: Json | null
          created_at?: string | null
          description?: string | null
          ends_at?: string | null
          id?: string | null
          is_active?: boolean | null
          name?: string | null
          points_per_dollar?: number | null
          points_per_visit?: number | null
          redemption_rate?: number | null
          salon_id?: string | null
          starts_at?: string | null
          terms_conditions?: string | null
          tier_config?: Json | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      monthly_metrics: {
        Row: {
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
        Insert: {
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
        Update: {
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
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_thumbnail_url: string | null
          avatar_url: string | null
          country_code: string | null
          cover_image_url: string | null
          created_at: string | null
          currency_code: string | null
          date_of_birth: string | null
          deleted_at: string | null
          display_name: string | null
          email: string | null
          email_encrypted: string | null
          failed_login_count: number | null
          first_name: string | null
          full_name: string | null
          gender: string | null
          id: string | null
          interests: string[] | null
          is_active: boolean | null
          is_complete: boolean | null
          is_premium: boolean | null
          is_public: boolean | null
          is_verified: boolean | null
          last_login_at: string | null
          last_name: string | null
          last_seen_at: string | null
          locale: string | null
          login_count: number | null
          metadata: Json | null
          password_changed_at: string | null
          phone: string | null
          phone_encrypted: string | null
          phone_verified: boolean | null
          phone_verified_at: string | null
          preferences: Json | null
          search_vector: unknown | null
          social_profiles: Json | null
          tags: string[] | null
          timezone: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_thumbnail_url?: string | null
          avatar_url?: string | null
          country_code?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          currency_code?: string | null
          date_of_birth?: string | null
          deleted_at?: string | null
          display_name?: string | null
          email?: string | null
          email_encrypted?: string | null
          failed_login_count?: number | null
          first_name?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string | null
          interests?: string[] | null
          is_active?: boolean | null
          is_complete?: boolean | null
          is_premium?: boolean | null
          is_public?: boolean | null
          is_verified?: boolean | null
          last_login_at?: string | null
          last_name?: string | null
          last_seen_at?: string | null
          locale?: string | null
          login_count?: number | null
          metadata?: Json | null
          password_changed_at?: string | null
          phone?: string | null
          phone_encrypted?: string | null
          phone_verified?: boolean | null
          phone_verified_at?: string | null
          preferences?: Json | null
          search_vector?: unknown | null
          social_profiles?: Json | null
          tags?: string[] | null
          timezone?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_thumbnail_url?: string | null
          avatar_url?: string | null
          country_code?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          currency_code?: string | null
          date_of_birth?: string | null
          deleted_at?: string | null
          display_name?: string | null
          email?: string | null
          email_encrypted?: string | null
          failed_login_count?: number | null
          first_name?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string | null
          interests?: string[] | null
          is_active?: boolean | null
          is_complete?: boolean | null
          is_premium?: boolean | null
          is_public?: boolean | null
          is_verified?: boolean | null
          last_login_at?: string | null
          last_name?: string | null
          last_seen_at?: string | null
          locale?: string | null
          login_count?: number | null
          metadata?: Json | null
          password_changed_at?: string | null
          phone?: string | null
          phone_encrypted?: string | null
          phone_verified?: boolean | null
          phone_verified_at?: string | null
          preferences?: Json | null
          search_vector?: unknown | null
          social_profiles?: Json | null
          tags?: string[] | null
          timezone?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          ai_generated_summary: string | null
          ambiance_rating: number | null
          appointment_id: string | null
          auto_moderated: boolean | null
          bookmark_count: number | null
          cleanliness_rating: number | null
          content: string | null
          created_at: string | null
          customer_id: string | null
          emotion_analysis: Json | null
          helpful_count: number | null
          id: string | null
          is_featured: boolean | null
          is_verified: boolean | null
          keyword_tags: string[] | null
          language_detected: string | null
          metadata: Json | null
          moderation_flags: Json | null
          overall_rating: number | null
          photos: string[] | null
          published_at: string | null
          response_at: string | null
          response_by: string | null
          response_content: string | null
          salon_id: string | null
          sentiment_confidence: number | null
          sentiment_score: number | null
          service_rating: number | null
          share_count: number | null
          spam_probability: number | null
          staff_id: string | null
          staff_rating: number | null
          status: string | null
          title: string | null
          toxicity_score: number | null
          updated_at: string | null
          value_rating: number | null
          word_count: number | null
        }
        Insert: {
          ai_generated_summary?: string | null
          ambiance_rating?: number | null
          appointment_id?: string | null
          auto_moderated?: boolean | null
          bookmark_count?: number | null
          cleanliness_rating?: number | null
          content?: string | null
          created_at?: string | null
          customer_id?: string | null
          emotion_analysis?: Json | null
          helpful_count?: number | null
          id?: string | null
          is_featured?: boolean | null
          is_verified?: boolean | null
          keyword_tags?: string[] | null
          language_detected?: string | null
          metadata?: Json | null
          moderation_flags?: Json | null
          overall_rating?: number | null
          photos?: string[] | null
          published_at?: string | null
          response_at?: string | null
          response_by?: string | null
          response_content?: string | null
          salon_id?: string | null
          sentiment_confidence?: number | null
          sentiment_score?: number | null
          service_rating?: number | null
          share_count?: number | null
          spam_probability?: number | null
          staff_id?: string | null
          staff_rating?: number | null
          status?: string | null
          title?: string | null
          toxicity_score?: number | null
          updated_at?: string | null
          value_rating?: number | null
          word_count?: number | null
        }
        Update: {
          ai_generated_summary?: string | null
          ambiance_rating?: number | null
          appointment_id?: string | null
          auto_moderated?: boolean | null
          bookmark_count?: number | null
          cleanliness_rating?: number | null
          content?: string | null
          created_at?: string | null
          customer_id?: string | null
          emotion_analysis?: Json | null
          helpful_count?: number | null
          id?: string | null
          is_featured?: boolean | null
          is_verified?: boolean | null
          keyword_tags?: string[] | null
          language_detected?: string | null
          metadata?: Json | null
          moderation_flags?: Json | null
          overall_rating?: number | null
          photos?: string[] | null
          published_at?: string | null
          response_at?: string | null
          response_by?: string | null
          response_content?: string | null
          salon_id?: string | null
          sentiment_confidence?: number | null
          sentiment_score?: number | null
          service_rating?: number | null
          share_count?: number | null
          spam_probability?: number | null
          staff_id?: string | null
          staff_rating?: number | null
          status?: string | null
          title?: string | null
          toxicity_score?: number | null
          updated_at?: string | null
          value_rating?: number | null
          word_count?: number | null
        }
        Relationships: []
      }
      salon_locations: {
        Row: {
          address: Json | null
          coordinates: Json | null
          created_at: string | null
          email: string | null
          email_encrypted: string | null
          id: string | null
          is_active: boolean | null
          is_primary: boolean | null
          latitude: number | null
          longitude: number | null
          max_capacity: number | null
          name: string | null
          phone: string | null
          phone_encrypted: string | null
          salon_id: string | null
          slug: string | null
          staff_count: number | null
          updated_at: string | null
        }
        Insert: {
          address?: Json | null
          coordinates?: Json | null
          created_at?: string | null
          email?: string | null
          email_encrypted?: string | null
          id?: string | null
          is_active?: boolean | null
          is_primary?: boolean | null
          latitude?: number | null
          longitude?: number | null
          max_capacity?: number | null
          name?: string | null
          phone?: string | null
          phone_encrypted?: string | null
          salon_id?: string | null
          slug?: string | null
          staff_count?: number | null
          updated_at?: string | null
        }
        Update: {
          address?: Json | null
          coordinates?: Json | null
          created_at?: string | null
          email?: string | null
          email_encrypted?: string | null
          id?: string | null
          is_active?: boolean | null
          is_primary?: boolean | null
          latitude?: number | null
          longitude?: number | null
          max_capacity?: number | null
          name?: string | null
          phone?: string | null
          phone_encrypted?: string | null
          salon_id?: string | null
          slug?: string | null
          staff_count?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      salons: {
        Row: {
          address: Json | null
          booking_lead_time_hours: number | null
          brand_colors: Json | null
          business_name: string | null
          business_type: string | null
          cancellation_hours: number | null
          chain_id: string | null
          coordinates: Json | null
          cover_image_url: string | null
          created_at: string | null
          currency_code: string | null
          deleted_at: string | null
          description: string | null
          email: string | null
          email_encrypted: string | null
          employee_count: number | null
          established_date: string | null
          features: string[] | null
          gallery_urls: string[] | null
          id: string | null
          is_accepting_bookings: boolean | null
          is_active: boolean | null
          is_featured: boolean | null
          is_verified: boolean | null
          language_code: string | null
          latitude: number | null
          logo_url: string | null
          longitude: number | null
          max_bookings_per_day: number | null
          max_services: number | null
          max_staff: number | null
          name: string | null
          owner_id: string | null
          phone: string | null
          phone_encrypted: string | null
          rating_average: number | null
          rating_count: number | null
          search_vector: unknown | null
          settings: Json | null
          short_description: string | null
          slug: string | null
          social_links: Json | null
          subscription_expires_at: string | null
          subscription_tier: string | null
          tags: string[] | null
          timezone: string | null
          total_bookings: number | null
          total_revenue: number | null
          updated_at: string | null
          verified_at: string | null
          website: string | null
        }
        Insert: {
          address?: Json | null
          booking_lead_time_hours?: number | null
          brand_colors?: Json | null
          business_name?: string | null
          business_type?: string | null
          cancellation_hours?: number | null
          chain_id?: string | null
          coordinates?: Json | null
          cover_image_url?: string | null
          created_at?: string | null
          currency_code?: string | null
          deleted_at?: string | null
          description?: string | null
          email?: string | null
          email_encrypted?: string | null
          employee_count?: number | null
          established_date?: string | null
          features?: string[] | null
          gallery_urls?: string[] | null
          id?: string | null
          is_accepting_bookings?: boolean | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_verified?: boolean | null
          language_code?: string | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          max_bookings_per_day?: number | null
          max_services?: number | null
          max_staff?: number | null
          name?: string | null
          owner_id?: string | null
          phone?: string | null
          phone_encrypted?: string | null
          rating_average?: number | null
          rating_count?: number | null
          search_vector?: unknown | null
          settings?: Json | null
          short_description?: string | null
          slug?: string | null
          social_links?: Json | null
          subscription_expires_at?: string | null
          subscription_tier?: string | null
          tags?: string[] | null
          timezone?: string | null
          total_bookings?: number | null
          total_revenue?: number | null
          updated_at?: string | null
          verified_at?: string | null
          website?: string | null
        }
        Update: {
          address?: Json | null
          booking_lead_time_hours?: number | null
          brand_colors?: Json | null
          business_name?: string | null
          business_type?: string | null
          cancellation_hours?: number | null
          chain_id?: string | null
          coordinates?: Json | null
          cover_image_url?: string | null
          created_at?: string | null
          currency_code?: string | null
          deleted_at?: string | null
          description?: string | null
          email?: string | null
          email_encrypted?: string | null
          employee_count?: number | null
          established_date?: string | null
          features?: string[] | null
          gallery_urls?: string[] | null
          id?: string | null
          is_accepting_bookings?: boolean | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_verified?: boolean | null
          language_code?: string | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          max_bookings_per_day?: number | null
          max_services?: number | null
          max_staff?: number | null
          name?: string | null
          owner_id?: string | null
          phone?: string | null
          phone_encrypted?: string | null
          rating_average?: number | null
          rating_count?: number | null
          search_vector?: unknown | null
          settings?: Json | null
          short_description?: string | null
          slug?: string | null
          social_links?: Json | null
          subscription_expires_at?: string | null
          subscription_tier?: string | null
          tags?: string[] | null
          timezone?: string | null
          total_bookings?: number | null
          total_revenue?: number | null
          updated_at?: string | null
          verified_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      service_categories: {
        Row: {
          active_service_count: number | null
          color: string | null
          created_at: string | null
          depth: number | null
          description: string | null
          display_order: number | null
          icon: string | null
          id: string | null
          image_url: string | null
          is_active: boolean | null
          is_featured: boolean | null
          meta_description: string | null
          meta_title: string | null
          name: string | null
          parent_id: string | null
          path: string[] | null
          salon_id: string | null
          service_count: number | null
          slug: string | null
          tags: string[] | null
          thumbnail_url: string | null
          updated_at: string | null
        }
        Insert: {
          active_service_count?: number | null
          color?: string | null
          created_at?: string | null
          depth?: number | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string | null
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string | null
          parent_id?: string | null
          path?: string[] | null
          salon_id?: string | null
          service_count?: number | null
          slug?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string | null
        }
        Update: {
          active_service_count?: number | null
          color?: string | null
          created_at?: string | null
          depth?: number | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string | null
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string | null
          parent_id?: string | null
          path?: string[] | null
          salon_id?: string | null
          service_count?: number | null
          slug?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      services: {
        Row: {
          base_price: number | null
          benefits: string[] | null
          booking_count: number | null
          buffer_minutes: number | null
          category_id: string | null
          commission_rate: number | null
          cost: number | null
          created_at: string | null
          currency_code: string | null
          current_price: number | null
          deposit_amount: number | null
          deposit_percentage: number | null
          description: string | null
          discontinued_at: string | null
          duration_minutes: number | null
          gallery_urls: string[] | null
          gender_preference: string | null
          id: string | null
          image_url: string | null
          includes: string[] | null
          inventory_count: number | null
          is_active: boolean | null
          is_addon: boolean | null
          is_bookable: boolean | null
          is_featured: boolean | null
          is_package: boolean | null
          is_taxable: boolean | null
          low_stock_threshold: number | null
          max_advance_booking_days: number | null
          max_age: number | null
          max_capacity: number | null
          meta_description: string | null
          meta_title: string | null
          min_advance_booking_hours: number | null
          min_age: number | null
          min_capacity: number | null
          name: string | null
          profit_margin: number | null
          rating_average: number | null
          rating_count: number | null
          requirements: string | null
          requires_consultation: boolean | null
          requires_deposit: boolean | null
          revenue_total: number | null
          sale_price: number | null
          salon_id: string | null
          search_vector: unknown | null
          short_description: string | null
          sku: string | null
          slug: string | null
          tags: string[] | null
          tax_rate: number | null
          thumbnail_url: string | null
          total_duration_minutes: number | null
          track_inventory: boolean | null
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          base_price?: number | null
          benefits?: string[] | null
          booking_count?: number | null
          buffer_minutes?: number | null
          category_id?: string | null
          commission_rate?: number | null
          cost?: number | null
          created_at?: string | null
          currency_code?: string | null
          current_price?: number | null
          deposit_amount?: number | null
          deposit_percentage?: number | null
          description?: string | null
          discontinued_at?: string | null
          duration_minutes?: number | null
          gallery_urls?: string[] | null
          gender_preference?: string | null
          id?: string | null
          image_url?: string | null
          includes?: string[] | null
          inventory_count?: number | null
          is_active?: boolean | null
          is_addon?: boolean | null
          is_bookable?: boolean | null
          is_featured?: boolean | null
          is_package?: boolean | null
          is_taxable?: boolean | null
          low_stock_threshold?: number | null
          max_advance_booking_days?: number | null
          max_age?: number | null
          max_capacity?: number | null
          meta_description?: string | null
          meta_title?: string | null
          min_advance_booking_hours?: number | null
          min_age?: number | null
          min_capacity?: number | null
          name?: string | null
          profit_margin?: number | null
          rating_average?: number | null
          rating_count?: number | null
          requirements?: string | null
          requires_consultation?: boolean | null
          requires_deposit?: boolean | null
          revenue_total?: number | null
          sale_price?: number | null
          salon_id?: string | null
          search_vector?: unknown | null
          short_description?: string | null
          sku?: string | null
          slug?: string | null
          tags?: string[] | null
          tax_rate?: number | null
          thumbnail_url?: string | null
          total_duration_minutes?: number | null
          track_inventory?: boolean | null
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          base_price?: number | null
          benefits?: string[] | null
          booking_count?: number | null
          buffer_minutes?: number | null
          category_id?: string | null
          commission_rate?: number | null
          cost?: number | null
          created_at?: string | null
          currency_code?: string | null
          current_price?: number | null
          deposit_amount?: number | null
          deposit_percentage?: number | null
          description?: string | null
          discontinued_at?: string | null
          duration_minutes?: number | null
          gallery_urls?: string[] | null
          gender_preference?: string | null
          id?: string | null
          image_url?: string | null
          includes?: string[] | null
          inventory_count?: number | null
          is_active?: boolean | null
          is_addon?: boolean | null
          is_bookable?: boolean | null
          is_featured?: boolean | null
          is_package?: boolean | null
          is_taxable?: boolean | null
          low_stock_threshold?: number | null
          max_advance_booking_days?: number | null
          max_age?: number | null
          max_capacity?: number | null
          meta_description?: string | null
          meta_title?: string | null
          min_advance_booking_hours?: number | null
          min_age?: number | null
          min_capacity?: number | null
          name?: string | null
          profit_margin?: number | null
          rating_average?: number | null
          rating_count?: number | null
          requirements?: string | null
          requires_consultation?: boolean | null
          requires_deposit?: boolean | null
          revenue_total?: number | null
          sale_price?: number | null
          salon_id?: string | null
          search_vector?: unknown | null
          short_description?: string | null
          sku?: string | null
          slug?: string | null
          tags?: string[] | null
          tax_rate?: number | null
          thumbnail_url?: string | null
          total_duration_minutes?: number | null
          track_inventory?: boolean | null
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      staff_performance: {
        Row: {
          average_appointment_duration: number | null
          average_rating: number | null
          cancelled_by_customer: number | null
          cancelled_by_staff: number | null
          completed_appointments: number | null
          created_at: string | null
          customer_retention_rate: number | null
          five_star_reviews: number | null
          gap_time_minutes: number | null
          id: string | null
          new_customers: number | null
          no_shows: number | null
          online_bookings: number | null
          overtime_minutes: number | null
          period_end: string | null
          period_start: string | null
          rebook_rate: number | null
          request_bookings: number | null
          returning_customers: number | null
          service_mix: Json | null
          services_per_day: number | null
          services_performed: number | null
          staff_id: string | null
          top_services: Json | null
          total_appointments: number | null
          total_available_minutes: number | null
          total_reviews: number | null
          total_service_minutes: number | null
          unique_customers: number | null
          updated_at: string | null
          utilization_rate: number | null
        }
        Insert: {
          average_appointment_duration?: number | null
          average_rating?: number | null
          cancelled_by_customer?: number | null
          cancelled_by_staff?: number | null
          completed_appointments?: number | null
          created_at?: string | null
          customer_retention_rate?: number | null
          five_star_reviews?: number | null
          gap_time_minutes?: number | null
          id?: string | null
          new_customers?: number | null
          no_shows?: number | null
          online_bookings?: number | null
          overtime_minutes?: number | null
          period_end?: string | null
          period_start?: string | null
          rebook_rate?: number | null
          request_bookings?: number | null
          returning_customers?: number | null
          service_mix?: Json | null
          services_per_day?: number | null
          services_performed?: number | null
          staff_id?: string | null
          top_services?: Json | null
          total_appointments?: number | null
          total_available_minutes?: number | null
          total_reviews?: number | null
          total_service_minutes?: number | null
          unique_customers?: number | null
          updated_at?: string | null
          utilization_rate?: number | null
        }
        Update: {
          average_appointment_duration?: number | null
          average_rating?: number | null
          cancelled_by_customer?: number | null
          cancelled_by_staff?: number | null
          completed_appointments?: number | null
          created_at?: string | null
          customer_retention_rate?: number | null
          five_star_reviews?: number | null
          gap_time_minutes?: number | null
          id?: string | null
          new_customers?: number | null
          no_shows?: number | null
          online_bookings?: number | null
          overtime_minutes?: number | null
          period_end?: string | null
          period_start?: string | null
          rebook_rate?: number | null
          request_bookings?: number | null
          returning_customers?: number | null
          service_mix?: Json | null
          services_per_day?: number | null
          services_performed?: number | null
          staff_id?: string | null
          top_services?: Json | null
          total_appointments?: number | null
          total_available_minutes?: number | null
          total_reviews?: number | null
          total_service_minutes?: number | null
          unique_customers?: number | null
          updated_at?: string | null
          utilization_rate?: number | null
        }
        Relationships: []
      }
      staff_profiles: {
        Row: {
          bio: string | null
          certifications: Json | null
          commission_rate: number | null
          created_at: string | null
          employment_type: string | null
          experience_years: number | null
          hired_at: string | null
          hourly_rate: number | null
          id: string | null
          is_active: boolean | null
          is_bookable: boolean | null
          is_featured: boolean | null
          languages: string[] | null
          portfolio_urls: string[] | null
          preferred_hours: Json | null
          profile_image_url: string | null
          rating_average: number | null
          rating_count: number | null
          salon_id: string | null
          settings: Json | null
          specializations: string[] | null
          status: Database["public"]["Enums"]["staff_status"] | null
          terminated_at: string | null
          title: string | null
          total_appointments: number | null
          total_revenue: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          bio?: string | null
          certifications?: Json | null
          commission_rate?: number | null
          created_at?: string | null
          employment_type?: string | null
          experience_years?: number | null
          hired_at?: string | null
          hourly_rate?: number | null
          id?: string | null
          is_active?: boolean | null
          is_bookable?: boolean | null
          is_featured?: boolean | null
          languages?: string[] | null
          portfolio_urls?: string[] | null
          preferred_hours?: Json | null
          profile_image_url?: string | null
          rating_average?: number | null
          rating_count?: number | null
          salon_id?: string | null
          settings?: Json | null
          specializations?: string[] | null
          status?: Database["public"]["Enums"]["staff_status"] | null
          terminated_at?: string | null
          title?: string | null
          total_appointments?: number | null
          total_revenue?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          bio?: string | null
          certifications?: Json | null
          commission_rate?: number | null
          created_at?: string | null
          employment_type?: string | null
          experience_years?: number | null
          hired_at?: string | null
          hourly_rate?: number | null
          id?: string | null
          is_active?: boolean | null
          is_bookable?: boolean | null
          is_featured?: boolean | null
          languages?: string[] | null
          portfolio_urls?: string[] | null
          preferred_hours?: Json | null
          profile_image_url?: string | null
          rating_average?: number | null
          rating_count?: number | null
          salon_id?: string | null
          settings?: Json | null
          specializations?: string[] | null
          status?: Database["public"]["Enums"]["staff_status"] | null
          terminated_at?: string | null
          title?: string | null
          total_appointments?: number | null
          total_revenue?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      staff_schedules: {
        Row: {
          break_end: string | null
          break_start: string | null
          created_at: string | null
          day_of_week: Database["public"]["Enums"]["day_of_week"] | null
          effective_from: string | null
          effective_until: string | null
          end_time: string | null
          id: string | null
          is_active: boolean | null
          salon_id: string | null
          staff_id: string | null
          start_time: string | null
          updated_at: string | null
        }
        Insert: {
          break_end?: string | null
          break_start?: string | null
          created_at?: string | null
          day_of_week?: Database["public"]["Enums"]["day_of_week"] | null
          effective_from?: string | null
          effective_until?: string | null
          end_time?: string | null
          id?: string | null
          is_active?: boolean | null
          salon_id?: string | null
          staff_id?: string | null
          start_time?: string | null
          updated_at?: string | null
        }
        Update: {
          break_end?: string | null
          break_start?: string | null
          created_at?: string | null
          day_of_week?: Database["public"]["Enums"]["day_of_week"] | null
          effective_from?: string | null
          effective_until?: string | null
          end_time?: string | null
          id?: string | null
          is_active?: boolean | null
          salon_id?: string | null
          staff_id?: string | null
          start_time?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      staff_services: {
        Row: {
          created_at: string | null
          duration_override: number | null
          id: string | null
          is_available: boolean | null
          notes: string | null
          performed_count: number | null
          price_override: number | null
          proficiency_level:
            | Database["public"]["Enums"]["proficiency_level"]
            | null
          rating_average: number | null
          rating_count: number | null
          service_id: string | null
          staff_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          duration_override?: number | null
          id?: string | null
          is_available?: boolean | null
          notes?: string | null
          performed_count?: number | null
          price_override?: number | null
          proficiency_level?:
            | Database["public"]["Enums"]["proficiency_level"]
            | null
          rating_average?: number | null
          rating_count?: number | null
          service_id?: string | null
          staff_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          duration_override?: number | null
          id?: string | null
          is_available?: boolean | null
          notes?: string | null
          performed_count?: number | null
          price_override?: number | null
          proficiency_level?:
            | Database["public"]["Enums"]["proficiency_level"]
            | null
          rating_average?: number | null
          rating_count?: number | null
          service_id?: string | null
          staff_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      time_off_requests: {
        Row: {
          auto_reschedule: boolean | null
          created_at: string | null
          end_date: string | null
          id: string | null
          notify_customers: boolean | null
          reason: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          salon_id: string | null
          staff_id: string | null
          start_date: string | null
          status: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          auto_reschedule?: boolean | null
          created_at?: string | null
          end_date?: string | null
          id?: string | null
          notify_customers?: boolean | null
          reason?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          salon_id?: string | null
          staff_id?: string | null
          start_date?: string | null
          status?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          auto_reschedule?: boolean | null
          created_at?: string | null
          end_date?: string | null
          id?: string | null
          notify_customers?: boolean | null
          reason?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          salon_id?: string | null
          staff_id?: string | null
          start_date?: string | null
          status?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          expires_at: string | null
          granted_at: string | null
          granted_by: string | null
          id: string | null
          is_active: boolean | null
          metadata: Json | null
          notes: string | null
          permissions: string[] | null
          restrictions: Json | null
          revoke_reason: string | null
          revoked_at: string | null
          revoked_by: string | null
          role: Database["public"]["Enums"]["role_type"] | null
          salon_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string | null
          is_active?: boolean | null
          metadata?: Json | null
          notes?: string | null
          permissions?: string[] | null
          restrictions?: Json | null
          revoke_reason?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          role?: Database["public"]["Enums"]["role_type"] | null
          salon_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string | null
          is_active?: boolean | null
          metadata?: Json | null
          notes?: string | null
          permissions?: string[] | null
          restrictions?: Json | null
          revoke_reason?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          role?: Database["public"]["Enums"]["role_type"] | null
          salon_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      audit_http_request: {
        Args: { body?: Json; headers?: Json; method: string; url: string }
        Returns: number
      }
      build_notification_payload: {
        Args: {
          p_data?: Json
          p_event_type: string
          p_record_id: string
          p_salon_id?: string
          p_table_name: string
          p_user_id?: string
        }
        Returns: Json
      }
      calculate_duration_minutes: {
        Args: { end_time: string; start_time: string }
        Returns: number
      }
      can_manage_salon: {
        Args: { salon_id: string }
        Returns: boolean
      }
      clean_phone_number: {
        Args: { phone: string }
        Returns: string
      }
      generate_random_code: {
        Args: { length?: number }
        Returns: string
      }
      generate_slug: {
        Args: { input_text: string }
        Returns: string
      }
      get_user_channels: {
        Args: { p_user_id: string }
        Returns: string[]
      }
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      has_role: {
        Args: { required_role: string }
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_future_timestamp: {
        Args: { ts: string }
        Returns: boolean
      }
      is_owner: {
        Args: { check_user_id: string }
        Returns: boolean
      }
      is_platform_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_salon_owner: {
        Args: { salon_id: string }
        Returns: boolean
      }
      is_staff_of_salon: {
        Args: { salon_id: string }
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
      refresh_user_role_claim: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      session_has_mfa: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      subscribe_to_channels: {
        Args: { p_user_id: string }
        Returns: {
          channel: string
          description: string
        }[]
      }
      user_has_role: {
        Args: { required_role: string }
        Returns: boolean
      }
      user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      appointment_status:
        | "draft"
        | "pending"
        | "confirmed"
        | "checked_in"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "no_show"
        | "rescheduled"
      audit_category:
        | "authentication"
        | "data_modification"
        | "access_control"
        | "system_monitoring"
        | "compliance"
        | "maintenance"
        | "security"
        | "performance"
      audit_event_type:
        | "user_action"
        | "system_event"
        | "data_access"
        | "authentication"
        | "authorization"
        | "api_call"
        | "security_event"
      audit_severity: "info" | "debug" | "warning" | "error" | "critical"
      compliance_type:
        | "gdpr"
        | "hipaa"
        | "sox"
        | "pci_dss"
        | "ccpa"
        | "iso27001"
        | "security_audit"
        | "data_retention"
      data_operation: "INSERT" | "UPDATE" | "DELETE"
      day_of_week:
        | "monday"
        | "tuesday"
        | "wednesday"
        | "thursday"
        | "friday"
        | "saturday"
        | "sunday"
      incident_severity: "low" | "medium" | "high" | "critical"
      incident_status:
        | "detected"
        | "investigating"
        | "contained"
        | "resolved"
        | "false_positive"
      loyalty_transaction_type:
        | "earned"
        | "redeemed"
        | "expired"
        | "adjusted"
        | "bonus"
      notification_channel: "email" | "sms" | "push" | "in_app" | "whatsapp"
      notification_status:
        | "queued"
        | "sending"
        | "sent"
        | "delivered"
        | "opened"
        | "clicked"
        | "failed"
        | "bounced"
        | "unsubscribed"
      notification_type:
        | "appointment_confirmation"
        | "appointment_reminder"
        | "appointment_cancelled"
        | "appointment_rescheduled"
        | "promotion"
        | "review_request"
        | "loyalty_update"
        | "staff_message"
        | "system_alert"
        | "welcome"
        | "birthday"
        | "other"
      payment_method:
        | "cash"
        | "card"
        | "online"
        | "wallet"
        | "loyalty_points"
        | "gift_card"
        | "other"
      payment_status:
        | "pending"
        | "processing"
        | "completed"
        | "failed"
        | "refunded"
        | "partially_refunded"
        | "cancelled"
      period_type:
        | "hourly"
        | "daily"
        | "weekly"
        | "monthly"
        | "quarterly"
        | "yearly"
      proficiency_level:
        | "trainee"
        | "beginner"
        | "intermediate"
        | "advanced"
        | "expert"
        | "master"
      role_type:
        | "super_admin"
        | "platform_admin"
        | "tenant_owner"
        | "salon_owner"
        | "salon_manager"
        | "senior_staff"
        | "staff"
        | "junior_staff"
        | "customer"
        | "vip_customer"
        | "guest"
      security_incident_type:
        | "failed_login"
        | "brute_force"
        | "suspicious_activity"
        | "data_breach"
        | "unauthorized_access"
        | "privilege_escalation"
        | "high_risk_event"
        | "malware_detected"
        | "sql_injection"
        | "xss_attempt"
      service_status: "active" | "inactive" | "discontinued" | "seasonal"
      staff_status:
        | "available"
        | "busy"
        | "break"
        | "off_duty"
        | "vacation"
        | "sick_leave"
        | "training"
      thread_priority: "low" | "normal" | "high" | "urgent"
      thread_status: "open" | "in_progress" | "resolved" | "closed" | "archived"
      time_off_status: "pending" | "approved" | "rejected" | "cancelled"
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
        "draft",
        "pending",
        "confirmed",
        "checked_in",
        "in_progress",
        "completed",
        "cancelled",
        "no_show",
        "rescheduled",
      ],
      audit_category: [
        "authentication",
        "data_modification",
        "access_control",
        "system_monitoring",
        "compliance",
        "maintenance",
        "security",
        "performance",
      ],
      audit_event_type: [
        "user_action",
        "system_event",
        "data_access",
        "authentication",
        "authorization",
        "api_call",
        "security_event",
      ],
      audit_severity: ["info", "debug", "warning", "error", "critical"],
      compliance_type: [
        "gdpr",
        "hipaa",
        "sox",
        "pci_dss",
        "ccpa",
        "iso27001",
        "security_audit",
        "data_retention",
      ],
      data_operation: ["INSERT", "UPDATE", "DELETE"],
      day_of_week: [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ],
      incident_severity: ["low", "medium", "high", "critical"],
      incident_status: [
        "detected",
        "investigating",
        "contained",
        "resolved",
        "false_positive",
      ],
      loyalty_transaction_type: [
        "earned",
        "redeemed",
        "expired",
        "adjusted",
        "bonus",
      ],
      notification_channel: ["email", "sms", "push", "in_app", "whatsapp"],
      notification_status: [
        "queued",
        "sending",
        "sent",
        "delivered",
        "opened",
        "clicked",
        "failed",
        "bounced",
        "unsubscribed",
      ],
      notification_type: [
        "appointment_confirmation",
        "appointment_reminder",
        "appointment_cancelled",
        "appointment_rescheduled",
        "promotion",
        "review_request",
        "loyalty_update",
        "staff_message",
        "system_alert",
        "welcome",
        "birthday",
        "other",
      ],
      payment_method: [
        "cash",
        "card",
        "online",
        "wallet",
        "loyalty_points",
        "gift_card",
        "other",
      ],
      payment_status: [
        "pending",
        "processing",
        "completed",
        "failed",
        "refunded",
        "partially_refunded",
        "cancelled",
      ],
      period_type: [
        "hourly",
        "daily",
        "weekly",
        "monthly",
        "quarterly",
        "yearly",
      ],
      proficiency_level: [
        "trainee",
        "beginner",
        "intermediate",
        "advanced",
        "expert",
        "master",
      ],
      role_type: [
        "super_admin",
        "platform_admin",
        "tenant_owner",
        "salon_owner",
        "salon_manager",
        "senior_staff",
        "staff",
        "junior_staff",
        "customer",
        "vip_customer",
        "guest",
      ],
      security_incident_type: [
        "failed_login",
        "brute_force",
        "suspicious_activity",
        "data_breach",
        "unauthorized_access",
        "privilege_escalation",
        "high_risk_event",
        "malware_detected",
        "sql_injection",
        "xss_attempt",
      ],
      service_status: ["active", "inactive", "discontinued", "seasonal"],
      staff_status: [
        "available",
        "busy",
        "break",
        "off_duty",
        "vacation",
        "sick_leave",
        "training",
      ],
      thread_priority: ["low", "normal", "high", "urgent"],
      thread_status: ["open", "in_progress", "resolved", "closed", "archived"],
      time_off_status: ["pending", "approved", "rejected", "cancelled"],
    },
  },
} as const
