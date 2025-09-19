/**
 * Staff Types - Using database types as source of truth
 */

import { Database } from "@/types/database.types";

// Base types from database Views
export type StaffProfile = Database["public"]["Views"]["staff_profiles"]["Row"];
export type StaffProfileInsert = Database["public"]["Views"]["staff_profiles"]["Insert"];
export type StaffProfileUpdate = Database["public"]["Views"]["staff_profiles"]["Update"];

// Staff status enum from database
export type StaffStatus = Database["public"]["Enums"]["staff_status"];

// Staff schedule types from database
export type StaffSchedule = Database["public"]["Views"]["staff_schedules"]["Row"];
export type StaffScheduleInsert = Database["public"]["Views"]["staff_schedules"]["Insert"];
export type StaffScheduleUpdate = Database["public"]["Views"]["staff_schedules"]["Update"];

// Staff service types from database
export type StaffService = Database["public"]["Views"]["staff_services"]["Row"];
export type StaffServiceInsert = Database["public"]["Views"]["staff_services"]["Insert"];
export type StaffServiceUpdate = Database["public"]["Views"]["staff_services"]["Update"];

// Staff performance types from database
export type StaffPerformance = Database["public"]["Views"]["staff_performance"]["Row"];
export type StaffPerformanceInsert = Database["public"]["Views"]["staff_performance"]["Insert"];
export type StaffPerformanceUpdate = Database["public"]["Views"]["staff_performance"]["Update"];

// Time off and blocked time types from database
export type TimeOffRequest = Database["public"]["Views"]["time_off_requests"]["Row"];
export type TimeOffRequestInsert = Database["public"]["Views"]["time_off_requests"]["Insert"];
export type TimeOffRequestUpdate = Database["public"]["Views"]["time_off_requests"]["Update"];

export type BlockedTime = Database["public"]["Views"]["blocked_times"]["Row"];
export type BlockedTimeInsert = Database["public"]["Views"]["blocked_times"]["Insert"];
export type BlockedTimeUpdate = Database["public"]["Views"]["blocked_times"]["Update"];

// Enum types from database
export type DayOfWeek = Database["public"]["Enums"]["day_of_week"];
export type TimeOffStatus = Database["public"]["Enums"]["time_off_status"];
export type ProficiencyLevel = Database["public"]["Enums"]["proficiency_level"];

// Extended types with relations
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

// Legacy aliases for backward compatibility
export interface StaffWithDetails extends StaffProfileWithRelations {}
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