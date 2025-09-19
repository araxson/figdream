import { Database } from "@/types/database.types";

// Database types from Views
export type TimeOffRequest = Database["public"]["Views"]["time_off_requests"]["Row"];
export type TimeOffRequestInsert = Database["public"]["Views"]["time_off_requests"]["Insert"];
export type TimeOffRequestUpdate = Database["public"]["Views"]["time_off_requests"]["Update"];

// Enum type from database
export type TimeOffStatus = Database["public"]["Enums"]["time_off_status"];

// Extended types for UI
export interface TimeOffRequestWithStaff extends TimeOffRequest {
  staff?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    profile_image_url: string | null;
  };
  reviewer?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
  };
}

// Filter types
export interface TimeOffFilter {
  staff_id?: string;
  salon_id?: string;
  status?: TimeOffStatus;
  start_date?: string;
  end_date?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

// Response types
export interface TimeOffResponse {
  data: TimeOffRequestWithStaff[];
  total: number;
  page: number;
  pageSize: number;
}

// Request types
export interface CreateTimeOffRequest {
  staff_id: string;
  salon_id: string;
  start_date: string;
  end_date: string;
  type: string;
  reason: string;
  notify_customers?: boolean;
  auto_reschedule?: boolean;
}

export interface ReviewTimeOffRequest {
  id: string;
  status: 'approved' | 'rejected';
  review_notes?: string;
  reviewed_by: string;
}
