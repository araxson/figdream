import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { verifySession } from './auth';
import { RawAppointment, AppointmentWithDetails } from './appointments-types';

const transformAppointment = (apt: RawAppointment): AppointmentWithDetails => ({
  id: apt.id,
  start_time: apt.start_time,
  end_time: apt.end_time,
  status: apt.status as 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show',
  computed_total_price: apt.computed_total_price,
  computed_total_duration: apt.computed_total_duration,
  staff: apt.staff_profiles?.profiles ? {
    full_name: (apt.staff_profiles.profiles as { full_name?: string | null; avatar_url?: string | null }).full_name || null,
    avatar_url: (apt.staff_profiles.profiles as { full_name?: string | null; avatar_url?: string | null }).avatar_url || null
  } : undefined,
  customer: apt.customers ? {
    first_name: (apt.customers as { first_name?: string; last_name?: string; phone?: string }).first_name || '',
    last_name: (apt.customers as { first_name?: string; last_name?: string; phone?: string }).last_name || '',
    phone: (apt.customers as { first_name?: string; last_name?: string; phone?: string }).phone || undefined
  } : undefined,
  salon: apt.salons ? {
    name: (apt.salons as { name?: string; address?: string }).name || '',
    address: (apt.salons as { name?: string; address?: string }).address || undefined
  } : undefined,
  services: (apt.appointment_services?.map((as) => {
    const service = as.services as { name?: string; price?: number; duration_minutes?: number } | undefined;
    return service ? {
      name: service.name || '',
      price: service.price || 0,
      duration_minutes: service.duration_minutes || 0
    } : null;
  }).filter((s): s is { name: string; price: number; duration_minutes: number } => s !== null) || []) as Array<{
    name: string;
    price: number;
    duration_minutes: number;
  }>
});

/**
 * Get appointments by role with filtering
 */
export const getAppointmentsByRole = cache(async (params: {
  userRole: string;
  userId: string;
  view?: 'upcoming' | 'past' | 'today' | 'all';
  salonId?: string;
  staffId?: string;
  customerId?: string;
}) => {
  const session = await verifySession();
  if (!session) return [];
  
  const supabase = await createClient();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  let query = supabase
    .from('appointments')
    .select(`
      *,
      staff_profiles(profiles(full_name, avatar_url)),
      customers(first_name, last_name, phone),
      salons(name, address),
      appointment_services(
        services(name, price, duration_minutes)
      )
    `);
  
  // Role-based filtering
  if (params.userRole === 'customer') {
    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('user_id', params.userId)
      .single();
    
    if (customer) {
      query = query.eq('customer_id', customer.id);
    }
  } else if (params.userRole === 'staff') {
    query = query.eq('staff_id', params.userId);
  } else if (params.userRole === 'salon_owner' && params.salonId) {
    query = query.eq('salon_id', params.salonId);
  }
  
  // Additional filters
  if (params.staffId) query = query.eq('staff_id', params.staffId);
  if (params.customerId) query = query.eq('customer_id', params.customerId);
  
  // View filtering
  if (params.view === 'upcoming') {
    query = query
      .gte('start_time', now.toISOString())
      .in('status', ['pending', 'confirmed'])
      .order('start_time', { ascending: true });
  } else if (params.view === 'past') {
    query = query
      .lt('start_time', now.toISOString())
      .order('start_time', { ascending: false });
  } else if (params.view === 'today') {
    query = query
      .gte('start_time', today.toISOString())
      .lt('start_time', tomorrow.toISOString())
      .order('start_time', { ascending: true });
  } else {
    query = query.order('start_time', { ascending: false });
  }
  
  const { data } = await query.limit(50);
  
  return (data || []).map((apt: unknown) => {
    const appointment = apt as RawAppointment & {
      staff_profiles?: { profiles?: { full_name?: string | null; avatar_url?: string | null } };
      customers?: { first_name?: string; last_name?: string; phone?: string };
      salons?: { name?: string; address?: string };
      appointment_services?: Array<{ services?: { name?: string; price?: number; duration_minutes?: number } }>;
    };
    return ({
      id: appointment.id,
      start_time: appointment.start_time,
      end_time: appointment.end_time,
      status: appointment.status as 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show',
      computed_total_price: appointment.computed_total_price,
      computed_total_duration: appointment.computed_total_duration,
      staff: appointment.staff_profiles?.profiles ? {
        full_name: appointment.staff_profiles.profiles.full_name || ''
      } : undefined,
      customer: appointment.customers ? {
        first_name: appointment.customers.first_name || '',
        last_name: appointment.customers.last_name || '',
        phone: appointment.customers.phone
      } : undefined,
      salon: appointment.salons ? {
        name: appointment.salons.name || '',
        address: appointment.salons.address
      } : undefined,
      services: appointment.appointment_services?.map((as: { services?: { name?: string; price?: number; duration_minutes?: number } }) => as.services)
        .filter((service): service is { name?: string; price?: number; duration_minutes?: number } => service !== null && service !== undefined)
        .map(service => ({
          name: service.name || '',
          price: service.price || 0,
          duration_minutes: service.duration_minutes || 0
        })) || []
    });
  });
});

/**
 * Get customer appointments with full details
 */
export const getCustomerAppointmentsWithDetails = cache(async () => {
  const session = await verifySession();
  if (!session) return { upcoming: [], past: [] };
  
  const supabase = await createClient();
  const now = new Date().toISOString();
  
  // Fetch upcoming appointments
  const { data: upcomingData } = await supabase
    .from('appointments')
    .select(`
      *,
      staff_profiles(profiles(full_name, avatar_url)),
      customers(first_name, last_name, phone),
      salons(name, address),
      appointment_services(
        services(name, price, duration_minutes)
      )
    `)
    .eq('customer_id', session.user.id)
    .gte('start_time', now)
    .in('status', ['pending', 'confirmed'])
    .order('start_time', { ascending: true })
    .limit(20);
  
  // Fetch past appointments
  const { data: pastData } = await supabase
    .from('appointments')
    .select(`
      *,
      staff_profiles(profiles(full_name, avatar_url)),
      customers(first_name, last_name, phone),
      salons(name, address),
      appointment_services(
        services(name, price, duration_minutes)
      )
    `)
    .eq('customer_id', session.user.id)
    .lt('start_time', now)
    .in('status', ['completed', 'cancelled', 'no_show'])
    .order('start_time', { ascending: false })
    .limit(20);
  
  return {
    upcoming: (upcomingData || []).map(transformAppointment),
    past: (pastData || []).map(transformAppointment)
  };
});