/**
 * Staff Types - Based on actual database schema
 *
 * Using actual organization.staff_profiles table structure
 */

// Base type from actual database schema (organization.staff_profiles)
export interface StaffProfile {
  id: string;
  user_id: string;
  salon_id: string;
  title?: string;
  bio?: string;
  experience_years?: number;
  specializations?: string[]; // ARRAY
  certifications?: Record<string, any>; // jsonb
  languages?: string[]; // ARRAY
  status?: "available" | "busy" | "break" | "off_duty" | "vacation" | "sick_leave" | "training";
  commission_rate?: number;
  hourly_rate?: number;
  rating_average?: number;
  rating_count?: number;
  total_appointments?: number;
  total_revenue?: number;
  profile_image_url?: string;
  portfolio_urls?: string[]; // ARRAY
  preferred_hours?: Record<string, any>; // jsonb
  settings?: Record<string, any>; // jsonb
  hired_at?: string; // date
  employment_type?: string;
  is_active: boolean;
  is_bookable: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  terminated_at?: string;
}

export type StaffProfileInsert = Omit<StaffProfile, "id" | "created_at" | "updated_at">;
export type StaffProfileUpdate = Partial<Omit<StaffProfileInsert, "user_id" | "salon_id">>;

// From organization.staff_schedules
export interface StaffSchedule {
  id: string;
  staff_id: string;
  salon_id: string;
  day_of_week: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
  start_time: string; // time without time zone
  end_time: string; // time without time zone
  break_start?: string; // time without time zone
  break_end?: string; // time without time zone
  effective_from?: string; // date
  effective_until?: string; // date
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type StaffScheduleInsert = Omit<StaffSchedule, "id" | "created_at" | "updated_at">;
export type StaffScheduleUpdate = Partial<Omit<StaffScheduleInsert, "staff_id">>;

// From organization.staff_services
export interface StaffService {
  id: string;
  staff_id: string;
  service_id: string;
  proficiency_level?: string; // USER-DEFINED
  price_override?: number;
  duration_override?: number;
  performed_count?: number;
  rating_average?: number;
  rating_count?: number;
  is_available: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type StaffServiceInsert = Omit<StaffService, "id" | "created_at" | "updated_at">;
export type StaffServiceUpdate = Partial<Omit<StaffServiceInsert, "staff_id" | "service_id">>;

// From organization.staff_performance
export interface StaffPerformance {
  id: string;
  staff_id: string;
  period_start: string; // date
  period_end: string; // date
  total_appointments?: number;
  completed_appointments?: number;
  cancelled_by_staff?: number;
  cancelled_by_customer?: number;
  no_shows?: number;
  total_service_minutes?: number;
  total_available_minutes?: number;
  utilization_rate?: number;
  average_appointment_duration?: number;
  unique_customers?: number;
  new_customers?: number;
  returning_customers?: number;
  customer_retention_rate?: number;
  services_performed?: number;
  top_services?: Record<string, any>; // jsonb
  service_mix?: Record<string, any>; // jsonb
  average_rating?: number;
  total_reviews?: number;
  five_star_reviews?: number;
  online_bookings?: number;
  request_bookings?: number;
  rebook_rate?: number;
  services_per_day?: number;
  gap_time_minutes?: number;
  overtime_minutes?: number;
  created_at: string;
  updated_at: string;
}

export type StaffPerformanceInsert = Omit<StaffPerformance, "id" | "created_at" | "updated_at">;
export type StaffPerformanceUpdate = Partial<Omit<StaffPerformanceInsert, "staff_id">>;

export interface TimeOffRequest {
  id: string;
  staff_id: string;
  salon_id: string;
  start_date: string;
  end_date: string;
  reason?: string;
  status: TimeOffStatus;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export type TimeOffRequestInsert = Omit<TimeOffRequest, "id" | "created_at" | "updated_at" | "approved_at" | "approved_by">;
export type TimeOffRequestUpdate = Partial<Omit<TimeOffRequestInsert, "staff_id" | "salon_id">>;

export interface BlockedTime {
  id: string;
  salon_id?: string;
  staff_id?: string;
  start_time: string;
  end_time: string;
  reason?: string;
  recurring_rule?: string;
  created_at: string;
  updated_at: string;
}

export type BlockedTimeInsert = Omit<BlockedTime, "id" | "created_at" | "updated_at">;
export type BlockedTimeUpdate = Partial<Omit<BlockedTimeInsert, "salon_id" | "staff_id">>;

// Extended types
export interface StaffProfileWithRelations extends StaffProfile {
  user?: any;
  schedules?: StaffSchedule[];
  time_off_requests?: TimeOffRequest[];
  services?: StaffService[];
  performance?: StaffPerformance[];
  // Legacy aliases for backward compatibility
  display_name?: string; // Maps to user info
  specialties?: string[]; // Maps to specializations
}

export interface StaffWithDetails extends StaffProfileWithRelations {
  // Alias for backward compatibility
}

// Legacy alias for backward compatibility
export interface StaffMember extends StaffProfileWithRelations {}

export interface StaffFilters {
  salon_id?: string;
  is_active?: boolean;
  is_bookable?: boolean;
  is_featured?: boolean;
  search?: string;
  status?: string;
  employment_type?: string;
  can_accept_bookings?: boolean; // Added for UI filtering
}

export interface TimeOffFilters {
  staff_id?: string;
  salon_id?: string;
  status?: TimeOffStatus;
  start_date?: string;
  end_date?: string;
}

export type TimeOffStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface StaffAvailability {
  staff_id: string;
  date: string;
  available_slots: TimeSlot[];
  blocked_times: BlockedTime[];
  appointments: any[];
}

export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}