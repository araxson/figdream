import { createClient } from '@/lib/database/supabase/client';
import { Database } from '@/types/database.types';

type CustomerUpdate = Database['public']['Tables']['customers']['Update'];

export async function updateCustomer(customerId: string, updates: CustomerUpdate) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('customers')
    .update(updates)
    .eq('id', customerId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteCustomer(customerId: string) {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', customerId);

  if (error) {
    throw error;
  }
}