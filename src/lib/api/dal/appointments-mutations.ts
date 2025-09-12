import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/database.types';
import { verifySession } from './auth';
import { AppointmentDTO, AppointmentInsert } from './appointments-types';

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