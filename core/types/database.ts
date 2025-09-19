import { Database } from "@/types/database.types";

// Base types from Supabase
export type Json =
  Database["public"]["Functions"]["build_notification_payload"]["Returns"];
export type AppointmentStatus =
  Database["public"]["Enums"]["appointment_status"];
export type PaymentStatus = Database["public"]["Enums"]["payment_status"];
export type RoleType = Database["public"]["Enums"]["role_type"];
export type ServiceStatus = Database["public"]["Enums"]["service_status"];
export type StaffStatus = Database["public"]["Enums"]["staff_status"];
export type TimeOffStatus = Database["public"]["Enums"]["time_off_status"];
export type NotificationType = Database["public"]["Enums"]["notification_type"];
export type NotificationChannel =
  Database["public"]["Enums"]["notification_channel"];
export type DayOfWeek = Database["public"]["Enums"]["day_of_week"];

// Appointment types based on scheduling schema
export interface Appointment {
  id: string;
  salon_id: string;
  customer_id: string;
  staff_id?: string;
  start_time: string;
  end_time: string;
  duration_minutes?: number;
  status: AppointmentStatus;
  confirmation_code?: string;
  service_count?: number;
  subtotal?: number;
  tax_amount?: number;
  discount_amount?: number;
  tip_amount?: number;
  total_amount?: number;
  payment_status?: PaymentStatus;
  payment_method?: string;
  paid_at?: string;
  deposit_required: boolean;
  deposit_amount?: number;
  deposit_paid: boolean;
  notes?: string;
  internal_notes?: string;
  preferences?: Json;
  booking_source?: string;
  referral_source?: string;
  reminder_sent: boolean;
  reminder_sent_at?: string;
  followup_sent: boolean;
  cancelled_at?: string;
  cancelled_by?: string;
  cancellation_reason?: string;
  marked_no_show_at?: string;
  marked_no_show_by?: string;
  checked_in_at?: string;
  checked_in_by?: string;
  completed_at?: string;
  completed_by?: string;
  metadata?: Json;
  created_at: string;
  updated_at: string;
  resource_id?: string;
  resource_type?: string;
}

export interface AppointmentService {
  id: string;
  appointment_id: string;
  service_id: string;
  staff_id?: string;
  service_name: string;
  duration_minutes: number;
  unit_price: number;
  quantity: number;
  discount_percentage?: number;
  subtotal?: number;
  service_order?: number;
  start_time?: string;
  end_time?: string;
  is_completed?: boolean;
  completed_at?: string;
  notes?: string;
  created_at: string;
}

// Staff types based on organization schema
export interface StaffProfile {
  id: string;
  user_id: string;
  salon_id: string;
  display_name: string;
  professional_title?: string;
  bio?: string;
  specialties?: string[];
  years_experience?: number;
  hire_date?: string;
  employee_id?: string;
  commission_rate?: number;
  is_active: boolean;
  can_accept_bookings: boolean;
  booking_buffer_minutes?: number;
  max_advance_booking_days?: number;
  avatar_url?: string;
  portfolio_images?: string[];
  certifications?: Json[];
  languages?: string[];
  rating?: number;
  review_count?: number;
  preferred_services?: string[];
  blocked_services?: string[];
  status: StaffStatus;
  availability_status?: string;
  next_available?: string;
  created_at: string;
  updated_at: string;
}

export interface StaffSchedule {
  id: string;
  staff_id: string;
  salon_id?: string;
  day_of_week: DayOfWeek;
  start_time: string;
  end_time: string;
  break_start?: string;
  break_end?: string;
  is_available: boolean;
  effective_from: string;
  effective_until?: string;
  created_at: string;
  updated_at: string;
}

// Service types based on catalog schema
export interface Service {
  id: string;
  salon_id: string;
  category_id?: string;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  duration_minutes: number;
  buffer_time_minutes?: number;
  price: number;
  discounted_price?: number;
  cost?: number;
  is_addon: boolean;
  is_featured: boolean;
  is_active: boolean;
  status: ServiceStatus;
  requires_deposit: boolean;
  deposit_amount?: number;
  deposit_percentage?: number;
  max_capacity: number;
  min_capacity: number;
  tags?: string[];
  benefits?: string[];
  requirements?: string[];
  image_url?: string;
  gallery?: string[];
  metadata?: Json;
  sort_order?: number;
  created_at: string;
  updated_at: string;
}

export interface ServiceCategory {
  id: string;
  salon_id?: string;
  parent_id?: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  icon?: string;
  color?: string;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  service_count?: number;
  path?: string;
  level?: number;
  metadata?: Json;
  created_at: string;
  updated_at: string;
}

export interface StaffService {
  id: string;
  staff_id: string;
  service_id: string;
  salon_id?: string;
  proficiency_level?: string;
  custom_duration?: number;
  custom_price?: number;
  is_available: boolean;
  max_daily_bookings?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Salon types based on organization schema
export interface Salon {
  id: string;
  chain_id?: string;
  owner_id: string;
  name: string;
  slug: string;
  tagline?: string;
  description?: string;
  email: string;
  phone: string;
  website?: string;
  logo_url?: string;
  cover_image_url?: string;
  gallery?: string[];
  timezone: string;
  currency: string;
  country_code: string;
  language_code: string;
  date_format?: string;
  time_format?: string;
  week_starts_on?: DayOfWeek;
  tax_rate?: number;
  tax_name?: string;
  tax_number?: string;
  business_type?: string;
  establishment_year?: number;
  employee_count?: number;
  service_count?: number;
  average_rating?: number;
  total_reviews?: number;
  is_active: boolean;
  is_verified: boolean;
  verified_at?: string;
  is_featured: boolean;
  accepts_online_bookings: boolean;
  accepts_walkins: boolean;
  requires_deposit: boolean;
  default_deposit_percentage?: number;
  cancellation_policy?: string;
  booking_instructions?: string;
  parking_available: boolean;
  wheelchair_accessible: boolean;
  wifi_available: boolean;
  pets_allowed: boolean;
  children_allowed: boolean;
  payment_methods?: string[];
  accepted_cards?: string[];
  social_media?: Json;
  amenities?: string[];
  brands?: string[];
  certifications?: Json[];
  awards?: Json[];
  membership_plans?: Json[];
  loyalty_program?: Json;
  referral_program?: Json;
  settings?: Json;
  metadata?: Json;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface SalonLocation {
  id: string;
  salon_id: string;
  is_primary: boolean;
  name?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
  latitude?: number;
  longitude?: number;
  place_id?: string;
  formatted_address?: string;
  neighborhood?: string;
  landmark?: string;
  cross_streets?: string;
  parking_info?: string;
  public_transport?: string[];
  delivery_radius_km?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// User and Profile types based on identity schema
export interface Profile {
  id: string;
  email?: string;
  phone?: string;
  username?: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  avatar_url?: string;
  date_of_birth?: string;
  gender?: string;
  bio?: string;
  preferences?: Json;
  notification_preferences?: Json;
  privacy_settings?: Json;
  language?: string;
  timezone?: string;
  country?: string;
  city?: string;
  postal_code?: string;
  address?: string;
  emergency_contact?: Json;
  medical_info?: Json;
  allergies?: string[];
  notes?: string;
  tags?: string[];
  referral_code?: string;
  referred_by?: string;
  customer_since?: string;
  last_visit?: string;
  visit_count?: number;
  total_spent?: number;
  loyalty_points?: number;
  loyalty_tier?: string;
  is_vip: boolean;
  is_blocked: boolean;
  blocked_reason?: string;
  blocked_at?: string;
  metadata?: Json;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: RoleType;
  salon_id?: string;
  granted_by?: string;
  granted_at: string;
  expires_at?: string;
  is_active: boolean;
  revoked_at?: string;
  revoked_by?: string;
  revoked_reason?: string;
  created_at: string;
  updated_at: string;
}

// Review types based on engagement schema
export interface Review {
  id: string;
  salon_id: string;
  customer_id: string;
  appointment_id?: string;
  staff_id?: string;
  service_id?: string;
  rating: number;
  title?: string;
  comment?: string;
  pros?: string[];
  cons?: string[];
  photos?: string[];
  is_verified: boolean;
  is_featured: boolean;
  is_anonymous: boolean;
  would_recommend: boolean;
  response?: string;
  response_by?: string;
  response_at?: string;
  helpful_count: number;
  reported_count: number;
  is_hidden: boolean;
  hidden_reason?: string;
  tags?: string[];
  metadata?: Json;
  created_at: string;
  updated_at: string;
}

// Notification types based on communication schema
export interface Notification {
  id: string;
  user_id: string;
  salon_id?: string;
  type: NotificationType;
  channel: NotificationChannel;
  status: Database["public"]["Enums"]["notification_status"];
  priority?: Database["public"]["Enums"]["thread_priority"];
  title: string;
  message: string;
  data?: Json;
  action_url?: string;
  action_text?: string;
  icon?: string;
  image_url?: string;
  is_read: boolean;
  read_at?: string;
  is_archived: boolean;
  archived_at?: string;
  expires_at?: string;
  scheduled_for?: string;
  sent_at?: string;
  delivered_at?: string;
  opened_at?: string;
  clicked_at?: string;
  error_message?: string;
  retry_count: number;
  metadata?: Json;
  created_at: string;
  updated_at: string;
}

// Helper types for forms and mutations
export type AppointmentInsert = Omit<
  Appointment,
  "id" | "created_at" | "updated_at"
>;
export type AppointmentUpdate = Partial<AppointmentInsert>;

export type ServiceInsert = Omit<
  Service,
  "id" | "created_at" | "updated_at" | "slug"
>;
export type ServiceUpdate = Partial<ServiceInsert>;

export type StaffProfileInsert = Omit<
  StaffProfile,
  "id" | "created_at" | "updated_at"
>;
export type StaffProfileUpdate = Partial<StaffProfileInsert>;

export type SalonInsert = Omit<
  Salon,
  "id" | "created_at" | "updated_at" | "slug"
>;
export type SalonUpdate = Partial<SalonInsert>;

export type ProfileInsert = Omit<Profile, "id" | "created_at" | "updated_at">;
export type ProfileUpdate = Partial<ProfileInsert>;
