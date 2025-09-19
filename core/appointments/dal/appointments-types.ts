import { Database } from "@/types/database.types";
import type { ProfileWithDetails, StaffProfileWithDetails } from "@/core/profiles/types";

// Database types
export type Appointment = Database["public"]["Tables"]["appointments"]["Row"];
export type AppointmentInsert =
  Database["public"]["Tables"]["appointments"]["Insert"];
export type AppointmentUpdate =
  Database["public"]["Tables"]["appointments"]["Update"];

export type AppointmentService =
  Database["public"]["Tables"]["appointment_services"]["Row"];
export type AppointmentServiceInsert =
  Database["public"]["Tables"]["appointment_services"]["Insert"];
export type AppointmentServiceUpdate =
  Database["public"]["Tables"]["appointment_services"]["Update"];

// Status enums - must match database enum
export type AppointmentStatus =
  | "draft"
  | "pending"
  | "confirmed"
  | "checked_in"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "no_show"
  | "rescheduled";

export type PaymentStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "refunded"
  | "partially_refunded"
  | "cancelled";

// Extended types with relations
export interface AppointmentWithRelations extends Appointment {
  // Add related data
  services?: AppointmentService[];
  appointment_services?: AppointmentService[];
  customer?: ProfileWithDetails;
  staff?: StaffProfileWithDetails;
  salon?: Database["public"]["Tables"]["salons"]["Row"];
}

// Filter types
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

// Response types
export interface AppointmentListResponse {
  appointments: AppointmentWithRelations[];
  total: number;
  page: number;
  limit: number;
}

// Stats types
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

// Availability types
export interface AvailableSlot {
  date: string;
  time: string;
  staffId: string;
  duration: number;
  available: boolean;
}
