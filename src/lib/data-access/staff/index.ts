import { createClient } from '@/lib/database/supabase/server';
import {
  StaffProfile,
  StaffProfileInsert,
  StaffProfileUpdate,
  StaffSchedule,
  StaffService,
  Profile,
  Service
} from '@/types/db-types';

// Extended types for staff with related data
export interface StaffWithProfile extends StaffProfile {
  profiles?: Profile | null
}

export interface StaffWithServices extends StaffProfile {
  staff_services?: (StaffService & {
    services: Service
  })[]
}

export interface StaffWithFullDetails extends StaffProfile {
  profiles?: Profile | null
  staff_services?: (StaffService & {
    services: Service
  })[]
  staff_schedules?: StaffSchedule[]
  staff_specialties?: Record<string, unknown>[] // Table may not exist in current schema
  staff_utilization?: Record<string, unknown>[] // Table may not exist in current schema
}
export async function getStaffBySalon(salonId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('staff_profiles')
    .select(`
      *,
      profiles:user_id (
        email,
        full_name,
        first_name,
        last_name,
        avatar_url,
        phone
      ),
      staff_services (
        service_id,
        services (
          id,
          name,
          category,
          duration,
          price
        )
      ),
      staff_specialties (*)
    `)
    .eq('salon_id', salonId)
    .eq('is_active', true)
    .order('display_name');
  if (error) {
    throw error;
  }
  return data;
}
export async function getStaffById(staffId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('staff_profiles')
    .select(`
      *,
      profiles:user_id (
        email,
        full_name,
        first_name,
        last_name,
        avatar_url,
        phone
      ),
      staff_services (
        service_id,
        services (*)
      ),
      staff_specialties (*),
      staff_schedules (*),
      staff_utilization (*)
    `)
    .eq('id', staffId)
    .single();
  if (error) {
    throw error;
  }
  return data;
}
export async function getStaffByUserId(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('staff_profiles')
    .select(`
      *,
      profiles:user_id (
        email,
        full_name,
        first_name,
        last_name,
        avatar_url,
        phone
      ),
      salons:salon_id (
        id,
        name
      )
    `)
    .eq('user_id', userId)
    .single();
  if (error && error.code !== 'PGRST116') { // Not found is ok
    throw error;
  }
  return data;
}
export async function createStaffProfile(profile: StaffProfileInsert) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('staff_profiles')
    .insert(profile)
    .select()
    .single();
  if (error) {
    throw error;
  }
  return data;
}
export async function updateStaffProfile(staffId: string, updates: StaffProfileUpdate) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('staff_profiles')
    .update(updates)
    .eq('id', staffId)
    .select()
    .single();
  if (error) {
    throw error;
  }
  return data;
}
export async function getStaffSchedule(staffId: string, startDate?: string, endDate?: string) {
  const supabase = await createClient();
  let query = supabase
    .from('staff_schedules')
    .select('*')
    .eq('staff_id', staffId)
    .order('date', { ascending: true });
  if (startDate) {
    query = query.gte('date', startDate);
  }
  if (endDate) {
    query = query.lte('date', endDate);
  }
  const { data, error } = await query;
  if (error) {
    throw error;
  }
  return data;
}
export async function updateStaffSchedule(
  staffId: string,
  date: string,
  schedule: Partial<StaffSchedule>
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('staff_schedules')
    .upsert({
      staff_id: staffId,
      date,
      ...schedule,
    })
    .select()
    .single();
  if (error) {
    throw error;
  }
  return data;
}
export async function getStaffServices(staffId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('staff_services')
    .select(`
      *,
      services (*)
    `)
    .eq('staff_id', staffId);
  if (error) {
    throw error;
  }
  return data;
}
export async function updateStaffServices(staffId: string, serviceIds: string[]) {
  const supabase = await createClient();
  // Delete existing services
  const { error: deleteError } = await supabase
    .from('staff_services')
    .delete()
    .eq('staff_id', staffId);
  if (deleteError) {
    throw deleteError;
  }
  // Insert new services
  if (serviceIds.length > 0) {
    const staffServices = serviceIds.map(serviceId => ({
      staff_id: staffId,
      service_id: serviceId,
    }));
    const { data, error: insertError } = await supabase
      .from('staff_services')
      .insert(staffServices)
      .select();
    if (insertError) {
      throw insertError;
    }
    return data;
  }
  return [];
}
export async function getStaffBreaks(staffId: string, date: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('staff_breaks')
    .select('*')
    .eq('staff_id', staffId)
    .eq('date', date)
    .order('start_time');
  if (error) {
    throw error;
  }
  return data;
}
export async function addStaffBreak(breakData: Omit<StaffBreak, 'id' | 'created_at'>) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('staff_breaks')
    .insert(breakData)
    .select()
    .single();
  if (error) {
    throw error;
  }
  return data;
}
export async function getStaffTimeOff(staffId: string, startDate?: string, endDate?: string) {
  const supabase = await createClient();
  let query = supabase
    .from('staff_time_off')
    .select('*')
    .eq('staff_id', staffId)
    .order('start_date', { ascending: false });
  if (startDate) {
    query = query.gte('end_date', startDate);
  }
  if (endDate) {
    query = query.lte('start_date', endDate);
  }
  const { data, error } = await query;
  if (error) {
    throw error;
  }
  return data;
}
export async function requestTimeOff(timeOffData: Omit<StaffTimeOff, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('staff_time_off')
    .insert(timeOffData)
    .select()
    .single();
  if (error) {
    throw error;
  }
  return data;
}
export async function updateTimeOffStatus(
  timeOffId: string,
  status: 'approved' | 'rejected',
  approvedBy?: string
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('staff_time_off')
    .update({
      status,
      approved_by: approvedBy,
    })
    .eq('id', timeOffId)
    .select()
    .single();
  if (error) {
    throw error;
  }
  return data;
}
export async function getStaffEarnings(staffId: string, startDate?: string, endDate?: string) {
  const supabase = await createClient();
  let query = supabase
    .from('staff_earnings')
    .select('*')
    .eq('staff_id', staffId)
    .order('earning_date', { ascending: false });
  if (startDate) {
    query = query.gte('earning_date', startDate);
  }
  if (endDate) {
    query = query.lte('earning_date', endDate);
  }
  const { data, error } = await query;
  if (error) {
    throw error;
  }
  return data;
}
export async function getStaffUtilization(staffId: string, date?: string) {
  const supabase = await createClient();
  let query = supabase
    .from('staff_utilization')
    .select('*')
    .eq('staff_id', staffId);
  if (date) {
    query = query.eq('date', date);
  } else {
    query = query.order('date', { ascending: false }).limit(30);
  }
  const { data, error } = await query;
  if (error) {
    throw error;
  }
  return data;
}
export async function getStaffAppointments(staffId: string, date?: string) {
  const supabase = await createClient();
  let query = supabase
    .from('appointments')
    .select(`
      *,
      appointment_services (
        *,
        services (*)
      ),
      customers (
        id,
        user_id,
        profiles:user_id (
          full_name,
          email,
          phone
        )
      ),
      salons (
        name
      )
    `)
    .eq('staff_id', staffId);
  if (date) {
    query = query.eq('appointment_date', date);
  } else {
    query = query.gte('appointment_date', new Date().toISOString().split('T')[0]);
  }
  query = query.order('appointment_date').order('start_time');
  const { data, error } = await query;
  if (error) {
    throw error;
  }
  return data;
}
export async function getStaffPerformanceMetrics(staffId: string) {
  const supabase = await createClient();
  // Get daily performance for last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      appointment_date,
      status,
      total_amount,
      appointment_services (
        service_id,
        services (name, duration)
      )
    `)
    .eq('staff_id', staffId)
    .gte('appointment_date', thirtyDaysAgo.toISOString().split('T')[0])
    .order('appointment_date');
  const { data: utilization } = await supabase
    .from('staff_utilization')
    .select('*')
    .eq('staff_id', staffId)
    .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
    .order('date');
  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating, created_at')
    .eq('staff_id', staffId);
  // Process daily metrics
  const dailyMetrics: Record<string, {
    date: string
    appointments_count: number
    total_revenue: number
    utilization_percentage: number
  }> = {};
  appointments?.forEach(apt => {
    if (apt.status === 'completed') {
      const date = apt.appointment_date;
      if (!dailyMetrics[date]) {
        dailyMetrics[date] = {
          date,
          appointments_count: 0,
          total_revenue: 0,
          utilization_percentage: 0
        };
      }
      dailyMetrics[date].appointments_count++;
      dailyMetrics[date].total_revenue += apt.total_amount || 0;
    }
  });
  utilization?.forEach(util => {
    if (dailyMetrics[util.date]) {
      dailyMetrics[util.date].utilization_percentage = util.utilization_percentage || 0;
    }
  });
  // Calculate ratings
  const ratingsData = {
    average: reviews?.length 
      ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length 
      : 0,
    count: reviews?.length || 0,
    distribution: {} as Record<string, number>
  };
  reviews?.forEach(review => {
    const rating = String(review.rating);
    ratingsData.distribution[rating] = (ratingsData.distribution[rating] || 0) + 1;
  });
  return {
    daily: Object.values(dailyMetrics),
    ratings: ratingsData
  };
}
export async function getStaffRevenueBreakdown(staffId: string) {
  const supabase = await createClient();
  const thisMonth = new Date();
  const startOfMonth = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1);
  const { data: earnings } = await supabase
    .from('staff_earnings')
    .select('base_amount, commission_amount, tip_amount')
    .eq('staff_id', staffId)
    .gte('date', startOfMonth.toISOString().split('T')[0]);
  const breakdown = {
    total_base: 0,
    total_commission: 0,
    total_tips: 0
  };
  earnings?.forEach(earning => {
    breakdown.total_base += earning.base_amount || 0;
    breakdown.total_commission += earning.commission_amount || 0;
    breakdown.total_tips += earning.tip_amount || 0;
  });
  return breakdown;
}
export async function getStaffServiceStats(staffId: string) {
  const supabase = await createClient();
  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      total_amount,
      appointment_services (
        service_id,
        services (id, name)
      )
    `)
    .eq('staff_id', staffId)
    .eq('status', 'completed');
  const serviceStats: Record<string, {
    service_id: string
    service_name: string
    appointment_count: number
    total_revenue: number
  }> = {};
  appointments?.forEach(apt => {
    apt.appointment_services?.forEach(as => {
      const serviceId = as.service_id;
      const serviceName = as.services?.name || 'Unknown';
      if (!serviceStats[serviceId]) {
        serviceStats[serviceId] = {
          service_id: serviceId,
          service_name: serviceName,
          appointment_count: 0,
          total_revenue: 0
        };
      }
      serviceStats[serviceId].appointment_count++;
      serviceStats[serviceId].total_revenue += (apt.total_amount || 0) / (apt.appointment_services?.length || 1);
    });
  });
  return Object.values(serviceStats).sort((a, b) => b.appointment_count - a.appointment_count);
}