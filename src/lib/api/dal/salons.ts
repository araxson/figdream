import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/database.types';
import { verifySession } from './auth';

type SalonInsert = Database['public']['Tables']['salons']['Insert'];
type SalonUpdate = Database['public']['Tables']['salons']['Update'];

export type SalonDTO = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  owner_id: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  logo_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

/**
 * Get all active salons
 */
export const getActiveSalons = cache(async (): Promise<SalonDTO[]> => {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('salons')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true });
  
  if (error || !data) return [];
  
  return data.map(salon => ({
    id: salon.id,
    name: salon.name,
    slug: salon.slug,
    description: salon.description,
    owner_id: salon.created_by,
    phone: salon.phone,
    email: salon.email,
    website: salon.website,
    logo_url: salon.logo_url,
    is_active: salon.is_active ?? true,
    created_at: salon.created_at,
    updated_at: salon.updated_at,
  }));
});

/**
 * Get salon by slug
 */
export const getSalonBySlug = cache(async (slug: string): Promise<SalonDTO | null> => {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('salons')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();
  
  if (error || !data) return null;
  
  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    description: data.description,
    owner_id: data.created_by,
    phone: data.phone,
    email: data.email,
    website: data.website,
    logo_url: data.logo_url,
    is_active: data.is_active ?? true,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
});

/**
 * Get salon by ID
 */
export const getSalonById = cache(async (salonId: string): Promise<SalonDTO | null> => {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('salons')
    .select('*')
    .eq('id', salonId)
    .single();
  
  if (error || !data) return null;
  
  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    description: data.description,
    owner_id: data.created_by,
    phone: data.phone,
    email: data.email,
    website: data.website,
    logo_url: data.logo_url,
    is_active: data.is_active ?? true,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
});

/**
 * Get salons owned by current user
 */
export const getOwnedSalons = cache(async (): Promise<SalonDTO[]> => {
  const session = await verifySession();
  if (!session) return [];
  
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('salons')
    .select('*')
    .eq('owner_id', session.user.id)
    .order('created_at', { ascending: false });
  
  if (error || !data) return [];
  
  return data.map(salon => ({
    id: salon.id,
    name: salon.name,
    slug: salon.slug,
    description: salon.description,
    owner_id: salon.created_by,
    phone: salon.phone,
    email: salon.email,
    website: salon.website,
    logo_url: salon.logo_url,
    is_active: salon.is_active ?? true,
    created_at: salon.created_at,
    updated_at: salon.updated_at,
  }));
});

/**
 * Create new salon (owner only)
 */
export const createSalon = async (salon: Omit<SalonInsert, 'owner_id'>): Promise<SalonDTO | null> => {
  const session = await verifySession();
  if (!session || !['owner', 'admin'].includes(session.user.role)) return null;
  
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('salons')
    .insert({
      ...salon,
      owner_id: session.user.id,
    })
    .select()
    .single();
  
  if (error || !data) return null;
  
  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    description: data.description,
    owner_id: data.created_by,
    phone: data.phone,
    email: data.email,
    website: data.website,
    logo_url: data.logo_url,
    is_active: data.is_active ?? true,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
};

/**
 * Update salon (owner only)
 */
export const updateSalon = async (salonId: string, updates: Partial<SalonUpdate>): Promise<SalonDTO | null> => {
  const session = await verifySession();
  if (!session) return null;
  
  const supabase = await createClient();
  
  // Check ownership
  const { data: existingSalon } = await supabase
    .from('salons')
    .select('created_by')
    .eq('id', salonId)
    .single();
  
  if (!existingSalon || (existingSalon.created_by !== session.user.id && session.user.role !== 'super_admin')) {
    return null;
  }
  
  const { data, error } = await supabase
    .from('salons')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', salonId)
    .select()
    .single();
  
  if (error || !data) return null;
  
  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    description: data.description,
    owner_id: data.created_by,
    phone: data.phone,
    email: data.email,
    website: data.website,
    logo_url: data.logo_url,
    is_active: data.is_active ?? true,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
};