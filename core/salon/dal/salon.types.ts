/**
 * Salon Types - Using database types as source of truth
 */

import { Database } from "@/types/database.types";

// Database types from Views
export type Salon = Database["public"]["Views"]["salons"]["Row"];
export type SalonInsert = Database["public"]["Views"]["salons"]["Insert"];
export type SalonUpdate = Database["public"]["Views"]["salons"]["Update"];

// Appointment types from database
export type Appointment = Database["public"]["Views"]["appointments"]["Row"];
export type AppointmentInsert = Database["public"]["Views"]["appointments"]["Insert"];
export type AppointmentUpdate = Database["public"]["Views"]["appointments"]["Update"];

export type AppointmentService = Database["public"]["Views"]["appointment_services"]["Row"];
export type AppointmentServiceInsert = Database["public"]["Views"]["appointment_services"]["Insert"];
export type AppointmentServiceUpdate = Database["public"]["Views"]["appointment_services"]["Update"];

// Status enums from database
export type AppointmentStatus = Database["public"]["Enums"]["appointment_status"];
export type PaymentStatus = Database["public"]["Enums"]["payment_status"];

// Profile types
type Profile = Database['public']['Views']['profiles']['Row'];
type StaffProfile = Database['public']['Views']['staff_profiles']['Row'];

// Extended types with relations
export interface SalonWithRelations extends Salon {
  owner?: Profile;
  staff?: StaffProfile[];
  appointments?: Appointment[];
}

export interface AppointmentWithRelations extends Appointment {
  services?: AppointmentService[];
  appointment_services?: AppointmentService[];
  customer?: Profile;
  staff?: StaffProfile;
  salon?: Salon;
}

// Filter types
export interface SalonFilters {
  is_active?: boolean;
  is_verified?: boolean;
  is_featured?: boolean;
  is_accepting_bookings?: boolean;
  search?: string;
  owner_id?: string;
  subscription_tier?: string;
}

export interface AppointmentFilters {
  salon_id?: string;
  staff_id?: string;
  customer_id?: string;
  status?: AppointmentStatus;
  start_date?: string;
  end_date?: string;
  payment_status?: PaymentStatus;
  search?: string;
}

// Service types from database
export type Service = Database['public']['Views']['services']['Row'];
export type ServiceInsert = Database['public']['Views']['services']['Insert'];
export type ServiceUpdate = Database['public']['Views']['services']['Update'];

export type ServiceCategory = Database['public']['Views']['service_categories']['Row'];
export type ServiceCategoryInsert = Database['public']['Views']['service_categories']['Insert'];
export type ServiceCategoryUpdate = Database['public']['Views']['service_categories']['Update'];

export type StaffService = Database['public']['Views']['staff_services']['Row'];
export type StaffServiceInsert = Database['public']['Views']['staff_services']['Insert'];
export type StaffServiceUpdate = Database['public']['Views']['staff_services']['Update'];

export interface ServiceWithRelations extends Service {
  category?: ServiceCategory;
}

// Stats types
export interface SalonStats {
  total: number;
  active: number;
  verified: number;
  featured: number;
  accepting_bookings: number;
}

export interface AppointmentStats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  revenue: number;
  upcomingToday: number;
  completedToday: number;
}

// Response types
export interface SalonListResponse {
  salons: SalonWithRelations[];
  total: number;
  page: number;
  limit: number;
}

export interface AppointmentListResponse {
  appointments: AppointmentWithRelations[];
  total: number;
  page: number;
  limit: number;
}

// Operating hours type
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

// Location type
export interface Location {
  id: string;
  salon_id: string;
  name: string;
  address: Record<string, any>;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  is_primary: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Availability types
export interface AvailableSlot {
  date: string;
  time: string;
  staffId: string;
  duration: number;
  available: boolean;
}