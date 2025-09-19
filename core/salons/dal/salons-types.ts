/**
 * Salon Types - Based on actual database schema
 *
 * Using actual organization.salons table structure
 */

// Base type from actual database schema (organization.salons)
export interface Salon {
  id: string;
  name: string;
  slug: string;
  business_name?: string;
  business_type?: string;
  chain_id?: string;
  owner_id: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: Record<string, any>; // jsonb
  latitude?: number;
  longitude?: number;
  coordinates?: Record<string, any>; // jsonb
  description?: string;
  short_description?: string;
  established_date?: string;
  employee_count?: number;
  timezone?: string;
  currency_code?: string;
  language_code?: string;
  booking_lead_time_hours?: number;
  cancellation_hours?: number;
  features?: string[]; // ARRAY
  subscription_tier?: string;
  subscription_expires_at?: string;
  max_staff?: number;
  max_services?: number;
  max_bookings_per_day?: number;
  logo_url?: string;
  cover_image_url?: string;
  gallery_urls?: string[]; // ARRAY
  brand_colors?: Record<string, any>; // jsonb
  social_links?: Record<string, any>; // jsonb
  settings?: Record<string, any>; // jsonb
  rating_average?: number;
  rating_count?: number;
  total_bookings?: number;
  total_revenue?: number;
  tags?: string[]; // ARRAY
  search_vector?: any; // tsvector
  is_active: boolean;
  is_verified: boolean;
  is_featured: boolean;
  is_accepting_bookings: boolean;
  created_at: string;
  updated_at: string;
  verified_at?: string;
  deleted_at?: string;
}

export type SalonInsert = Omit<Salon, "id" | "created_at" | "updated_at">;
export type SalonUpdate = Partial<Omit<SalonInsert, "owner_id">>;

export interface SalonChain {
  id: string;
  name: string;
  slug: string;
  legal_name?: string;
  headquarters_address?: Record<string, any>; // jsonb
  corporate_email?: string;
  corporate_phone?: string;
  website?: string;
  owner_id: string;
  logo_url?: string;
  brand_colors?: Record<string, any>; // jsonb
  brand_guidelines?: string;
  settings?: Record<string, any>; // jsonb
  features?: Record<string, any>; // jsonb
  subscription_tier?: string;
  billing_email?: string;
  salon_count?: number;
  total_staff_count?: number;
  total_customer_count?: number;
  is_active: boolean;
  is_verified: boolean;
  verified_at?: string;
  created_at: string;
  updated_at: string;
}

export type SalonChainInsert = Omit<SalonChain, "id" | "created_at" | "updated_at">;
export type SalonChainUpdate = Partial<SalonChainInsert>;

export interface OperatingHours {
  id: string;
  salon_id: string;
  day_of_week: number;
  open_time: string;
  close_time: string;
  is_closed: boolean;
  created_at: string;
  updated_at: string;
}

export type OperatingHoursInsert = Omit<OperatingHours, "id" | "created_at" | "updated_at">;
export type OperatingHoursUpdate = Partial<Omit<OperatingHoursInsert, "salon_id">>;

export interface SpecialDate {
  id: string;
  salon_id: string;
  date: string;
  open_time?: string;
  close_time?: string;
  is_closed: boolean;
  reason?: string;
  created_at: string;
  updated_at: string;
}

export type SpecialDateInsert = Omit<SpecialDate, "id" | "created_at" | "updated_at">;
export type SpecialDateUpdate = Partial<Omit<SpecialDateInsert, "salon_id">>;

export interface SalonLocation {
  id: string;
  salon_id: string;
  name: string;
  slug: string;
  is_primary: boolean;
  address?: Record<string, any>; // jsonb
  latitude?: number;
  longitude?: number;
  coordinates?: Record<string, any>; // jsonb
  phone?: string;
  email?: string;
  max_capacity?: number;
  staff_count?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type SalonLocationInsert = Omit<SalonLocation, "id" | "created_at" | "updated_at">;
export type SalonLocationUpdate = Partial<Omit<SalonLocationInsert, "salon_id">>;

// Extended types
export interface SalonWithRelations extends Salon {
  operating_hours?: OperatingHours[];
  locations?: SalonLocation[];
  special_dates?: SpecialDate[];
  chain?: SalonChain;
  rating_average?: number;
  rating_count?: number;
  total_staff?: number;
  primary_location?: SalonLocation;
}

export interface SalonChainWithSalons extends SalonChain {
  salons?: Salon[];
}

export interface SalonFilters {
  chain_id?: string;
  owner_id?: string;
  is_active?: boolean;
  is_featured?: boolean;
  is_verified?: boolean;
  is_accepting_bookings?: boolean;
  city?: string;
  state?: string;
  search?: string;
}

export interface SalonMetrics {
  total_appointments: number;
  total_customers: number;
  total_revenue: number;
  average_rating: number;
  total_reviews: number;
}

// Enum types for salons
export type BusinessType = "beauty_salon" | "hair_salon" | "nail_salon" | "spa" | "barbershop" | "wellness_center" | "other";
export type DayOfWeek = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";