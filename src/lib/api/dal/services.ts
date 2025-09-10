import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/database.types';
import { verifySession } from './auth';

;
type ServiceInsert = Database['public']['Tables']['services']['Insert'];
type ServiceUpdate = Database['public']['Tables']['services']['Update'];

export type ServiceDTO = {
  id: string;
  salon_id: string;
  name: string;
  description: string | null;
  category_id: string | null;
  base_price: number;
  duration_minutes: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

/**
 * Get services by salon
 */
export const getSalonServices = cache(async (salonId: string): Promise<ServiceDTO[]> => {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('salon_id', salonId)
    .eq('is_active', true)
    .order('name', { ascending: true });
  
  if (error || !data) return [];
  
  return data.map(service => ({
    id: service.id,
    salon_id: service.salon_id,
    name: service.name,
    description: service.description,
    category_id: service.category_id,
    base_price: service.price,
    duration_minutes: service.duration_minutes,
    is_active: service.is_active ?? true,
    created_at: service.created_at,
    updated_at: service.updated_at,
  }));
});

/**
 * Get service by ID
 */
export const getServiceById = cache(async (serviceId: string): Promise<ServiceDTO | null> => {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('id', serviceId)
    .single();
  
  if (error || !data) return null;
  
  return {
    id: data.id,
    salon_id: data.salon_id,
    name: data.name,
    description: data.description,
    category_id: data.category_id,
    base_price: data.price,
    duration_minutes: data.duration_minutes,
    is_active: data.is_active ?? true,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
});

/**
 * Create new service (owner only)
 */
export const createService = async (service: ServiceInsert): Promise<ServiceDTO | null> => {
  const session = await verifySession();
  if (!session || !['owner', 'admin'].includes(session.user.role)) return null;
  
  const supabase = await createClient();
  
  // Verify salon ownership
  const { data: salon } = await supabase
    .from('salons')
    .select('created_by')
    .eq('id', service.salon_id)
    .single();
  
  if (!salon || (salon.created_by !== session.user.id && session.user.role !== 'super_admin')) {
    return null;
  }
  
  const { data, error } = await supabase
    .from('services')
    .insert(service)
    .select()
    .single();
  
  if (error || !data) return null;
  
  return {
    id: data.id,
    salon_id: data.salon_id,
    name: data.name,
    description: data.description,
    category_id: data.category_id,
    base_price: data.price,
    duration_minutes: data.duration_minutes,
    is_active: data.is_active ?? true,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
};

/**
 * Update service (owner only)
 */
export const updateService = async (serviceId: string, updates: Partial<ServiceUpdate>): Promise<ServiceDTO | null> => {
  const session = await verifySession();
  if (!session || !['owner', 'admin'].includes(session.user.role)) return null;
  
  const supabase = await createClient();
  
  // Get service to check salon ownership
  const { data: existingService } = await supabase
    .from('services')
    .select('salon_id')
    .eq('id', serviceId)
    .single();
  
  if (!existingService) return null;
  
  // Verify salon ownership
  const { data: salon } = await supabase
    .from('salons')
    .select('created_by')
    .eq('id', existingService.salon_id)
    .single();
  
  if (!salon || (salon.created_by !== session.user.id && session.user.role !== 'super_admin')) {
    return null;
  }
  
  const { data, error } = await supabase
    .from('services')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', serviceId)
    .select()
    .single();
  
  if (error || !data) return null;
  
  return {
    id: data.id,
    salon_id: data.salon_id,
    name: data.name,
    description: data.description,
    category_id: data.category_id,
    base_price: data.price,
    duration_minutes: data.duration_minutes,
    is_active: data.is_active ?? true,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
};

/**
 * Delete service (soft delete by setting is_active to false)
 */
export const deleteService = async (serviceId: string): Promise<boolean> => {
  const result = await updateService(serviceId, { is_active: false });
  return result !== null;
};