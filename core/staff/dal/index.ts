import { createClient } from '@/lib/supabase/server';
import type {
  StaffProfile,
  StaffProfileWithDetails,
  CreateStaffProfileDTO,
  UpdateStaffProfileDTO,
  StaffFilters,
  StaffSchedule,
  TimeOffRequest,
  StaffService,
  StaffPerformance
} from '../types';

// Staff Profile Operations
export async function getStaffProfiles(filters?: StaffFilters) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  let query = supabase
    .from('staff_profiles')
    .select(`
      *,
      user:user_id (
        id,
        email,
        raw_user_meta_data->full_name,
        raw_user_meta_data->phone,
        raw_user_meta_data->avatar_url
      )
    `)
    .eq('is_active', true);

  if (filters?.salon_id) {
    query = query.eq('salon_id', filters.salon_id);
  }

  if (filters?.status && filters.status.length > 0) {
    query = query.in('status', filters.status);
  }

  if (filters?.employment_type && filters.employment_type.length > 0) {
    query = query.in('employment_type', filters.employment_type);
  }

  if (filters?.is_bookable !== undefined) {
    query = query.eq('is_bookable', filters.is_bookable);
  }

  if (filters?.is_featured !== undefined) {
    query = query.eq('is_featured', filters.is_featured);
  }

  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,bio.ilike.%${filters.search}%`);
  }

  if (filters?.min_rating) {
    query = query.gte('rating_average', filters.min_rating);
  }

  const { data, error } = await query
    .order('is_featured', { ascending: false })
    .order('rating_average', { ascending: false });

  if (error) throw error;
  return data as StaffProfileWithDetails[];
}

export async function getStaffProfileById(id: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data, error } = await supabase
    .from('staff_profiles')
    .select(`
      *,
      user:user_id (
        id,
        email,
        raw_user_meta_data->full_name,
        raw_user_meta_data->phone,
        raw_user_meta_data->avatar_url
      ),
      services:staff_services (
        *,
        service:service_id (*)
      ),
      schedules:staff_schedules (*),
      performance:staff_performance (*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as StaffProfileWithDetails;
}

export async function createStaffProfile(data: CreateStaffProfileDTO) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: profile, error } = await supabase
    .from('staff_profiles')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return profile;
}

export async function updateStaffProfile(id: string, updates: UpdateStaffProfileDTO) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data, error } = await supabase
    .from('staff_profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteStaffProfile(id: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { error } = await supabase
    .from('staff_profiles')
    .update({
      is_active: false,
      terminated_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  if (error) throw error;
  return { success: true };
}

// Schedule Operations
export async function getStaffSchedules(staffId: string, effectiveDate?: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  let query = supabase
    .from('staff_schedules')
    .select('*')
    .eq('staff_id', staffId)
    .eq('is_active', true);

  if (effectiveDate) {
    query = query
      .lte('effective_from', effectiveDate)
      .or(`effective_until.is.null,effective_until.gte.${effectiveDate}`);
  }

  const { data, error } = await query
    .order('day_of_week')
    .order('start_time');

  if (error) throw error;
  return data as StaffSchedule[];
}

export async function createStaffSchedule(schedule: Partial<StaffSchedule>) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data, error } = await supabase
    .from('staff_schedules')
    .insert(schedule)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateStaffSchedule(id: string, updates: Partial<StaffSchedule>) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data, error } = await supabase
    .from('staff_schedules')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteStaffSchedule(id: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { error } = await supabase
    .from('staff_schedules')
    .update({
      is_active: false,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  if (error) throw error;
  return { success: true };
}

// Time Off Operations
export async function getTimeOffRequests(filters?: { staff_id?: string; salon_id?: string; status?: string }) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  let query = supabase
    .from('time_off_requests')
    .select(`
      *,
      staff:staff_id (
        id,
        user_id,
        title
      ),
      reviewer:reviewed_by (
        id,
        email
      )
    `);

  if (filters?.staff_id) {
    query = query.eq('staff_id', filters.staff_id);
  }

  if (filters?.salon_id) {
    query = query.eq('salon_id', filters.salon_id);
  }

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query
    .order('start_date', { ascending: false });

  if (error) throw error;
  return data as TimeOffRequest[];
}

export async function createTimeOffRequest(request: Partial<TimeOffRequest>) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data, error } = await supabase
    .from('time_off_requests')
    .insert(request)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function approveTimeOffRequest(id: string, reviewNotes?: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data, error } = await supabase
    .from('time_off_requests')
    .update({
      status: 'approved',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      review_notes: reviewNotes,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function denyTimeOffRequest(id: string, denialReason: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data, error } = await supabase
    .from('time_off_requests')
    .update({
      status: 'denied',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      review_notes: denialReason,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Performance Operations
export async function getStaffPerformance(staffId: string, periodStart?: string, periodEnd?: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  let query = supabase
    .from('staff_performance')
    .select('*')
    .eq('staff_id', staffId);

  if (periodStart) {
    query = query.gte('period_end', periodStart);
  }

  if (periodEnd) {
    query = query.lte('period_start', periodEnd);
  }

  const { data, error } = await query
    .order('period_start', { ascending: false });

  if (error) throw error;
  return data as StaffPerformance[];
}

export async function updateStaffPerformance(id: string, metrics: Partial<StaffPerformance>) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data, error } = await supabase
    .from('staff_performance')
    .update({
      ...metrics,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Staff Services Operations
export async function getStaffServices(staffId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data, error } = await supabase
    .from('staff_services')
    .select(`
      *,
      service:service_id (
        id,
        name,
        description,
        price,
        duration,
        category_id
      )
    `)
    .eq('staff_id', staffId)
    .eq('is_available', true)
    .order('proficiency_level', { ascending: false });

  if (error) throw error;
  return data as StaffService[];
}

export async function assignServiceToStaff(staffId: string, serviceId: string, proficiencyLevel?: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data, error } = await supabase
    .from('staff_services')
    .insert({
      staff_id: staffId,
      service_id: serviceId,
      proficiency_level: proficiencyLevel || 'intermediate',
      is_available: true
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateStaffService(id: string, updates: Partial<StaffService>) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data, error } = await supabase
    .from('staff_services')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function removeServiceFromStaff(id: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { error } = await supabase
    .from('staff_services')
    .update({
      is_available: false,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  if (error) throw error;
  return { success: true };
}

// Availability Check
export async function checkStaffAvailability(staffId: string, date: string, startTime: string, endTime: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // Check schedules
  const dayOfWeek = new Date(date).toLocaleLowerCase() as any;
  const { data: schedule } = await supabase
    .from('staff_schedules')
    .select('*')
    .eq('staff_id', staffId)
    .eq('day_of_week', dayOfWeek)
    .eq('is_active', true)
    .lte('effective_from', date)
    .or(`effective_until.is.null,effective_until.gte.${date}`)
    .single();

  if (!schedule) return { available: false, reason: 'No schedule for this day' };

  // Check if requested time is within working hours
  if (startTime < schedule.start_time || endTime > schedule.end_time) {
    return { available: false, reason: 'Outside working hours' };
  }

  // Check for time off
  const { data: timeOff } = await supabase
    .from('time_off_requests')
    .select('*')
    .eq('staff_id', staffId)
    .eq('status', 'approved')
    .lte('start_date', date)
    .gte('end_date', date);

  if (timeOff && timeOff.length > 0) {
    return { available: false, reason: 'Staff on time off' };
  }

  // Check for existing appointments
  const { data: appointments } = await supabase
    .from('appointments')
    .select('*')
    .eq('staff_id', staffId)
    .eq('date', date)
    .or(`start_time.lt.${endTime},end_time.gt.${startTime}`);

  if (appointments && appointments.length > 0) {
    return { available: false, reason: 'Time slot already booked' };
  }

  return { available: true };
}