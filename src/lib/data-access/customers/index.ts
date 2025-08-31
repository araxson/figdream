import { createClient } from '@/lib/database/supabase/server';
import { Database } from '@/types/database.types';

type Customer = Database['public']['Tables']['customers']['Row'];
type CustomerInsert = Database['public']['Tables']['customers']['Insert'];
type CustomerUpdate = Database['public']['Tables']['customers']['Update'];
type CustomerPreferences = Database['public']['Tables']['customer_preferences']['Row'];
type CustomerAnalytics = Database['public']['Tables']['customer_analytics']['Row'];

export async function getCustomers(salonId?: string) {
  const supabase = await createClient();
  
  let query = supabase
    .from('customers')
    .select(`
      *,
      profiles:user_id (
        email,
        full_name,
        avatar_url
      ),
      customer_preferences (*),
      customer_analytics (*)
    `)
    .order('created_at', { ascending: false });

  if (salonId) {
    query = query.eq('salon_id', salonId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }

  return data;
}

export async function getCustomerById(customerId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('customers')
    .select(`
      *,
      profiles:user_id (
        email,
        full_name,
        avatar_url
      ),
      customer_preferences (*),
      customer_analytics (*),
      appointments (
        id,
        appointment_date,
        start_time,
        end_time,
        status,
        total_amount,
        appointment_services (
          service_id,
          services (
            name,
            category
          )
        )
      ),
      loyalty_transactions (
        id,
        points,
        transaction_type,
        description,
        created_at
      )
    `)
    .eq('id', customerId)
    .single();

  if (error) {
    console.error('Error fetching customer:', error);
    throw error;
  }

  return data;
}

export async function getCustomerByUserId(userId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('customers')
    .select(`
      *,
      profiles:user_id (
        email,
        full_name,
        avatar_url
      ),
      customer_preferences (*),
      customer_analytics (*)
    `)
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') { // Not found is ok
    console.error('Error fetching customer by user ID:', error);
    throw error;
  }

  return data;
}

export async function createCustomer(customer: CustomerInsert) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('customers')
    .insert(customer)
    .select()
    .single();

  if (error) {
    console.error('Error creating customer:', error);
    throw error;
  }

  return data;
}

export async function updateCustomer(customerId: string, updates: CustomerUpdate) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('customers')
    .update(updates)
    .eq('id', customerId)
    .select()
    .single();

  if (error) {
    console.error('Error updating customer:', error);
    throw error;
  }

  return data;
}

export async function deleteCustomer(customerId: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', customerId);

  if (error) {
    console.error('Error deleting customer:', error);
    throw error;
  }

  return true;
}

export async function getCustomerPreferences(customerId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('customer_preferences')
    .select('*')
    .eq('customer_id', customerId)
    .single();

  if (error && error.code !== 'PGRST116') { // Not found is ok
    console.error('Error fetching customer preferences:', error);
    throw error;
  }

  return data;
}

export async function updateCustomerPreferences(
  customerId: string,
  preferences: Partial<CustomerPreferences>
) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('customer_preferences')
    .upsert({
      customer_id: customerId,
      ...preferences,
    })
    .select()
    .single();

  if (error) {
    console.error('Error updating customer preferences:', error);
    throw error;
  }

  return data;
}

export async function getCustomerAnalytics(customerId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('customer_analytics')
    .select('*')
    .eq('customer_id', customerId)
    .single();

  if (error && error.code !== 'PGRST116') { // Not found is ok
    console.error('Error fetching customer analytics:', error);
    throw error;
  }

  return data;
}

export async function getCustomerAppointments(customerId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      appointment_services (
        *,
        services (*)
      ),
      staff_profiles (
        user_id,
        display_name,
        profiles:user_id (
          full_name,
          avatar_url
        )
      ),
      salons (
        name,
        address,
        city,
        state
      )
    `)
    .eq('customer_id', customerId)
    .order('appointment_date', { ascending: false });

  if (error) {
    console.error('Error fetching customer appointments:', error);
    throw error;
  }

  return data;
}

export async function getCustomerLoyaltyPoints(customerId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('loyalty_transactions')
    .select('points')
    .eq('customer_id', customerId);

  if (error) {
    console.error('Error fetching loyalty points:', error);
    throw error;
  }

  const totalPoints = data?.reduce((sum, transaction) => sum + (transaction.points || 0), 0) || 0;
  
  return totalPoints;
}

export async function getCustomerLoyaltyTransactions(customerId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('loyalty_transactions')
    .select(`
      *,
      loyalty_programs (
        name,
        description
      )
    `)
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching loyalty transactions:', error);
    throw error;
  }

  return data;
}

export async function searchCustomers(searchTerm: string, salonId?: string) {
  const supabase = await createClient();
  
  let query = supabase
    .from('customers')
    .select(`
      *,
      profiles:user_id (
        email,
        full_name,
        avatar_url
      )
    `);

  if (salonId) {
    query = query.eq('salon_id', salonId);
  }

  // Search in customer phone, email, and profile full_name
  query = query.or(`phone.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);

  const { data, error } = await query;

  if (error) {
    console.error('Error searching customers:', error);
    throw error;
  }

  return data;
}