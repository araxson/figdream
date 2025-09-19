import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

export type SupabaseClientTyped = SupabaseClient<Database>;

// Type helpers for database results
export interface AppointmentData {
  status?: string | null;
}

export interface TrendData {
  metric_date?: string | null;
  total_appointments?: number | null;
  new_customers?: number | null;
  returning_customers?: number | null;
}

export interface AppointmentDetail {
  total_amount?: number | null;
  service_cost?: number | null;
  tips?: number | null;
  taxes?: number | null;
  discount?: number | null;
  created_at?: string | null;
  date?: string | null;
  total_price?: number | null;
  service_name?: string | null;
  booking_count?: number | null;
  payment_method?: string | null;
  start_time?: string | null;
}

/**
 * Verify authentication for analytics queries
 */
export async function verifyAnalyticsAuth() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError) {
    console.error('[Analytics] Authentication error:', authError);
    throw new Error(`Unable to retrieve analytics: ${authError.message}`);
  }

  if (!user) {
    console.error('[Analytics] No authenticated user found');
    throw new Error("Authentication required to view analytics. Please sign in.");
  }

  return { supabase, user };
}

/**
 * Calculate the number of days between two dates
 */
export function calculateDaysBetween(startDate?: string, endDate?: string): number {
  if (!startDate || !endDate) return 30; // default

  const start = new Date(startDate);
  const end = new Date(endDate);

  return Math.max(
    1,
    Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  );
}

/**
 * Get date range for previous period comparison
 */
export function getPreviousPeriodRange(startDate?: string, endDate?: string) {
  if (!startDate || !endDate) return { prevStart: null, prevEnd: null };

  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = end.getTime() - start.getTime();

  const prevStart = new Date(start.getTime() - diff);
  const prevEnd = new Date(end.getTime() - diff);

  return {
    prevStart: prevStart.toISOString(),
    prevEnd: prevEnd.toISOString()
  };
}