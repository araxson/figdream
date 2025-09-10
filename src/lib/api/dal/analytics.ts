import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { requireRole } from './auth';

export type MetricsDTO = {
  total_appointments: number;
  total_revenue: number;
  total_customers: number;
  average_rating: number;
  new_customers: number;
  returning_customers: number;
  cancellation_rate: number;
  no_show_rate: number;
};

export type PerformanceDTO = {
  salon_id: string;
  period: string;
  revenue: number;
  appointments_count: number;
  new_customers: number;
  returning_customers: number;
  average_service_price: number;
  popular_services: string[];
  peak_hours: number[];
};

/**
 * Get dashboard metrics for salon
 */
export const getSalonMetrics = cache(async (salonId: string): Promise<MetricsDTO | null> => {
  await requireRole(['salon_owner', 'super_admin']);
  
  const supabase = await createClient();
  
  // Get aggregated metrics from dashboard_metrics table
  const { data, error } = await supabase
    .from('dashboard_metrics')
    .select(`
      appointments_booked,
      appointments_completed,
      appointments_cancelled,
      appointments_no_show,
      revenue_total,
      new_customers,
      returning_customers,
      total_customers
    `)
    .eq('salon_id', salonId)
    .order('metric_date', { ascending: false })
    .limit(30); // Get recent data for calculation
  
  if (error || !data || data.length === 0) {
    return {
      total_appointments: 0,
      total_revenue: 0,
      total_customers: 0,
      average_rating: 0,
      new_customers: 0,
      returning_customers: 0,
      cancellation_rate: 0,
      no_show_rate: 0,
    };
  }

  // Aggregate the metrics
  const totals = data.reduce((acc, row) => ({
    appointments_booked: (acc.appointments_booked || 0) + (row.appointments_booked || 0),
    appointments_completed: (acc.appointments_completed || 0) + (row.appointments_completed || 0),
    appointments_cancelled: (acc.appointments_cancelled || 0) + (row.appointments_cancelled || 0),
    appointments_no_show: (acc.appointments_no_show || 0) + (row.appointments_no_show || 0),
    revenue_total: (acc.revenue_total || 0) + (row.revenue_total || 0),
    new_customers: (acc.new_customers || 0) + (row.new_customers || 0),
    returning_customers: (acc.returning_customers || 0) + (row.returning_customers || 0),
    total_customers: Math.max(acc.total_customers || 0, row.total_customers || 0),
  }), {
    appointments_booked: 0,
    appointments_completed: 0,
    appointments_cancelled: 0,
    appointments_no_show: 0,
    revenue_total: 0,
    new_customers: 0,
    returning_customers: 0,
    total_customers: 0,
  });

  const totalAppointments = totals.appointments_booked || 0;
  const cancellationRate = totalAppointments > 0 ? ((totals.appointments_cancelled || 0) / totalAppointments) * 100 : 0;
  const noShowRate = totalAppointments > 0 ? ((totals.appointments_no_show || 0) / totalAppointments) * 100 : 0;

  return {
    total_appointments: totalAppointments,
    total_revenue: totals.revenue_total || 0,
    total_customers: totals.total_customers || 0,
    average_rating: 4.5, // TODO: Calculate from reviews table
    new_customers: totals.new_customers || 0,
    returning_customers: totals.returning_customers || 0,
    cancellation_rate: cancellationRate,
    no_show_rate: noShowRate,
  };
});

/**
 * Get salon performance analytics
 */
export const getSalonPerformance = cache(async (salonId: string, startDate: string, endDate: string): Promise<PerformanceDTO[]> => {
  await requireRole(['salon_owner', 'super_admin']);
  
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('salon_performance_analytics')
    .select('*')
    .eq('salon_id', salonId)
    .gte('period_start', startDate)
    .lte('period_end', endDate)
    .order('period_start', { ascending: true });
  
  if (error || !data) return [];
  
  return data.map(perf => ({
    salon_id: perf.salon_id,
    period: perf.period_start || '',
    revenue: perf.total_revenue || 0,
    appointments_count: perf.total_appointments || 0,
    new_customers: 0, // Not available in this view
    returning_customers: 0, // Not available in this view
    average_service_price: perf.avg_appointment_value || 0,
    popular_services: [], // Not available in this view
    peak_hours: [], // Not available in this view
  }));
});

/**
 * Get customer engagement analytics
 */
export const getCustomerEngagement = cache(async (salonId: string): Promise<{
  total_customers: number;
  active_customers: number;
  retention_rate: number;
  average_visits: number;
  top_spenders: string[];
} | null> => {
  await requireRole(['salon_owner', 'super_admin']);
  
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('customer_engagement_analytics')
    .select('*')
    .eq('salon_id', salonId)
    .order('last_updated_at', { ascending: false })
    .limit(10); // Get recent customer data
  
  if (error || !data) return null;

  const totalCustomers = data.length;
  const activeCustomers = data.filter(c => c.last_visit_date && 
    new Date(c.last_visit_date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  ).length;
  
  const averageVisits = totalCustomers > 0 ? 
    data.reduce((sum, c) => sum + (c.total_visits || 0), 0) / totalCustomers : 0;
  
  const retentionRate = totalCustomers > 0 ? (activeCustomers / totalCustomers) * 100 : 0;
  
  const topSpenders = data
    .sort((a, b) => (b.total_spent || 0) - (a.total_spent || 0))
    .slice(0, 5)
    .map(c => c.customer_name || 'Unknown Customer');

  return {
    total_customers: totalCustomers,
    active_customers: activeCustomers,
    retention_rate: retentionRate,
    average_visits: averageVisits,
    top_spenders: topSpenders,
  };
});

/**
 * Get staff utilization analytics
 */
export const getStaffUtilization = cache(async (salonId: string): Promise<{
  staff_id: string;
  utilization_rate: number;
  total_appointments: number;
  total_hours: number;
  revenue_generated: number;
}[]> => {
  await requireRole(['salon_owner', 'super_admin']);
  
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('staff_utilization_analytics')
    .select('*')
    .eq('salon_id', salonId)
    .order('last_updated', { ascending: false })
    .limit(20); // Get recent staff data
  
  if (error || !data) return [];
  
  return data
    .filter(util => util.staff_id !== null)
    .map(util => ({
      staff_id: util.staff_id!,
      utilization_rate: util.utilization_rate || 0,
      total_appointments: util.total_appointments || 0,
      total_hours: util.total_hours_worked || 0,
      revenue_generated: util.revenue_generated || 0,
    }));
});

/**
 * Get platform-wide metrics (admin only)
 */
export const getPlatformMetrics = cache(async (): Promise<{
  total_salons: number;
  total_users: number;
  total_appointments: number;
  total_revenue: number;
  active_salons: number;
  new_signups: number;
} | null> => {
  await requireRole(['super_admin']);
  
  const supabase = await createClient();
  
  // Get aggregated platform metrics
  const { data, error } = await supabase
    .from('salon_performance_analytics')
    .select(`
      salon_id,
      total_appointments,
      total_revenue,
      customer_count
    `)
    .order('last_updated_at', { ascending: false });
  
  if (error || !data) return null;
  
  // Calculate platform totals
  const uniqueSalons = new Set(data.map(d => d.salon_id));
  const totalAppointments = data.reduce((sum, d) => sum + (d.total_appointments || 0), 0);
  const totalRevenue = data.reduce((sum, d) => sum + (d.total_revenue || 0), 0);
  const totalCustomers = data.reduce((sum, d) => sum + (d.customer_count || 0), 0);

  return {
    total_salons: uniqueSalons.size,
    total_users: totalCustomers, // Approximation
    total_appointments: totalAppointments,
    total_revenue: totalRevenue,
    active_salons: uniqueSalons.size, // Approximation
    new_signups: 0, // Not available in current data
  };
});