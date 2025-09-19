import type { Database } from "@/types/database.types";

export interface timeoffData {
  id: string;
  name?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TimeOffFilter {
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface timeoffResponse {
  data: timeoffData[];
  total: number;
  page: number;
  pageSize: number;
}
