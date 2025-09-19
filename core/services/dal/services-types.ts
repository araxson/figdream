/**
 * Service Types - Based on actual database schema
 *
 * Using actual catalog.services table structure
 */

// Base type from actual database schema (catalog.services)
export interface Service {
  id: string;
  salon_id: string;
  category_id?: string;
  name: string;
  slug: string;
  sku?: string;
  description?: string;
  short_description?: string;
  benefits?: string[];
  includes?: string[];
  requirements?: string;
  duration_minutes: number;
  buffer_minutes?: number;
  total_duration_minutes?: number;
  base_price: number;
  sale_price?: number;
  current_price?: number;
  currency_code: string;
  commission_rate?: number;
  cost?: number;
  profit_margin?: number;
  is_taxable: boolean;
  tax_rate?: number;
  min_advance_booking_hours?: number;
  max_advance_booking_days?: number;
  requires_consultation?: boolean;
  requires_deposit?: boolean;
  deposit_amount?: number;
  deposit_percentage?: number;
  max_capacity?: number;
  min_capacity?: number;
  gender_preference?: string;
  min_age?: number;
  max_age?: number;
  image_url?: string;
  thumbnail_url?: string;
  gallery_urls?: string[];
  video_url?: string;
  meta_title?: string;
  meta_description?: string;
  tags?: string[];
  search_vector?: any; // tsvector
  booking_count?: number;
  revenue_total?: number;
  rating_average?: number;
  rating_count?: number;
  track_inventory?: boolean;
  inventory_count?: number;
  low_stock_threshold?: number;
  is_active: boolean;
  is_bookable: boolean;
  is_featured: boolean;
  is_package: boolean;
  is_addon: boolean;
  created_at: string;
  updated_at: string;
  discontinued_at?: string;
}

export type ServiceInsert = Omit<Service, "id" | "created_at" | "updated_at">;
export type ServiceUpdate = Partial<ServiceInsert>;

export interface ServiceCategory {
  id: string;
  salon_id?: string;
  name: string;
  description?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  service_count?: number; // Added for UI display
}

export type ServiceCategoryInsert = Omit<ServiceCategory, "id" | "created_at" | "updated_at">;
export type ServiceCategoryUpdate = Partial<ServiceCategoryInsert>;

export interface StaffService {
  id: string;
  staff_id: string;
  service_id: string;
  duration_override?: number;
  price_override?: number;
  is_available: boolean;
  created_at: string;
}

export type StaffServiceInsert = Omit<StaffService, "id" | "created_at">;
export type StaffServiceUpdate = Partial<Omit<StaffServiceInsert, "staff_id" | "service_id">>;

// Extended types
export interface ServiceWithRelations extends Service {
  category?: ServiceCategory;
  staff_services?: StaffService[];
}

export interface CategoryWithServices extends ServiceCategory {
  services?: Service[];
}

export interface ServiceFilters {
  salon_id?: string;
  category_id?: string;
  is_active?: boolean;
  is_bookable?: boolean;
  is_featured?: boolean;
  search?: string;
  min_price?: number;
  max_price?: number;
  min_duration?: number;
  max_duration?: number;
  // Legacy aliases for backward compatibility
  salonId?: string; // Maps to salon_id
  searchQuery?: string; // Maps to search
  isActive?: boolean; // Maps to is_active
  isBookable?: boolean; // Maps to is_bookable
  isFeatured?: boolean; // Maps to is_featured
  minPrice?: number; // Maps to min_price
  maxPrice?: number; // Maps to max_price
  minDuration?: number; // Maps to min_duration
  maxDuration?: number; // Maps to max_duration
}

// Additional types for UI components
export interface ServiceWithCategory extends Service {
  category?: ServiceCategory;
}

export interface ServiceStats {
  totalServices: number;
  activeServices: number;
  featuredServices: number;
  averagePrice: number;
  averageDuration: number;
  totalRevenue?: number;
  totalBookings?: number;
}

export interface ServiceListResponse {
  services: ServiceWithRelations[];
  total: number;
  page: number;
  pageSize: number;
}