/**
 * Loyalty Queries DAL
 * Security-first data access layer for loyalty program read operations
 */

import { createClient } from "@/lib/supabase/server";
import type {
  LoyaltyProgram,
  CustomerLoyalty,
  LoyaltyTransaction,
  LoyaltyDashboard,
  LoyaltyTier
} from "./loyalty-types";

/**
 * Get loyalty program for salon with auth check
 */
export async function getLoyaltyProgram(salonId: string): Promise<LoyaltyProgram | null> {
  const supabase = await createClient();

  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("loyalty_programs")
    .select("*")
    .eq("salon_id", salonId)
    .single() as unknown as { data: Record<string, unknown> | null, error: Error | null };

  if (error) {
    if ((error as Record<string, unknown>).code === "PGRST116") return null;
    throw new Error(`Failed to fetch loyalty program: ${error.message}`);
  }

  if (!data) return null;

  return {
    id: data.id as string,
    salon_id: data.salon_id as string,
    name: data.name as string,
    description: data.description as string | undefined,
    type: data.type as string,
    points_per_dollar: Number(data.points_per_dollar) || 0,
    points_per_visit: data.points_per_visit as number | undefined,
    redemption_rate: Number(data.redemption_rate) || 0,
    tier_config: data.tier_config as Record<string, unknown> | undefined,
    benefits: data.benefits as unknown[],
    terms_conditions: data.terms_conditions as string | undefined,
    is_active: data.is_active as boolean,
    starts_at: data.starts_at as string | undefined,
    ends_at: data.ends_at as string | undefined,
    created_at: data.created_at as string,
    updated_at: data.updated_at as string
  };
}

/**
 * Get customer loyalty enrollment with auth check
 */
export async function getCustomerLoyalty(
  customerId: string,
  programId: string
): Promise<CustomerLoyalty | null> {
  const supabase = await createClient();

  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("customer_loyalty")
    .select("*")
    .eq("customer_id", customerId)
    .eq("program_id", programId)
    .single() as unknown as { data: Record<string, unknown> | null, error: Error | null };

  if (error) {
    if ((error as Record<string, unknown>).code === "PGRST116") return null;
    throw new Error(`Failed to fetch customer loyalty: ${error.message}`);
  }

  if (!data) return null;

  return {
    id: data.id as string,
    program_id: data.program_id as string,
    customer_id: data.customer_id as string,
    points_balance: data.points_balance as number,
    lifetime_points: data.lifetime_points as number,
    visits_count: data.visits_count as number,
    tier_level: data.tier_level as string | undefined,
    tier_achieved_at: data.tier_achieved_at as string | undefined,
    last_activity_at: data.last_activity_at as string | undefined,
    enrolled_at: data.enrolled_at as string,
    metadata: data.metadata as Record<string, unknown>,
    created_at: data.created_at as string,
    updated_at: data.updated_at as string
  };
}

/**
 * Get all customers enrolled in a loyalty program
 */
export async function getProgramMembers(
  programId: string,
  limit = 50,
  offset = 0
): Promise<{ members: CustomerLoyalty[], total: number }> {
  const supabase = await createClient();

  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Get total count
  const { count } = await supabase
    .from("customer_loyalty")
    .select("*", { count: "exact", head: true })
    .eq("program_id", programId);

  // Get paginated data
  const { data, error } = await supabase
    .from("customer_loyalty")
    .select(`
      *,
      customers:customer_id(
        id,
        email,
        first_name,
        last_name
      )
    `)
    .eq("program_id", programId)
    .order("lifetime_points", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw new Error(`Failed to fetch program members: ${error.message}`);

  const members = (data || []).map((item: Record<string, unknown>) => ({
    id: item.id as string,
    program_id: item.program_id as string,
    customer_id: item.customer_id as string,
    customer: item.customers as Record<string, unknown>,
    points_balance: item.points_balance as number,
    lifetime_points: item.lifetime_points as number,
    visits_count: item.visits_count as number,
    tier_level: item.tier_level as string | undefined,
    tier_achieved_at: item.tier_achieved_at as string | undefined,
    last_activity_at: item.last_activity_at as string | undefined,
    enrolled_at: item.enrolled_at as string,
    metadata: item.metadata as Record<string, unknown>,
    created_at: item.created_at as string,
    updated_at: item.updated_at as string
  }));

  return {
    members,
    total: count || 0
  };
}

/**
 * Get loyalty transactions for a customer
 */
export async function getCustomerTransactions(
  customerLoyaltyId: string,
  limit = 50,
  offset = 0
): Promise<{ transactions: LoyaltyTransaction[], total: number }> {
  const supabase = await createClient();

  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Get total count
  const { count } = await supabase
    .from("loyalty_transactions")
    .select("*", { count: "exact", head: true })
    .eq("customer_loyalty_id", customerLoyaltyId);

  // Get paginated data
  const { data, error } = await supabase
    .from("loyalty_transactions")
    .select("*")
    .eq("customer_loyalty_id", customerLoyaltyId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw new Error(`Failed to fetch transactions: ${error.message}`);

  const transactions = (data || []).map((item: Record<string, unknown>) => ({
    id: item.id as string,
    customer_loyalty_id: item.customer_loyalty_id as string,
    appointment_id: item.appointment_id as string | undefined,
    transaction_type: item.transaction_type as string,
    points_amount: item.points_amount as number,
    description: item.description as string,
    reference_id: item.reference_id as string | undefined,
    reference_type: item.reference_type as string | undefined,
    balance_after: item.balance_after as number,
    expires_at: item.expires_at as string | undefined,
    created_at: item.created_at as string
  }));

  return {
    transactions,
    total: count || 0
  };
}

/**
 * Get loyalty dashboard metrics
 */
export async function getLoyaltyDashboard(salonId: string): Promise<LoyaltyDashboard> {
  const supabase = await createClient();

  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Get program
  const program = await getLoyaltyProgram(salonId);
  if (!program) {
    return {
      program: null,
      metrics: {
        totalMembers: 0,
        activeMembers: 0,
        totalPointsIssued: 0,
        totalPointsRedeemed: 0,
        averagePointsBalance: 0,
        topMembers: []
      }
    };
  }

  // Get metrics
  const { data: metricsData, error: metricsError } = await supabase
    .from("customer_loyalty")
    .select("points_balance, lifetime_points")
    .eq("program_id", program.id);

  if (metricsError) throw new Error(`Failed to fetch metrics: ${metricsError.message}`);

  const metrics = metricsData || [];
  const totalMembers = metrics.length;
  const activeMembers = metrics.filter((m: Record<string, unknown>) =>
    (m.points_balance as number) > 0
  ).length;
  const totalPointsIssued = metrics.reduce((sum: number, m: Record<string, unknown>) =>
    sum + (m.lifetime_points as number), 0
  );
  const totalPointsBalance = metrics.reduce((sum: number, m: Record<string, unknown>) =>
    sum + (m.points_balance as number), 0
  );
  const totalPointsRedeemed = totalPointsIssued - totalPointsBalance;
  const averagePointsBalance = totalMembers > 0 ? totalPointsBalance / totalMembers : 0;

  // Get top members
  const { data: topMembersData } = await supabase
    .from("customer_loyalty")
    .select(`
      *,
      customers:customer_id(
        id,
        email,
        first_name,
        last_name
      )
    `)
    .eq("program_id", program.id)
    .order("lifetime_points", { ascending: false })
    .limit(5);

  const topMembers = (topMembersData || []).map((item: Record<string, unknown>) => ({
    id: item.id as string,
    customer: item.customers as Record<string, unknown>,
    lifetime_points: item.lifetime_points as number,
    points_balance: item.points_balance as number,
    tier_level: item.tier_level as string | undefined
  }));

  return {
    program,
    metrics: {
      totalMembers,
      activeMembers,
      totalPointsIssued,
      totalPointsRedeemed,
      averagePointsBalance,
      topMembers
    }
  };
}

/**
 * Search loyalty members
 */
export async function searchLoyaltyMembers(
  programId: string,
  searchTerm: string
): Promise<CustomerLoyalty[]> {
  const supabase = await createClient();

  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("customer_loyalty")
    .select(`
      *,
      customers:customer_id(
        id,
        email,
        first_name,
        last_name
      )
    `)
    .eq("program_id", programId)
    .or(`customer_id.ilike.%${searchTerm}%`)
    .limit(20);

  if (error) throw new Error(`Failed to search members: ${error.message}`);

  return (data || []).map((item: Record<string, unknown>) => ({
    id: item.id as string,
    program_id: item.program_id as string,
    customer_id: item.customer_id as string,
    customer: item.customers as Record<string, unknown>,
    points_balance: item.points_balance as number,
    lifetime_points: item.lifetime_points as number,
    visits_count: item.visits_count as number,
    tier_level: item.tier_level as string | undefined,
    tier_achieved_at: item.tier_achieved_at as string | undefined,
    last_activity_at: item.last_activity_at as string | undefined,
    enrolled_at: item.enrolled_at as string,
    metadata: item.metadata as Record<string, unknown>,
    created_at: item.created_at as string,
    updated_at: item.updated_at as string
  }));
}

/**
 * Get customer loyalty accounts
 */
export async function getCustomerLoyalties(
  customerId: string
): Promise<CustomerLoyalty[]> {
  const supabase = await createClient();

  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Check if user has permission to view this customer's data
  if (user.id !== customerId) {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (!profile || !['admin', 'owner', 'staff'].includes((profile as any).role)) {
      throw new Error("You don't have permission to view this customer's loyalty data");
    }
  }

  const { data, error } = await supabase
    .from("customer_loyalty")
    .select(`
      *,
      loyalty_programs!inner(
        id,
        name,
        points_per_dollar,
        is_active
      )
    `)
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to fetch customer loyalties: ${error.message}`);

  return (data || []).map((item: any) => ({
    id: item.id,
    program_id: item.program_id,
    customer_id: item.customer_id,
    salon_id: item.salon_id,
    points_balance: item.points_balance || 0,
    lifetime_points: item.lifetime_points || 0,
    visits_count: item.visits_count || 0,
    tier_level: item.tier_level,
    enrolled_at: item.enrolled_at,
    created_at: item.created_at,
    updated_at: item.updated_at
  })) as CustomerLoyalty[];
}

/**
 * Get loyalty transactions for a customer
 */
export async function getLoyaltyTransactions(
  customerId: string,
  salonId?: string
): Promise<LoyaltyTransaction[]> {
  const supabase = await createClient();

  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Check permissions
  if (user.id !== customerId) {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role, salon_id")
      .eq("user_id", user.id)
      .single();

    if (!profile || !['admin', 'owner', 'staff'].includes((profile as any).role)) {
      throw new Error("You don't have permission to view these transactions");
    }

    // If staff, can only view transactions for their salon
    if ((profile as any).role === 'staff' && salonId && (profile as any).salon_id !== salonId) {
      throw new Error("You can only view transactions for your salon");
    }
  }

  let query = supabase
    .from("loyalty_transactions")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (salonId) {
    query = query.eq("salon_id", salonId);
  }

  const { data, error } = await query;

  if (error) throw new Error(`Failed to fetch transactions: ${error.message}`);

  return (data || []).map((item: any) => ({
    id: item.id,
    customer_loyalty_id: item.customer_loyalty_id,
    customer_id: item.customer_id,
    salon_id: item.salon_id,
    transaction_type: item.transaction_type,
    points_amount: item.points_amount,
    description: item.description,
    appointment_id: item.appointment_id,
    created_at: item.created_at
  })) as LoyaltyTransaction[];
}

/**
 * Get loyalty statistics
 */
export async function getLoyaltyStatistics(
  salonId: string
): Promise<{
  total_members: number;
  total_points_earned: number;
  total_points_redeemed: number;
  active_programs: number;
}> {
  const supabase = await createClient();

  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Check permissions - must be salon owner or staff
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("salon_id, role")
    .eq("user_id", user.id)
    .single();

  if (!profile || ((profile as any).salon_id !== salonId && (profile as any).role !== 'admin')) {
    throw new Error("You don't have permission to view these statistics");
  }

  // Get total members
  const { count: totalMembers } = await supabase
    .from("customer_loyalty")
    .select("*", { count: 'exact' })
    .eq("salon_id", salonId);

  // Get total points earned
  const { data: earnedData } = await supabase
    .from("loyalty_transactions")
    .select("points_amount")
    .eq("salon_id", salonId)
    .eq("transaction_type", "earned");

  const totalEarned = earnedData?.reduce((sum, t) => sum + (t.points_amount || 0), 0) || 0;

  // Get total points redeemed
  const { data: redeemedData } = await supabase
    .from("loyalty_transactions")
    .select("points_amount")
    .eq("salon_id", salonId)
    .eq("transaction_type", "redeemed");

  const totalRedeemed = redeemedData?.reduce((sum, t) => sum + (t.points_amount || 0), 0) || 0;

  // Get active programs count
  const { count: activePrograms } = await supabase
    .from("loyalty_programs")
    .select("*", { count: 'exact' })
    .eq("salon_id", salonId)
    .eq("is_active", true);

  return {
    total_members: totalMembers || 0,
    total_points_earned: totalEarned,
    total_points_redeemed: totalRedeemed,
    active_programs: activePrograms || 0
  };
}

/**
 * Calculate points for a purchase
 */
export async function calculatePointsForPurchase(
  programId: string,
  purchaseAmount: number
): Promise<number> {
  const supabase = await createClient();

  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: program } = await supabase
    .from("loyalty_programs")
    .select("points_per_dollar, multiplier_events")
    .eq("id", programId)
    .single();

  if (!program) return 0;

  const basePoints = Math.floor(purchaseAmount * (program.points_per_dollar || 1));
  // Apply any multipliers if available
  return basePoints;
}

/**
 * Get available rewards for a customer
 */
export async function getCustomerRewards(
  customerLoyaltyId: string
): Promise<any[]> {
  const supabase = await createClient();

  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // For now, return an empty array as rewards table might not exist
  return [];
}

/**
 * Get loyalty tiers for a program
 */
export async function getLoyaltyTiers(programId: string): Promise<any[]> {
  const supabase = await createClient();

  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("loyalty_tiers")
    .select("*")
    .eq("program_id", programId)
    .order("min_points", { ascending: true });

  if (error) {
    console.warn(`Failed to fetch tiers: ${error.message}`);
    return [];
  }

  return data || [];
}