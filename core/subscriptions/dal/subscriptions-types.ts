import type { Database } from "@/types/database.types";

export interface subscriptionsData {
  id: string;
  name?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SubscriptionsFilter {
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface subscriptionsResponse {
  data: subscriptionsData[];
  total: number;
  page: number;
  pageSize: number;
}
