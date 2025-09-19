import type { Database } from "@/types/database.types";

export interface locationsData {
  id: string;
  name?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface LocationsFilter {
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface locationsResponse {
  data: locationsData[];
  total: number;
  page: number;
  pageSize: number;
}
