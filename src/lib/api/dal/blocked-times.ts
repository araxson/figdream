import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/database.types';
import { verifySession } from './auth';

type BlockedTimeInsert = Database['public']['Tables']['blocked_times']['Insert'];

export type BlockedTimeDTO = {
  id: string;
  salon_id: string;
  staff_id: string | null;
  start_time: string;
  end_time: string;
  reason: string | null;
  is_recurring: boolean;
  recurrence_pattern: string | null;
  created_at: string;
  updated_at: string;
};

/**
 * Get blocked times for salon
 */
export const getSalonBlockedTimes = cache(async (salonId: string, startDate: string, endDate: string): Promise<BlockedTimeDTO[]> => {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('blocked_times')
    .select('*')
    .eq('salon_id', salonId)
    .gte('start_time', startDate)
    .lte('end_time', endDate)
    .order('start_time', { ascending: true });
  
  if (error || !data) return [];
  
  return data.map(blocked => ({
    id: blocked.id,
    salon_id: blocked.salon_id,
    staff_id: blocked.staff_id,
    start_time: blocked.start_datetime,
    end_time: blocked.end_datetime,
    reason: blocked.reason,
    is_recurring: false, // Field doesn't exist in database
    recurrence_pattern: null, // Field doesn't exist in database
    created_at: blocked.created_at,
    updated_at: blocked.updated_at,
  }));
});

/**
 * Get staff blocked times
 */
export const getStaffBlockedTimes = cache(async (staffId: string, startDate: string, endDate: string): Promise<BlockedTimeDTO[]> => {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('blocked_times')
    .select('*')
    .eq('staff_id', staffId)
    .gte('start_time', startDate)
    .lte('end_time', endDate)
    .order('start_time', { ascending: true });
  
  if (error || !data) return [];
  
  return data.map(blocked => ({
    id: blocked.id,
    salon_id: blocked.salon_id,
    staff_id: blocked.staff_id,
    start_time: blocked.start_datetime,
    end_time: blocked.end_datetime,
    reason: blocked.reason,
    is_recurring: false, // Field doesn't exist in database
    recurrence_pattern: null, // Field doesn't exist in database
    created_at: blocked.created_at,
    updated_at: blocked.updated_at,
  }));
});

/**
 * Create blocked time (owner/staff only)
 */
export const createBlockedTime = async (blockedTime: BlockedTimeInsert): Promise<BlockedTimeDTO | null> => {
  const session = await verifySession();
  if (!session || !['owner', 'staff', 'admin'].includes(session.user.role)) return null;
  
  const supabase = await createClient();
  
  // Verify permission
  if (session.user.role === 'staff' && blockedTime.staff_id !== session.user.id) {
    return null;
  }
  
  const { data, error } = await supabase
    .from('blocked_times')
    .insert(blockedTime)
    .select()
    .single();
  
  if (error || !data) return null;
  
  return {
    id: data.id,
    salon_id: data.salon_id,
    staff_id: data.staff_id,
    start_time: data.start_datetime,
    end_time: data.end_datetime,
    reason: data.reason,
    is_recurring: false, // Field doesn't exist in database
    recurrence_pattern: null, // Field doesn't exist in database
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
};

/**
 * Delete blocked time
 */
export const deleteBlockedTime = async (blockedTimeId: string): Promise<boolean> => {
  const session = await verifySession();
  if (!session || !['owner', 'staff', 'admin'].includes(session.user.role)) return false;
  
  const supabase = await createClient();
  
  // Get blocked time to check ownership
  const { data: blocked } = await supabase
    .from('blocked_times')
    .select('staff_id, salon_id')
    .eq('id', blockedTimeId)
    .single();
  
  if (!blocked) return false;
  
  // Check permission
  if (session.user.role === 'staff' && blocked.staff_id !== session.user.id) {
    return false;
  }
  
  const { error } = await supabase
    .from('blocked_times')
    .delete()
    .eq('id', blockedTimeId);
  
  return !error;
};