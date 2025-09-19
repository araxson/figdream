import type { Database } from "@/types/database.types";

export interface packagesData {
  id: string;
  name?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PackagesFilter {
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface packagesResponse {
  data: packagesData[];
  total: number;
  page: number;
  pageSize: number;
}
