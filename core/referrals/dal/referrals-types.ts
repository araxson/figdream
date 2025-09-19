import type { Database } from "@/types/database.types";

export interface referralsData {
  id: string;
  name?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ReferralsFilter {
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface referralsResponse {
  data: referralsData[];
  total: number;
  page: number;
  pageSize: number;
}
