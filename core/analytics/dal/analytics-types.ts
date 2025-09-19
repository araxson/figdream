import type { Database } from "@/types/database.types";
import type { ProfileWithDetails, StaffProfileWithDetails } from "@/core/profiles/types";

// Local type definitions for analytics tables that don't exist in database.types
export interface MetricsDaily {
  id: string;
  salon_id: string;
  metric_date: string;
  revenue: number;
  appointments_count: number;
  customers_count: number;
  services_count: number;
  created_at: string;
}

export interface MetricsMonthly {
  id: string;
  salon_id: string;
  metric_month: string;
  revenue: number;
  appointments_count: number;
  customers_count: number;
  services_count: number;
  created_at: string;
}

export interface StaffPerformance {
  id: string;
  staff_id: string;
  staff_profile_id?: string;
  period: string;
  appointments_count: number;
  revenue_generated: number;
  average_rating?: number | null;
  utilization_rate?: number | null;
  created_at?: string;
  // Extended fields from queries
  average_appointment_duration?: number | null;
  cancelled_by_customer?: number | null;
  cancelled_by_staff?: number | null;
  completed_appointments?: number | null;
  total_appointments?: number | null;
  total_revenue?: number | null;
  no_shows?: number | null;
  upcoming_appointments?: number | null;
  staff?: StaffProfileWithDetails;
}

export interface CustomerAnalytics {
  id?: string;
  customer_id: string | null;
  total_appointments?: number;
  total_spent?: number;
  last_visit?: string | null;
  first_visit?: string | null;
  total_visits?: number;
  retention_score?: number;
  created_at?: string;
}

// Services table exists in public schema
export type ServiceAnalytics = Database["public"]["Tables"]["services"]["Row"];

export interface DashboardMetrics {
  revenue: {
    total: number;
    daily: number;
    monthly: number;
    growth: number;
  };
  appointments: {
    total: number;
    completed: number;
    cancelled: number;
    noShow: number;
  };
  customers: {
    total: number;
    new: number;
    returning: number;
    retentionRate: number;
  };
  services: {
    total: number;
    popular: ServiceAnalytics[];
    revenue: number;
  };
  staff: {
    total: number;
    utilization: number;
    topPerformers: StaffPerformance[];
  };
}

export interface AnalyticsFilters {
  salonId?: string;
  startDate?: string;
  endDate?: string;
  period?: "day" | "week" | "month" | "quarter" | "year";
  staffId?: string;
  serviceId?: string;
  customerId?: string;
}

export interface PerformanceMetrics {
  kpis: {
    revenue: number;
    appointments: number;
    customerSatisfaction: number;
    efficiency: number;
  };
  trends: {
    revenue: Array<{ date: string; value: number }>;
    appointments: Array<{ date: string; value: number }>;
    newCustomers: Array<{ date: string; value: number }>;
  };
  comparisons: {
    previousPeriod: {
      revenue: number;
      appointments: number;
      customers: number;
    };
    yearOverYear: {
      revenue: number;
      appointments: number;
      customers: number;
    };
  };
}

export interface StaffMetrics {
  id: string;
  name: string;
  revenue: number;
  appointments: number;
  rating: number;
  utilization: number;
  rebookingRate: number;
  cancellationRate: number;
  topServices: Array<{
    serviceId: string;
    serviceName: string;
    count: number;
    revenue: number;
  }>;
}

export interface CustomerInsights {
  segments: Array<{
    name: string;
    count: number;
    value: number;
    growth: number;
  }>;
  lifetime: {
    averageValue: number;
    averageVisits: number;
    churnRate: number;
  };
  behavior: {
    preferredServices: string[];
    preferredStaff: string[];
    preferredTimes: string[];
    bookingPatterns: Record<string, number>;
  };
}

export interface RevenueAnalytics {
  gross: number;
  net: number;
  byService: Array<{ service: string; amount: number }>;
  byStaff: Array<{ staff: string; amount: number }>;
  byPaymentMethod: Array<{ method: string; amount: number }>;
  projections: {
    daily: number;
    weekly: number;
    monthly: number;
    quarterly: number;
  };
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }>;
}

export interface HeatmapData {
  data: Array<{
    day: number;
    hour: number;
    value: number;
  }>;
  max: number;
  min: number;
}
