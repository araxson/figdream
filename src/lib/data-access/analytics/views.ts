'use server';
import { createClient } from '@/lib/database/supabase/server';
import type { Database } from '@/types/database.types';
// Type definitions for database views
type DashboardRealtime = Database['public']['Views']['dashboard_realtime']['Row'];
type CustomerLifetimeValue = Database['public']['Views']['customer_lifetime_value']['Row'];
type StaffPerformanceDashboard = Database['public']['Views']['staff_performance_dashboard']['Row'];
type ServiceProfitability = Database['public']['Views']['service_profitability']['Row'];
/**
 * Get real-time dashboard data
 * This view provides live metrics for salon dashboards
 */
export async function getDashboardRealtimeData(
  salonId: string,
  locationId?: string
): Promise<DashboardRealtime[]> {
  const supabase = await createClient();
  let query = supabase
    .from('dashboard_realtime')
    .select('*')
    .eq('salon_id', salonId);
  if (locationId) {
    query = query.eq('location_id', locationId);
  }
  const { data, error } = await query;
  if (error) {
    return [];
  }
  return data || [];
}
/**
 * Get customer lifetime value data
 * Provides CLV metrics for customer analytics
 */
export async function getCustomerLifetimeValue(
  salonId?: string,
  customerId?: string,
  limit?: number
): Promise<CustomerLifetimeValue[]> {
  const supabase = await createClient();
  let query = supabase
    .from('customer_lifetime_value')
    .select('*')
    .order('lifetime_value', { ascending: false });
  if (salonId) {
    query = query.eq('salon_id', salonId);
  }
  if (customerId) {
    query = query.eq('customer_id', customerId);
  }
  if (limit) {
    query = query.limit(limit);
  }
  const { data, error } = await query;
  if (error) {
    return [];
  }
  return data || [];
}
/**
 * Get top customers by lifetime value
 */
export async function getTopCustomersByValue(
  salonId: string,
  limit: number = 10
): Promise<CustomerLifetimeValue[]> {
  return getCustomerLifetimeValue(salonId, undefined, limit);
}
/**
 * Get specific customer's lifetime value
 */
export async function getCustomerValueById(
  customerId: string
): Promise<CustomerLifetimeValue | null> {
  const values = await getCustomerLifetimeValue(undefined, customerId, 1);
  return values[0] || null;
}
/**
 * Get staff performance dashboard data
 * Comprehensive performance metrics for staff members
 */
export async function getStaffPerformanceDashboard(
  salonId?: string,
  staffId?: string,
  startDate?: Date,
  endDate?: Date
): Promise<StaffPerformanceDashboard[]> {
  const supabase = await createClient();
  let query = supabase
    .from('staff_performance_dashboard')
    .select('*')
    .order('revenue_generated', { ascending: false });
  if (salonId) {
    query = query.eq('salon_id', salonId);
  }
  if (staffId) {
    query = query.eq('staff_id', staffId);
  }
  if (startDate) {
    query = query.gte('period_start', startDate.toISOString());
  }
  if (endDate) {
    query = query.lte('period_end', endDate.toISOString());
  }
  const { data, error } = await query;
  if (error) {
    return [];
  }
  return data || [];
}
/**
 * Get top performing staff members
 */
export async function getTopPerformingStaff(
  salonId: string,
  metric: 'revenue' | 'appointments' | 'rating' | 'utilization' = 'revenue',
  limit: number = 10
): Promise<StaffPerformanceDashboard[]> {
  const supabase = await createClient();
  let orderColumn: string;
  switch (metric) {
    case 'appointments':
      orderColumn = 'total_appointments';
      break;
    case 'rating':
      orderColumn = 'average_rating';
      break;
    case 'utilization':
      orderColumn = 'utilization_rate';
      break;
    default:
      orderColumn = 'revenue_generated';
  }
  const { data, error } = await supabase
    .from('staff_performance_dashboard')
    .select('*')
    .eq('salon_id', salonId)
    .order(orderColumn, { ascending: false })
    .limit(limit);
  if (error) {
    return [];
  }
  return data || [];
}
/**
 * Get service profitability data
 * Analyzes profitability metrics for services
 */
export async function getServiceProfitability(
  salonId?: string,
  serviceId?: string,
  categoryId?: string,
  startDate?: Date,
  endDate?: Date
): Promise<ServiceProfitability[]> {
  const supabase = await createClient();
  let query = supabase
    .from('service_profitability')
    .select('*')
    .order('profit_margin', { ascending: false });
  if (salonId) {
    query = query.eq('salon_id', salonId);
  }
  if (serviceId) {
    query = query.eq('service_id', serviceId);
  }
  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }
  if (startDate) {
    query = query.gte('period_start', startDate.toISOString());
  }
  if (endDate) {
    query = query.lte('period_end', endDate.toISOString());
  }
  const { data, error } = await query;
  if (error) {
    return [];
  }
  return data || [];
}
/**
 * Get most profitable services
 */
export async function getMostProfitableServices(
  salonId: string,
  limit: number = 10
): Promise<ServiceProfitability[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('service_profitability')
    .select('*')
    .eq('salon_id', salonId)
    .order('total_profit', { ascending: false })
    .limit(limit);
  if (error) {
    return [];
  }
  return data || [];
}
/**
 * Get service profitability by category
 */
export async function getServiceProfitabilityByCategory(
  salonId: string,
  categoryId: string
): Promise<ServiceProfitability[]> {
  return getServiceProfitability(salonId, undefined, categoryId);
}
/**
 * Get underperforming services
 */
export async function getUnderperformingServices(
  salonId: string,
  profitThreshold: number = 0,
  limit: number = 10
): Promise<ServiceProfitability[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('service_profitability')
    .select('*')
    .eq('salon_id', salonId)
    .lte('profit_margin', profitThreshold)
    .order('profit_margin', { ascending: true })
    .limit(limit);
  if (error) {
    return [];
  }
  return data || [];
}
/**
 * Aggregate dashboard metrics
 * Combines all view data for comprehensive dashboard
 */
export async function getComprehensiveDashboard(
  salonId: string,
  locationId?: string
): Promise<{
  realtime: DashboardRealtime[];
  topCustomers: CustomerLifetimeValue[];
  staffPerformance: StaffPerformanceDashboard[];
  serviceProfitability: ServiceProfitability[];
}> {
  const [realtime, topCustomers, staffPerformance, serviceProfitability] = await Promise.all([
    getDashboardRealtimeData(salonId, locationId),
    getTopCustomersByValue(salonId, 5),
    getTopPerformingStaff(salonId, 'revenue', 5),
    getMostProfitableServices(salonId, 5)
  ]);
  return {
    realtime,
    topCustomers,
    staffPerformance,
    serviceProfitability
  };
}
/**
 * Get performance trends
 * Analyzes performance trends over time
 */
export async function getPerformanceTrends(
  salonId: string,
  metric: 'revenue' | 'appointments' | 'customers',
  days: number = 30
): Promise<{
  date: string;
  value: number;
}[]> {
  const _supabase = await createClient();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  // This would typically query a time-series view or aggregate data
  // For now, returning empty array as view structure is unknown
  return [];
}
/**
 * Get customer segments
 * Segments customers based on behavior and value
 */
export async function getCustomerSegments(
  salonId: string
): Promise<{
  segment: string;
  count: number;
  averageValue: number;
  description: string;
}[]> {
  const customers = await getCustomerLifetimeValue(salonId);
  // Segment customers based on lifetime value
  const segments = {
    vip: { min: 5000, label: 'VIP', description: 'High-value loyal customers' },
    regular: { min: 1000, label: 'Regular', description: 'Frequent visitors' },
    occasional: { min: 100, label: 'Occasional', description: 'Occasional visitors' },
    new: { min: 0, label: 'New', description: 'New or infrequent customers' }
  };
  const segmentData = Object.entries(segments).map(([key, config]) => {
    const segmentCustomers = customers.filter(c => {
      const value = c.lifetime_value || 0;
      if (key === 'vip') return value >= config.min;
      if (key === 'regular') return value >= config.min && value < segments.vip.min;
      if (key === 'occasional') return value >= config.min && value < segments.regular.min;
      return value < segments.occasional.min;
    });
    const totalValue = segmentCustomers.reduce((sum, c) => sum + (c.lifetime_value || 0), 0);
    return {
      segment: config.label,
      count: segmentCustomers.length,
      averageValue: segmentCustomers.length > 0 ? totalValue / segmentCustomers.length : 0,
      description: config.description
    };
  });
  return segmentData;
}