/**
 * Salon Queries - Using actual database tables
 *
 * Queries from organization.salons table
 */

import { createClient } from "@/lib/supabase/server";
import type { Salon, SalonWithRelations, SalonFilters, SalonChain } from "./salons-types";

/**
 * Get public salons (PUBLIC ACCESS FOR BROWSING)
 * DOCUMENTED: Public access for anonymous salon browsing with limited data
 */
export async function getPublicSalons(
  filters: Partial<SalonFilters> = {}
): Promise<SalonWithRelations[]> {
  const supabase = await createClient();
  // NOTE: No auth check - public access for salon browsing

  let query = supabase
    .from("salons")
    .select("*")
    .eq("is_active", true) // Only show active salons publicly
    .order("created_at", { ascending: false });

  // Apply safe public filters
  if (filters.is_featured !== undefined) {
    query = query.eq("is_featured", filters.is_featured);
  }
  if (filters.is_verified !== undefined) {
    query = query.eq("is_verified", filters.is_verified);
  }
  if (filters.is_accepting_bookings !== undefined) {
    query = query.eq("is_accepting_bookings", filters.is_accepting_bookings);
  }
  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,business_name.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch public salons: ${error.message}`);
  }

  return (data || []) as SalonWithRelations[];
}

/**
 * Get salons with filters (AUTHENTICATED ACCESS)
 * Requires user authentication for detailed salon data
 */
export async function getSalons(
  filters: SalonFilters = {}
): Promise<SalonWithRelations[]> {
  const supabase = await createClient();

  // MANDATORY: Verify authentication for detailed salon access
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Unauthorized: Authentication required for salon data access');
  }

  let query = supabase
    .from("salons") // This queries the public view
    .select("*")
    .order("created_at", { ascending: false });

  if (filters.owner_id) {
    query = query.eq("owner_id", filters.owner_id);
  }

  if (filters.chain_id) {
    query = query.eq("chain_id", filters.chain_id);
  }

  if (filters.is_active !== undefined) {
    query = query.eq("is_active", filters.is_active);
  }

  if (filters.is_featured !== undefined) {
    query = query.eq("is_featured", filters.is_featured);
  }

  if (filters.is_verified !== undefined) {
    query = query.eq("is_verified", filters.is_verified);
  }

  if (filters.is_accepting_bookings !== undefined) {
    query = query.eq("is_accepting_bookings", filters.is_accepting_bookings);
  }

  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,business_name.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch salons: ${error.message}`);
  }

  return (data || []) as SalonWithRelations[];
}

/**
 * Get salon by ID (AUTHENTICATED ACCESS)
 * Requires user authentication for detailed salon data
 */
export async function getSalonById(
  id: string
): Promise<SalonWithRelations | null> {
  const supabase = await createClient();

  // MANDATORY: Verify authentication for detailed salon access
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Unauthorized: Authentication required for salon data access');
  }

  const { data, error } = await supabase
    .from("salons")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // Not found
    }
    throw new Error(`Failed to fetch salon: ${error.message}`);
  }

  return data as SalonWithRelations;
}

/**
 * Get salon by slug (PUBLIC ACCESS FOR BROWSING)
 * DOCUMENTED: Public access allowed for salon discovery and booking
 */
export async function getSalonBySlug(
  slug: string
): Promise<SalonWithRelations | null> {
  const supabase = await createClient();
  // NOTE: No auth check - public access for salon discovery and booking

  const { data, error } = await supabase
    .from("salons")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // Not found
    }
    throw new Error(`Failed to fetch salon: ${error.message}`);
  }

  return data as SalonWithRelations;
}

/**
 * Get featured salons (PUBLIC ACCESS FOR BROWSING)
 * DOCUMENTED: Public access for anonymous salon discovery
 */
export async function getFeaturedSalons(
  limit = 10
): Promise<SalonWithRelations[]> {
  const supabase = await createClient();
  // NOTE: No auth check - public access for salon discovery

  const { data, error } = await supabase
    .from("salons")
    .select("*")
    .eq("is_featured", true)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch featured salons: ${error.message}`);
  }

  return (data || []) as SalonWithRelations[];
}

/**
 * Get salons by chain (AUTHENTICATED ACCESS)
 * Requires authentication for chain management data
 */
export async function getSalonsByChain(
  chainId: string
): Promise<Salon[]> {
  const supabase = await createClient();

  // MANDATORY: Verify authentication for chain management data
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Unauthorized: Authentication required for chain data access');
  }

  const { data, error } = await supabase
    .from("salons")
    .select("*")
    .eq("chain_id", chainId)
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch salons by chain: ${error.message}`);
  }

  return (data || []) as Salon[];
}

/**
 * Search salons (PUBLIC ACCESS FOR BROWSING)
 * DOCUMENTED: Public access for salon search and discovery
 */
export async function searchSalons(
  searchTerm: string,
  filters: Omit<SalonFilters, "search"> = {}
): Promise<SalonWithRelations[]> {
  const supabase = await createClient();
  // NOTE: No auth check - public access for salon search

  let query = supabase
    .from("salons")
    .select("*")
    .eq("is_active", true) // Only show active salons in public search
    .order("created_at", { ascending: false });

  // Apply search term
  if (searchTerm) {
    query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,business_name.ilike.%${searchTerm}%`);
  }

  // Apply additional filters
  if (filters.chain_id) {
    query = query.eq("chain_id", filters.chain_id);
  }
  if (filters.is_featured !== undefined) {
    query = query.eq("is_featured", filters.is_featured);
  }
  if (filters.is_verified !== undefined) {
    query = query.eq("is_verified", filters.is_verified);
  }
  if (filters.is_accepting_bookings !== undefined) {
    query = query.eq("is_accepting_bookings", filters.is_accepting_bookings);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to search salons: ${error.message}`);
  }

  return (data || []) as SalonWithRelations[];
}

/**
 * Get salon chains
 */
export async function getSalonChains(): Promise<SalonChain[]> {
  // NOTE: salon_chains table is not available in current database schema
  // This functionality is temporarily disabled until the table is created
  console.warn("Salon chains query is not yet implemented - salon_chains table not available");
  return [];
}

/**
 * Get salon chain by ID
 */
export async function getSalonChainById(
  id: string
): Promise<SalonChain | null> {
  // NOTE: salon_chains table is in organization schema, not accessible via public views
  // This functionality is temporarily disabled until a public view is created
  console.warn("Salon chain by ID query is not yet implemented - salon_chains view not available");
  return null;
}

/**
 * Get salon metrics (AUTHENTICATED ACCESS)
 */
export async function getSalonMetrics(
  salonId: string
): Promise<any> {
  const supabase = await createClient();

  // MANDATORY: Verify authentication for metrics access
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Unauthorized: Authentication required for metrics access');
  }

  // Get today's metrics
  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [appointmentsLast30, revenueData, appointments] = await Promise.all([
    // Appointments for last 30 days (replacing daily_metrics)
    supabase
      .from('appointments')
      .select('created_at, status, total_amount')
      .eq('salon_id', salonId)
      .gte('created_at', thirtyDaysAgo)
      .order('created_at', { ascending: false }),

    // Revenue data for current month (replacing monthly_metrics)
    supabase
      .from('revenue_analytics')
      .select('total_revenue, appointment_count')
      .eq('salon_id', salonId)
      .gte('period_start', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
      .single(),

    // Today's appointments count
    supabase
      .from('appointments')
      .select('id, status')
      .eq('salon_id', salonId)
      .gte('appointment_date', today)
      .lt('appointment_date', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0])
  ]);

  return {
    daily: dailyMetrics.data || [],
    monthly: monthlyMetrics.data,
    todayAppointments: appointments.data?.length || 0,
    todayConfirmed: appointments.data?.filter(a => a.status === 'confirmed').length || 0
  };
}

/**
 * Get salon staff (PUBLIC ACCESS for booking)
 */
export async function getSalonStaff(
  salonId: string
): Promise<any[]> {
  const supabase = await createClient();
  // NOTE: No auth check - public access for staff listing during booking

  const { data, error } = await supabase
    .from('staff_profiles')
    .select('id, user_id, title, bio, specializations, profile_image_url, rating_average, is_bookable')
    .eq('salon_id', salonId)
    .eq('is_active', true)
    .order('title', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch salon staff: ${error.message}`);
  }

  return data || [];
}

/**
 * Get salon services (PUBLIC ACCESS for booking)
 */
export async function getSalonServices(
  salonId: string
): Promise<any[]> {
  const supabase = await createClient();
  // NOTE: No auth check - public access for service listing during booking

  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('salon_id', salonId)
    .eq('is_active', true)
    .eq('is_bookable', true)
    .order('name', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch salon services: ${error.message}`);
  }

  return data || [];
}

/**
 * Get salon revenue analytics (AUTHENTICATED ACCESS)
 */
export async function getSalonRevenue(
  salonId: string,
  startDate?: string,
  endDate?: string
): Promise<any> {
  const supabase = await createClient();

  // MANDATORY: Verify authentication for revenue data
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Unauthorized: Authentication required for revenue access');
  }

  const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const end = endDate || new Date().toISOString();

  const { data, error } = await supabase
    .from('billing')
    .select('amount, created_at, payment_status')
    .eq('salon_id', salonId)
    .eq('payment_status', 'paid')
    .gte('created_at', start)
    .lte('created_at', end)
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('Failed to fetch revenue data:', error.message);
    return { total: 0, transactions: [] };
  }

  const total = data?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

  return {
    total,
    transactions: data || [],
    count: data?.length || 0
  };
}

/**
 * Get salon customer analytics (AUTHENTICATED ACCESS)
 */
export async function getSalonCustomerAnalytics(
  salonId: string
): Promise<any> {
  const supabase = await createClient();

  // MANDATORY: Verify authentication for analytics access
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Unauthorized: Authentication required for analytics access');
  }

  // Get customer appointment counts to replace customer_analytics
  const { data: appointmentData, error: aptError } = await supabase
    .from('appointments')
    .select('customer_id')
    .eq('salon_id', salonId);

  if (aptError) {
    console.warn('Failed to fetch customer data:', aptError.message);
    return [];
  }

  // Count appointments per customer
  const customerCounts = new Map<string, number>();
  appointmentData?.forEach(apt => {
    if (apt.customer_id) {
      customerCounts.set(apt.customer_id, (customerCounts.get(apt.customer_id) || 0) + 1);
    }
  });

  // Get customer profiles for the top visitors
  const topCustomerIds = Array.from(customerCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 100)
    .map(([id]) => id);

  const { data: profiles, error } = await supabase
    .from('customer_profiles')
    .select('*')
    .in('id', topCustomerIds);

  const data = profiles?.map(profile => ({
    ...profile,
    total_visits: customerCounts.get(profile.id) || 0
  }));

  data?.sort((a, b) => b.total_visits - a.total_visits);

  if (error) {
    console.warn('Failed to fetch customer analytics:', error.message);
    return [];
  }

  return data || [];
}