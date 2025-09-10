import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/database.types';
import { verifySession } from './auth';

type CustomerInsert = Database['public']['Tables']['customers']['Insert'];
type CustomerUpdate = Database['public']['Tables']['customers']['Update'];

export type CustomerDTO = {
  id: string;
  user_id: string;
  salon_id: string;
  customer_since: string | null;
  preferred_staff_id: string | null;
  total_spent: number | null;
  visit_count: number;
  last_visit_date: string | null;
  tags: string[] | null;
  notes: string | null;
  is_vip: boolean;
  referral_source: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  computed_total_visits: number | null;
  computed_total_spent: number | null;
  computed_avg_appointment_value: number | null;
  has_tags: boolean | null;
  created_at: string;
  updated_at: string;
};

/**
 * Get current customer profile
 */
export const getCurrentCustomer = cache(async (): Promise<CustomerDTO | null> => {
  const session = await verifySession();
  if (!session) return null;
  
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('user_id', session.user.id)
    .single();
  
  if (error || !data) return null;
  
  return {
    id: data.id,
    user_id: data.user_id,
    salon_id: data.salon_id,
    customer_since: data.customer_since,
    preferred_staff_id: data.preferred_staff_id,
    total_spent: data.total_spent,
    visit_count: data.visit_count,
    last_visit_date: data.last_visit_date,
    tags: data.tags,
    notes: data.notes,
    is_vip: data.is_vip,
    referral_source: data.referral_source,
    first_name: data.first_name,
    last_name: data.last_name,
    email: data.email,
    phone: data.phone,
    computed_total_visits: data.computed_total_visits,
    computed_total_spent: data.computed_total_spent,
    computed_avg_appointment_value: data.computed_avg_appointment_value,
    has_tags: data.has_tags,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
});

/**
 * Get customer by ID (staff/owner only)
 */
export const getCustomerById = cache(async (customerId: string): Promise<CustomerDTO | null> => {
  const session = await verifySession();
  if (!session || !['staff', 'owner', 'admin'].includes(session.user.role)) return null;
  
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', customerId)
    .single();
  
  if (error || !data) return null;
  
  return {
    id: data.id,
    user_id: data.user_id,
    salon_id: data.salon_id,
    customer_since: data.customer_since,
    preferred_staff_id: data.preferred_staff_id,
    total_spent: data.total_spent,
    visit_count: data.visit_count,
    last_visit_date: data.last_visit_date,
    tags: data.tags,
    notes: data.notes,
    is_vip: data.is_vip,
    referral_source: data.referral_source,
    first_name: data.first_name,
    last_name: data.last_name,
    email: data.email,
    phone: data.phone,
    computed_total_visits: data.computed_total_visits,
    computed_total_spent: data.computed_total_spent,
    computed_avg_appointment_value: data.computed_avg_appointment_value,
    has_tags: data.has_tags,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
});

/**
 * Get salon customers (owner only)
 */
export const getSalonCustomers = cache(async (salonId: string): Promise<CustomerDTO[]> => {
  const session = await verifySession();
  if (!session || !['owner', 'admin'].includes(session.user.role)) return [];
  
  const supabase = await createClient();
  
  // Get customers directly from the salon
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('salon_id', salonId);
  
  if (error || !data) return [];
  
  return data.map(customer => ({
    id: customer.id,
    user_id: customer.user_id,
    salon_id: customer.salon_id,
    customer_since: customer.customer_since,
    preferred_staff_id: customer.preferred_staff_id,
    total_spent: customer.total_spent,
    visit_count: customer.visit_count,
    last_visit_date: customer.last_visit_date,
    tags: customer.tags,
    notes: customer.notes,
    is_vip: customer.is_vip,
    referral_source: customer.referral_source,
    first_name: customer.first_name,
    last_name: customer.last_name,
    email: customer.email,
    phone: customer.phone,
    computed_total_visits: customer.computed_total_visits,
    computed_total_spent: customer.computed_total_spent,
    computed_avg_appointment_value: customer.computed_avg_appointment_value,
    has_tags: customer.has_tags,
    created_at: customer.created_at,
    updated_at: customer.updated_at,
  }));
});

/**
 * Create or update customer profile
 */
export const upsertCustomer = async (customer: Omit<CustomerInsert, 'user_id'>): Promise<CustomerDTO | null> => {
  const session = await verifySession();
  if (!session) return null;
  
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('customers')
    .upsert({
      ...customer,
      user_id: session.user.id,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();
  
  if (error || !data) return null;
  
  return {
    id: data.id,
    user_id: data.user_id,
    salon_id: data.salon_id,
    customer_since: data.customer_since,
    preferred_staff_id: data.preferred_staff_id,
    total_spent: data.total_spent,
    visit_count: data.visit_count,
    last_visit_date: data.last_visit_date,
    tags: data.tags,
    notes: data.notes,
    is_vip: data.is_vip,
    referral_source: data.referral_source,
    first_name: data.first_name,
    last_name: data.last_name,
    email: data.email,
    phone: data.phone,
    computed_total_visits: data.computed_total_visits,
    computed_total_spent: data.computed_total_spent,
    computed_avg_appointment_value: data.computed_avg_appointment_value,
    has_tags: data.has_tags,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
};

/**
 * Update customer profile
 */
export const updateCustomer = async (updates: Partial<CustomerUpdate>): Promise<CustomerDTO | null> => {
  const session = await verifySession();
  if (!session) return null;
  
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('customers')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', session.user.id)
    .select()
    .single();
  
  if (error || !data) return null;
  
  return {
    id: data.id,
    user_id: data.user_id,
    salon_id: data.salon_id,
    customer_since: data.customer_since,
    preferred_staff_id: data.preferred_staff_id,
    total_spent: data.total_spent,
    visit_count: data.visit_count,
    last_visit_date: data.last_visit_date,
    tags: data.tags,
    notes: data.notes,
    is_vip: data.is_vip,
    referral_source: data.referral_source,
    first_name: data.first_name,
    last_name: data.last_name,
    email: data.email,
    phone: data.phone,
    computed_total_visits: data.computed_total_visits,
    computed_total_spent: data.computed_total_spent,
    computed_avg_appointment_value: data.computed_avg_appointment_value,
    has_tags: data.has_tags,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
};