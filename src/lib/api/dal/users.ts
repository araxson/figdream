import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/database.types';
import { verifySession } from './auth';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

/**
 * Get all users (admin only)
 */
export const getAllUsers = cache(async (): Promise<Profile[]> => {
  const session = await verifySession();
  if (!session || session.user.role !== 'super_admin') {
    return [];
  }
  
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching users:', error);
    return [];
  }
  
  return data || [];
});

/**
 * Update user role (admin only)
 */
export const updateUserRole = async (
  userId: string, 
  newRole: string
): Promise<boolean> => {
  const session = await verifySession();
  if (!session || session.user.role !== 'super_admin') {
    return false;
  }
  
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId);
  
  return !error;
};

/**
 * Delete user (admin only)
 */
export const deleteUser = async (userId: string): Promise<boolean> => {
  const session = await verifySession();
  if (!session || session.user.role !== 'super_admin') {
    return false;
  }
  
  const supabase = await createClient();
  
  // Delete user profile (this should cascade to related records)
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);
  
  if (error) {
    console.error('Error deleting user:', error);
    return false;
  }
  
  // Also delete from auth.users table
  const { error: authError } = await supabase.auth.admin.deleteUser(userId);
  
  if (authError) {
    console.error('Error deleting auth user:', authError);
  }
  
  return !error;
};

/**
 * Update user profile (admin only)
 */
export const updateUserProfile = async (
  userId: string,
  updates: ProfileUpdate
): Promise<boolean> => {
  const session = await verifySession();
  if (!session || session.user.role !== 'super_admin') {
    return false;
  }
  
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);
  
  if (error) {
    console.error('Error updating user profile:', error);
    return false;
  }
  
  return true;
};

/**
 * Get single user by ID (admin only)
 */
export const getUserById = cache(async (userId: string): Promise<Profile | null> => {
  const session = await verifySession();
  if (!session || session.user.role !== 'super_admin') {
    return null;
  }
  
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }
  
  return data;
});

/**
 * Search users (admin only)
 */
export const searchUsers = cache(async (query: string): Promise<Profile[]> => {
  const session = await verifySession();
  if (!session || session.user.role !== 'super_admin') {
    return [];
  }
  
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .or(`email.ilike.%${query}%,full_name.ilike.%${query}%`)
    .order('created_at', { ascending: false })
    .limit(50);
  
  if (error) {
    console.error('Error searching users:', error);
    return [];
  }
  
  return data || [];
});