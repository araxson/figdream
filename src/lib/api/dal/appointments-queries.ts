import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/database.types';
import { verifySession } from './auth';
import { AppointmentDTO } from './appointments-types';
import { canManageAppointments } from './role-utils';

/**
 * Get customer's appointments
 */
export const getCustomerAppointments = cache(async (): Promise<AppointmentDTO[]> => {
  const session = await verifySession();
  if (!session) return [];
  
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('customer_id', session.user.id)
    .order('appointment_date', { ascending: false });
  
  if (error || !data) return [];
  
  return data.map(apt => ({
    id: apt.id,
    customer_id: apt.customer_id,
    salon_id: apt.salon_id,
    staff_id: apt.staff_id,
    appointment_date: apt.appointment_date,
    start_time: apt.start_time,
    end_time: apt.end_time,
    status: apt.status,
    total_price: apt.computed_total_price,
    notes: apt.notes,
    created_at: apt.created_at,
    updated_at: apt.updated_at,
  }));
});

/**
 * Get upcoming appointments for customer
 */
export const getUpcomingAppointments = cache(async (): Promise<AppointmentDTO[]> => {
  const session = await verifySession();
  if (!session) return [];
  
  const supabase = await createClient();
  const now = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('customer_id', session.user.id)
    .gte('appointment_date', now.split('T')[0])
    .in('status', ['confirmed', 'pending'])
    .order('appointment_date', { ascending: true });
  
  if (error || !data) return [];
  
  return data.map(apt => ({
    id: apt.id,
    customer_id: apt.customer_id,
    salon_id: apt.salon_id,
    staff_id: apt.staff_id,
    appointment_date: apt.appointment_date,
    start_time: apt.start_time,
    end_time: apt.end_time,
    status: apt.status,
    total_price: apt.computed_total_price,
    notes: apt.notes,
    created_at: apt.created_at,
    updated_at: apt.updated_at,
  }));
});

/**
 * Get today's appointments with related data
 */
export const getTodayAppointmentsWithDetails = cache(async (filters?: {
  status?: Database['public']['Enums']['appointment_status'];
  staffId?: string;
  salonId?: string;
}) => {
  const session = await verifySession();
  if (!session) return [];
  
  const supabase = await createClient();
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  let query = supabase
    .from('appointments')
    .select(`
      *,
      profiles!customer_id(*),
      appointment_services(services(*)),
      staff_profiles(profiles(*))
    `)
    .gte('start_time', today.toISOString())
    .lt('start_time', tomorrow.toISOString())
    .order('start_time', { ascending: true });
  
  // Apply filters if provided
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.staffId) {
    query = query.eq('staff_id', filters.staffId);
  }
  if (filters?.salonId) {
    query = query.eq('salon_id', filters.salonId);
  }
  
  const { data, error } = await query;
  
  if (error || !data) return [];
  
  return data;
});

/**
 * Get salon appointments (staff and above)
 */
export const getSalonAppointments = cache(async (salonId: string): Promise<AppointmentDTO[]> => {
  const session = await verifySession();
  if (!session || !canManageAppointments(session.user.role)) return [];
  
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('salon_id', salonId)
    .order('appointment_date', { ascending: false });
  
  if (error || !data) return [];
  
  return data.map(apt => ({
    id: apt.id,
    customer_id: apt.customer_id,
    salon_id: apt.salon_id,
    staff_id: apt.staff_id,
    appointment_date: apt.appointment_date,
    start_time: apt.start_time,
    end_time: apt.end_time,
    status: apt.status,
    total_price: apt.computed_total_price,
    notes: apt.notes,
    created_at: apt.created_at,
    updated_at: apt.updated_at,
  }));
});