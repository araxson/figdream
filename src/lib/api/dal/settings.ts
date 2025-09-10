import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { Json } from '@/types/database.types';
import { verifySession } from './auth';

export type SettingsDTO = {
  id: string;
  salon_id: string;
  location_id: string | null;
  setting_key: string;
  setting_value: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

/**
 * Get salon settings
 */
export const getSalonSettings = cache(async (salonId: string): Promise<SettingsDTO[]> => {
  const session = await verifySession();
  if (!session) return [];
  
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('salon_id', salonId)
    .order('setting_key', { ascending: true });
  
  if (error || !data) return [];
  
  return data.map(setting => ({
    id: setting.id,
    salon_id: setting.salon_id,
    location_id: setting.location_id,
    setting_key: setting.setting_key,
    setting_value: setting.setting_value as Record<string, unknown>,
    created_at: setting.created_at,
    updated_at: setting.updated_at,
  }));
});

/**
 * Get specific setting by key
 */
export const getSettingByKey = cache(async (key: string): Promise<SettingsDTO | null> => {
  const session = await verifySession();
  if (!session) return null;
  
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('user_id', session.user.id)
    .eq('key', key)
    .single();
  
  if (error || !data) return null;
  
  return {
    id: data.id,
    salon_id: data.salon_id,
    location_id: data.location_id,
    setting_key: data.setting_key,
    setting_value: data.setting_value as Record<string, unknown>,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
});

/**
 * Update or create setting
 */
export const upsertSetting = async (salonId: string, key: string, value: Record<string, unknown>): Promise<SettingsDTO | null> => {
  const session = await verifySession();
  if (!session) return null;
  
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('settings')
    .upsert({
      salon_id: salonId,
      setting_key: key,
      setting_value: value as Json,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();
  
  if (error || !data) return null;
  
  return {
    id: data.id,
    salon_id: data.salon_id,
    location_id: data.location_id,
    setting_key: data.setting_key,
    setting_value: data.setting_value as Record<string, unknown>,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
};

/**
 * Delete setting
 */
export const deleteSetting = async (salonId: string, key: string): Promise<boolean> => {
  const session = await verifySession();
  if (!session) return false;
  
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('settings')
    .delete()
    .eq('salon_id', salonId)
    .eq('setting_key', key);
  
  return !error;
};