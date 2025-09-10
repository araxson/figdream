import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/database.types';
import { verifySession } from './auth';

type StaffProfileInsert = Database['public']['Tables']['staff_profiles']['Insert'];
type StaffProfileUpdate = Database['public']['Tables']['staff_profiles']['Update'];

export type StaffDTO = {
  id: string;
  user_id: string;
  salon_id: string;
  is_active: boolean;
  commission_rate: number | null;
  bio: string | null;
  specialties: string[] | null;
  created_at: string;
  updated_at: string;
};

/**
 * Get staff by salon
 */
export const getSalonStaff = cache(async (salonId: string): Promise<StaffDTO[]> => {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('staff_profiles')
    .select('*')
    .eq('salon_id', salonId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  
  if (error || !data) return [];
  
  return data.map(staff => ({
    id: staff.id,
    user_id: staff.user_id,
    salon_id: staff.salon_id,
    is_active: staff.is_active ?? true,
    commission_rate: staff.commission_rate,
    bio: staff.bio,
    specialties: staff.specialties,
    created_at: staff.created_at,
    updated_at: staff.updated_at,
  }));
});

/**
 * Get staff member by ID
 */
export const getStaffById = cache(async (staffId: string): Promise<StaffDTO | null> => {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('staff_profiles')
    .select('*')
    .eq('id', staffId)
    .single();
  
  if (error || !data) return null;
  
  return {
    id: data.id,
    user_id: data.user_id,
    salon_id: data.salon_id,
    is_active: data.is_active ?? true,
    commission_rate: data.commission_rate,
    bio: data.bio,
    specialties: data.specialties,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
});

/**
 * Get staff profile for current user
 */
export const getCurrentStaffProfile = cache(async (): Promise<StaffDTO | null> => {
  const session = await verifySession();
  if (!session) return null;
  
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('staff_profiles')
    .select('*')
    .eq('user_id', session.user.id)
    .single();
  
  if (error || !data) return null;
  
  return {
    id: data.id,
    user_id: data.user_id,
    salon_id: data.salon_id,
    is_active: data.is_active ?? true,
    commission_rate: data.commission_rate,
    bio: data.bio,
    specialties: data.specialties,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
});

/**
 * Create staff member (owner only)
 */
export const createStaffMember = async (staff: StaffProfileInsert): Promise<StaffDTO | null> => {
  const session = await verifySession();
  if (!session || !['owner', 'admin'].includes(session.user.role)) return null;
  
  const supabase = await createClient();
  
  // Verify salon ownership
  const { data: salon } = await supabase
    .from('salons')
    .select('created_by')
    .eq('id', staff.salon_id)
    .single();
  
  if (!salon || (salon.created_by !== session.user.id && session.user.role !== 'super_admin')) {
    return null;
  }
  
  const { data, error } = await supabase
    .from('staff_profiles')
    .insert(staff)
    .select()
    .single();
  
  if (error || !data) return null;
  
  return {
    id: data.id,
    user_id: data.user_id,
    salon_id: data.salon_id,
    is_active: data.is_active ?? true,
    commission_rate: data.commission_rate,
    bio: data.bio,
    specialties: data.specialties,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
};

/**
 * Update staff member
 */
export const updateStaffMember = async (staffId: string, updates: Partial<StaffProfileUpdate>): Promise<StaffDTO | null> => {
  const session = await verifySession();
  if (!session) return null;
  
  const supabase = await createClient();
  
  // Get staff to check salon ownership
  const { data: existingStaff } = await supabase
    .from('staff_profiles')
    .select('salon_id, user_id')
    .eq('id', staffId)
    .single();
  
  if (!existingStaff) return null;
  
  // Allow staff to update their own profile or owner to update any staff
  if (existingStaff.user_id !== session.user.id) {
    // Check if user is salon owner
    const { data: salon } = await supabase
      .from('salons')
      .select('created_by')
      .eq('id', existingStaff.salon_id)
      .single();
    
    if (!salon || (salon.created_by !== session.user.id && session.user.role !== 'super_admin')) {
      return null;
    }
  }
  
  const { data, error } = await supabase
    .from('staff_profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', staffId)
    .select()
    .single();
  
  if (error || !data) return null;
  
  return {
    id: data.id,
    user_id: data.user_id,
    salon_id: data.salon_id,
    is_active: data.is_active ?? true,
    commission_rate: data.commission_rate,
    bio: data.bio,
    specialties: data.specialties,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
};

/**
 * Deactivate staff member (owner only)
 */
export const deactivateStaffMember = async (staffId: string): Promise<boolean> => {
  const result = await updateStaffMember(staffId, { is_active: false });
  return result !== null;
};