import { createClient } from '@/lib/database/supabase/server';
import { Database } from '@/types/database.types';

type StaffProfile = Database['public']['Tables']['staff_profiles']['Row'];
type StaffProfileInsert = Database['public']['Tables']['staff_profiles']['Insert'];
type StaffProfileUpdate = Database['public']['Tables']['staff_profiles']['Update'];
type StaffSchedule = Database['public']['Tables']['staff_schedules']['Row'];
type StaffService = Database['public']['Tables']['staff_services']['Row'];
type StaffBreak = Database['public']['Tables']['staff_breaks']['Row'];
type StaffTimeOff = Database['public']['Tables']['staff_time_off']['Row'];
type StaffEarnings = Database['public']['Tables']['staff_earnings']['Row'];
type StaffUtilization = Database['public']['Tables']['staff_utilization']['Row'];

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
    console.error('Error fetching staff:', error);
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
    console.error('Error fetching staff member:', error);
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
      salons (
        id,
        name,
        address
      )
    `)
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') { // Not found is ok
    console.error('Error fetching staff by user ID:', error);
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
    console.error('Error creating staff profile:', error);
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
    console.error('Error updating staff profile:', error);
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
    console.error('Error fetching staff schedule:', error);
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
    console.error('Error updating staff schedule:', error);
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
    console.error('Error fetching staff services:', error);
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
    console.error('Error deleting staff services:', deleteError);
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
      console.error('Error inserting staff services:', insertError);
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
    console.error('Error fetching staff breaks:', error);
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
    console.error('Error adding staff break:', error);
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
    console.error('Error fetching staff time off:', error);
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
    console.error('Error requesting time off:', error);
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
    console.error('Error updating time off status:', error);
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
    console.error('Error fetching staff earnings:', error);
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
    console.error('Error fetching staff utilization:', error);
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
    console.error('Error fetching staff appointments:', error);
    throw error;
  }

  return data;
}