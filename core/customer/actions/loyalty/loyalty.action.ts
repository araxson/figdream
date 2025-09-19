'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function adjustLoyaltyPoints(
  customerId: string,
  amount: number,
  type: 'earn' | 'redeem',
  reason?: string
) {
  const supabase = await createClient();

  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth.user) {
    throw new Error('Unauthorized');
  }

  const { error } = await supabase
    .from('customer_loyalty_points')
    .insert({
      customer_id: customerId,
      points: type === 'earn' ? amount : -amount,
      transaction_type: type,
      reason: reason || `Points ${type === 'earn' ? 'earned' : 'redeemed'}`,
      created_by: auth.user.id
    });

  if (error) {
    throw new Error('Failed to adjust loyalty points');
  }

  revalidatePath('/dashboard/loyalty');
  return { success: true };
}

export async function updateLoyaltyTier(
  customerId: string,
  tier: string
) {
  const supabase = await createClient();

  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth.user) {
    throw new Error('Unauthorized');
  }

  const { error } = await supabase
    .from('customer_loyalty')
    .update({ tier })
    .eq('customer_id', customerId);

  if (error) {
    throw new Error('Failed to update loyalty tier');
  }

  revalidatePath('/dashboard/loyalty');
  return { success: true };
}