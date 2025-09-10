import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/database.types';
import { verifySession } from './auth';

type AppointmentInsert = Database['public']['Tables']['appointments']['Insert'];

export type AppointmentDTO = {
  id: string;
  customer_id: string;
  salon_id: string;
  staff_id: string | null;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
  total_price: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

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
 * Get salon appointments (owner/staff only)
 */
export const getSalonAppointments = cache(async (salonId: string): Promise<AppointmentDTO[]> => {
  const session = await verifySession();
  if (!session || !['owner', 'staff', 'admin'].includes(session.user.role)) return [];
  
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

/**
 * Create new appointment
 */
export const createAppointment = async (appointment: Omit<AppointmentInsert, 'customer_id'>): Promise<AppointmentDTO | null> => {
  const session = await verifySession();
  if (!session) return null;
  
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('appointments')
    .insert({
      ...appointment,
      customer_id: session.user.id,
    })
    .select()
    .single();
  
  if (error || !data) return null;
  
  return {
    id: data.id,
    customer_id: data.customer_id,
    salon_id: data.salon_id,
    staff_id: data.staff_id,
    appointment_date: data.appointment_date,
    start_time: data.start_time,
    end_time: data.end_time,
    status: data.status,
    total_price: data.computed_total_price,
    notes: data.notes,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
};

/**
 * Update appointment status
 */
export const updateAppointmentStatus = async (appointmentId: string, status: Database['public']['Enums']['appointment_status']): Promise<AppointmentDTO | null> => {
  const session = await verifySession();
  if (!session) return null;
  
  const supabase = await createClient();
  
  // Check ownership or staff access
  const { data: existingApt } = await supabase
    .from('appointments')
    .select('customer_id, salon_id')
    .eq('id', appointmentId)
    .single();
  
  if (!existingApt) return null;
  
  // Allow customer to cancel their own appointment
  // Allow salon owner/staff to update any status
  const canUpdate = 
    existingApt.customer_id === session.user.id ||
    ['owner', 'staff', 'admin'].includes(session.user.role);
  
  if (!canUpdate) return null;
  
  const { data, error } = await supabase
    .from('appointments')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', appointmentId)
    .select()
    .single();
  
  if (error || !data) return null;
  
  return {
    id: data.id,
    customer_id: data.customer_id,
    salon_id: data.salon_id,
    staff_id: data.staff_id,
    appointment_date: data.appointment_date,
    start_time: data.start_time,
    end_time: data.end_time,
    status: data.status,
    total_price: data.computed_total_price,
    notes: data.notes,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
};

/**
 * Cancel appointment
 */
export const cancelAppointment = async (appointmentId: string): Promise<boolean> => {
  const result = await updateAppointmentStatus(appointmentId, 'cancelled');
  return result !== null;
};