/**
 * Platform Types - Using database types as source of truth
 * Consolidated types for platform administration
 */

import type { Database } from "@/types/database.types";

// User/Profile types from database Views
export type User = Database["public"]["Views"]["profiles"]["Row"];
export type UserInsert = Database["public"]["Views"]["profiles"]["Insert"];
export type UserUpdate = Database["public"]["Views"]["profiles"]["Update"];

// Salon types from database Views
export type PlatformSalon = Database["public"]["Views"]["salons"]["Row"];
export type PlatformSalonInsert = Database["public"]["Views"]["salons"]["Insert"];
export type PlatformSalonUpdate = Database["public"]["Views"]["salons"]["Update"];

// User role types from database Views
export type UserRole = Database["public"]["Views"]["user_roles"]["Row"];
export type UserRoleInsert = Database["public"]["Views"]["user_roles"]["Insert"];
export type UserRoleUpdate = Database["public"]["Views"]["user_roles"]["Update"];

// Role enum from database
export type RoleType = Database["public"]["Enums"]["role_type"];

// Platform-specific extended types
export interface UserWithRelations extends User {
  salons?: PlatformSalon[];
  user_roles?: UserRole[];
}

export interface PlatformStats {
  total_users: number;
  total_salons: number;
  total_appointments: number;
  total_revenue: number;
  active_users_today: number;
  new_signups_today: number;
  system_health: SystemHealth;
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  database_connections: number;
  api_latency_ms: number;
  error_rate: number;
  uptime_percentage: number;
}

// Analytics types from database
export type DailyMetrics = Database["public"]["Views"]["daily_metrics"]["Row"];
export type MonthlyMetrics = Database["public"]["Views"]["monthly_metrics"]["Row"];
export type CustomerAnalytics = Database["public"]["Views"]["customer_analytics"]["Row"];
export type StaffPerformance = Database["public"]["Views"]["staff_performance"]["Row"];

export interface PlatformAnalytics {
  revenue: RevenueAnalytics;
  users: UserAnalytics;
  salons: SalonAnalytics;
  appointments: AppointmentAnalytics;
}

export interface RevenueAnalytics {
  total: number;
  monthly: number;
  daily: number;
  growth_percentage: number;
  by_salon: Array<{
    salon_id: string;
    salon_name: string;
    revenue: number;
  }>;
}

export interface UserAnalytics {
  total: number;
  active: number;
  new_this_month: number;
  by_role: Record<RoleType, number>;
  retention_rate: number;
}

export interface SalonAnalytics {
  total: number;
  active: number;
  verified: number;
  by_subscription: Record<string, number>;
  average_rating: number;
}

export interface AppointmentAnalytics {
  total: number;
  completed: number;
  cancelled: number;
  no_shows: number;
  average_value: number;
}