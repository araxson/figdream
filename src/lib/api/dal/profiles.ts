import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/database.types';
import { verifySession } from './auth';

type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];


export type ProfileDTO = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  role: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

/**
 * Get current user's profile
 */
export const getCurrentProfile = cache(async (): Promise<ProfileDTO | null> => {
  const session = await verifySession();
  if (!session) return null;
  
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();
  
  if (error || !data) return null;
  
  // Return DTO with only necessary fields
  return {
    id: data.id,
    first_name: data.first_name,
    last_name: data.last_name,
    phone: data.phone,
    role: data.role,
    avatar_url: data.avatar_url,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
});

/**
 * Get profile by ID (with auth check)
 */
export const getProfileById = cache(async (profileId: string): Promise<ProfileDTO | null> => {
  const session = await verifySession();
  if (!session) return null;
  
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', profileId)
    .single();
  
  if (error || !data) return null;
  
  return {
    id: data.id,
    first_name: data.first_name,
    last_name: data.last_name,
    phone: data.phone,
    role: data.role,
    avatar_url: data.avatar_url,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
});

/**
 * Update current user's profile
 */
export const updateCurrentProfile = async (updates: Partial<ProfileUpdate>): Promise<ProfileDTO | null> => {
  const session = await verifySession();
  if (!session) return null;
  
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', session.user.id)
    .select()
    .single();
  
  if (error || !data) return null;
  
  return {
    id: data.id,
    first_name: data.first_name,
    last_name: data.last_name,
    phone: data.phone,
    role: data.role,
    avatar_url: data.avatar_url,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
};

/**
 * Get all profiles (admin only)
 */
export const getAllProfiles = cache(async (): Promise<ProfileDTO[]> => {
  const session = await verifySession();
  if (!session || session.user.role !== 'super_admin') return [];
  
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error || !data) return [];
  
  return data.map(profile => ({
    id: profile.id,
    first_name: profile.first_name,
    last_name: profile.last_name,
    phone: profile.phone,
    role: profile.role,
    avatar_url: profile.avatar_url,
    created_at: profile.created_at,
    updated_at: profile.updated_at,
  }));
});