import type { Database } from "@/types/database.types";

export interface salonchainsData {
  id: string;
  name?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SalonChainsFilter {
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface salonchainsResponse {
  data: salonchainsData[];
  total: number;
  page: number;
  pageSize: number;
}
