import type { Database } from "@/types/database.types";

export interface rolesData {
  id: string;
  name?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface RolesFilter {
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface rolesResponse {
  data: rolesData[];
  total: number;
  page: number;
  pageSize: number;
}
