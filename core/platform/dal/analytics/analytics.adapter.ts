/**
 * Analytics Adapter - Handles missing analytics tables gracefully
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

export type SupabaseClientTyped = SupabaseClient<Database>;

// Mock data for non-existent analytics tables
export const ANALYTICS_DEFAULTS = {
  customer_analytics: {
    total_customers: 0,
    new_customers: 0,
    returning_customers: 0,
    churn_risk_score: 0,
    total_visits: 0,
    first_visit: null,
    last_visit: null,
    customer_id: null,
    salon_id: null,
  },
  daily_metrics: {
    metric_date: new Date().toISOString(),
    new_customers: 0,
    returning_customers: 0,
    appointments_count: 0,
    revenue: 0,
    salon_id: null,
  },
  platform_analytics: {
    total_users: 0,
    active_users: 0,
    new_signups: 0,
    total_salons: 0,
    active_salons: 0,
    total_appointments: 0,
    platform_revenue: 0,
  },
} as const;

// Safe query wrapper for analytics tables
export async function safeAnalyticsQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  defaultValue: T
): Promise<T> {
  try {
    const result = await queryFn();
    if (result.error) {
      console.warn('Analytics query error, using default:', result.error);
      return defaultValue;
    }
    return result.data || defaultValue;
  } catch (error) {
    console.warn('Analytics query exception, using default:', error);
    return defaultValue;
  }
}

// Mock customer analytics query
export async function queryCustomerAnalytics(
  supabase: SupabaseClientTyped,
  salonId: string
) {
  // Since table doesn't exist, return mock data
  return {
    data: {
      ...ANALYTICS_DEFAULTS.customer_analytics,
      salon_id: salonId,
    },
    error: null,
  };
}

// Mock daily metrics query
export async function queryDailyMetrics(
  supabase: SupabaseClientTyped,
  salonId: string,
  startDate?: string,
  endDate?: string
) {
  // Since table doesn't exist, return mock data
  const mockData = [];
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const current = new Date(start);

    while (current <= end) {
      mockData.push({
        ...ANALYTICS_DEFAULTS.daily_metrics,
        metric_date: current.toISOString(),
        salon_id: salonId,
      });
      current.setDate(current.getDate() + 1);
    }
  }

  return {
    data: mockData,
    error: null,
  };
}

// Safe aggregation for appointments with missing fields
export function aggregateAppointmentRevenue(appointments: any[]): number {
  if (!Array.isArray(appointments)) return 0;

  return appointments.reduce((total, apt) => {
    // Try various field names that might contain the amount
    const amount =
      apt.total_amount ||
      apt.total_price ||
      apt.amount ||
      apt.price ||
      0;

    return total + (typeof amount === 'number' ? amount : 0);
  }, 0);
}

// Type guard for checking if result is an error
export function isQueryError(result: any): result is { error: string } {
  return (
    result &&
    typeof result === 'object' &&
    'error' in result &&
    typeof result.error === 'string'
  );
}

// Transform any analytics data to expected format
export function transformAnalyticsData(data: any, type: keyof typeof ANALYTICS_DEFAULTS) {
  if (isQueryError(data)) {
    return ANALYTICS_DEFAULTS[type];
  }

  // Merge with defaults to ensure all fields exist
  return {
    ...ANALYTICS_DEFAULTS[type],
    ...data,
  };
}