import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { verifySession } from './auth';

/**
 * Get customer favorites
 */
export const getCustomerFavorites = cache(async () => {
  const session = await verifySession();
  if (!session) return [];
  
  const supabase = await createClient();
  
  // Get customer record
  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('email', session.user.email)
    .single();

  if (!customer) return [];

  // Fetch favorites with related data
  const { data } = await supabase
    .from('customer_favorites')
    .select(`
      *,
      salons(*),
      services(*),
      staff_profiles(
        profiles(*)
      )
    `)
    .eq('customer_id', customer.id)
    .order('created_at', { ascending: false });

  return data || [];
});

/**
 * Remove a favorite
 */
export const removeFavorite = async (favoriteId: string): Promise<boolean> => {
  const session = await verifySession();
  if (!session) return false;
  
  const supabase = await createClient();
  
  // Verify ownership
  const { data: favorite } = await supabase
    .from('customer_favorites')
    .select('customer_id')
    .eq('id', favoriteId)
    .single();
    
  if (!favorite) return false;
  
  // Get customer record
  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('email', session.user.email)
    .single();
    
  if (!customer || customer.id !== favorite.customer_id) return false;
  
  const { error } = await supabase
    .from('customer_favorites')
    .delete()
    .eq('id', favoriteId);

  return !error;
};

/**
 * Add a favorite
 */
export const addFavorite = async (
  type: 'salon' | 'service' | 'staff',
  itemId: string
): Promise<boolean> => {
  const session = await verifySession();
  if (!session) return false;
  
  const supabase = await createClient();
  
  // Get customer record
  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('email', session.user.email)
    .single();
    
  if (!customer) return false;
  
  const favoriteData = {
    customer_id: customer.id,
    favorite_type: type,
    salon_id: type === 'salon' ? itemId : '',
    service_id: type === 'service' ? itemId : '',
    staff_id: type === 'staff' ? itemId : '',
  };
  
  const { error } = await supabase
    .from('customer_favorites')
    .insert(favoriteData);

  return !error;
};