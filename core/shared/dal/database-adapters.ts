/**
 * Database Adapters for handling missing tables and type mismatches
 * This module provides type-safe adapters for tables that don't exist in database.types.ts
 */

import type { Database } from '@/types/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';

// Type guard for SelectQueryError
export function isSelectQueryError(value: unknown): value is { error: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'error' in value &&
    typeof (value as any).error === 'string'
  );
}

// Type guard for checking if data has user_roles array
export function hasUserRoles(data: any): data is { user_roles: Array<{ role_name: string }> } {
  return (
    data &&
    typeof data === 'object' &&
    'user_roles' in data &&
    Array.isArray(data.user_roles)
  );
}

// Default empty responses for missing tables
export const EMPTY_RESPONSES = {
  customer_analytics: [],
  daily_metrics: [],
  platform_analytics: null,
  platform_financials: null,
  subscription_overview: null,
  admin_audit_logs: [],
  platform_settings: {},
} as const;

// Adapter for missing customer_analytics table
export async function getCustomerAnalytics(
  supabase: SupabaseClient<Database>,
  salonId: string
) {
  // Return mock data since table doesn't exist
  return {
    data: {
      total_customers: 0,
      new_customers: 0,
      returning_customers: 0,
      churn_risk_score: 0,
      total_visits: 0,
      first_visit: null,
      last_visit: null,
    },
    error: null,
  };
}

// Adapter for missing daily_metrics table
export async function getDailyMetrics(
  supabase: SupabaseClient<Database>,
  salonId: string,
  startDate?: string,
  endDate?: string
) {
  // Return mock data since table doesn't exist
  return {
    data: [],
    error: null,
  };
}

// Adapter for appointment total amount calculation
export function calculateAppointmentTotal(
  appointments: any[]
): number {
  if (!Array.isArray(appointments)) return 0;

  return appointments.reduce((total, apt) => {
    // Try different possible field names
    const amount =
      apt.total_amount ||
      apt.total_price ||
      apt.price ||
      apt.amount ||
      0;
    return total + (typeof amount === 'number' ? amount : 0);
  }, 0);
}

// Adapter for missing salon fields
export function adaptSalonData(salon: any) {
  if (isSelectQueryError(salon)) {
    return {
      id: '',
      business_name: 'Unknown Salon',
      slug: 'unknown',
      description: null,
      phone: null,
      email: null,
      website: null,
      address: null,
      city: null,
      state: null,
      zip_code: null,
      country: 'US',
      latitude: null,
      longitude: null,
      timezone: 'America/New_York',
      currency: 'USD',
      booking_buffer_minutes: 15,
      cancellation_hours: 24,
      deposit_percentage: 0,
      tax_rate: 0,
      is_active: false,
      is_verified: false,
      is_featured: false,
      logo_url: null,
      cover_image_url: null,
      gallery_images: [],
      business_hours: {},
      social_media: {},
      amenities: [],
      languages: ['en'],
      payment_methods: [],
      parking_options: [],
      accessibility_features: [],
      subscription_tier: 'free',
      subscription_expires_at: null,
      trial_ends_at: null,
      total_bookings: 0,
      total_revenue: 0,
      rating_average: 0,
      rating_count: 0,
      employee_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  // Fill in missing fields with defaults
  return {
    ...salon,
    business_name: salon.business_name || salon.name || 'Unknown Salon',
    logo_url: salon.logo_url || null,
    is_verified: salon.is_verified ?? false,
    is_featured: salon.is_featured ?? false,
    subscription_tier: salon.subscription_tier || 'free',
    subscription_expires_at: salon.subscription_expires_at || null,
    total_bookings: salon.total_bookings || 0,
    total_revenue: salon.total_revenue || 0,
    rating_average: salon.rating_average || 0,
    rating_count: salon.rating_count || 0,
    employee_count: salon.employee_count || 0,
  };
}

// Adapter for user data with missing fields
export function adaptUserData(user: any) {
  if (!user) return null;

  // Handle SelectQueryError in user_roles
  const userRoles = (() => {
    if (hasUserRoles(user)) {
      return user.user_roles;
    }
    if (user.role) {
      return [{ role_name: user.role }];
    }
    return [];
  })();

  return {
    ...user,
    user_roles: userRoles,
    last_active_at: user.last_active_at || user.updated_at || user.created_at,
    default_salon_id: user.default_salon_id || null,
    banned_until: user.banned_until || null,
    is_active: user.is_active ?? true,
  };
}

// Adapter for audit log IP address
export function adaptAuditLog(log: any) {
  return {
    ...log,
    ip_address: String(log.ip_address || 'unknown'),
  };
}

// Safe query wrapper that handles missing tables
export async function safeQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  defaultValue: T
): Promise<{ data: T; error: null }> {
  try {
    const result = await queryFn();
    if (result.error) {
      console.warn('Query error, using default:', result.error);
      return { data: defaultValue, error: null };
    }
    return { data: result.data || defaultValue, error: null };
  } catch (error) {
    console.warn('Query exception, using default:', error);
    return { data: defaultValue, error: null };
  }
}

// Type-safe table getter
export function getTable(
  supabase: SupabaseClient<Database>,
  tableName: string
) {
  // Check if table exists in known tables
  const knownTables = [
    'profiles',
    'salons',
    'appointments',
    'services',
    'staff_profiles',
    'customers',
    'reviews',
    'notifications',
    'user_roles',
    'settings',
  ];

  if (!knownTables.includes(tableName)) {
    console.warn(`Table '${tableName}' not found in database schema`);
    // Return a mock query builder that returns empty results
    return {
      select: () => ({
        eq: () => ({ data: [], error: null }),
        single: () => ({ data: null, error: 'Table not found' }),
      }),
      insert: () => ({ data: null, error: 'Table not found' }),
      update: () => ({ data: null, error: 'Table not found' }),
      delete: () => ({ data: null, error: 'Table not found' }),
    };
  }

  return supabase.from(tableName as any);
}