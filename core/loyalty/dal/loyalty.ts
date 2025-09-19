/**
 * Loyalty DAL
 *
 * Data Access Layer for loyalty programs
 */

import { createClient } from "@/lib/supabase/server";
import type {
  LoyaltyProgram,
  CustomerLoyalty,
  LoyaltyTransaction,
  LoyaltyProgramInsert,
  LoyaltyProgramUpdate,
  CustomerLoyaltyUpdate,
  TransactionType,
  ReferenceType
} from "./loyalty-types";

/**
 * Get loyalty program for salon
 */
export async function getLoyaltyProgram(salonId: string): Promise<LoyaltyProgram | null> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("loyalty_programs")
    .select("*")
    .eq("salon_id", salonId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`Failed to fetch loyalty program: ${error.message}`);
  }

  if (!data) return null;

  return data as LoyaltyProgram;
}

/**
 * Create loyalty program
 */
export async function createLoyaltyProgram(program: LoyaltyProgramInsert): Promise<LoyaltyProgram> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Remove tier_based from program as it doesn't exist in LoyaltyProgramInsert
  const insertData = {
    salon_id: program.salon_id,
    name: program.name,
    description: program.description,
    is_active: program.is_active,
    points_per_dollar: program.points_per_dollar,
    type: 'points' // Default to points type
  };

  const { data, error } = await supabase
    .from("loyalty_programs")
    .insert(insertData)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create loyalty program: ${error.message}`);
  }

  if (!data) throw new Error('Failed to create loyalty program');

  return data as LoyaltyProgram;
}

/**
 * Update loyalty program
 */
export async function updateLoyaltyProgram(
  id: string,
  updates: LoyaltyProgramUpdate
): Promise<LoyaltyProgram> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Prepare update data, removing tier_based as it doesn't exist in DB
  const updateData: Record<string, unknown> = { ...updates };
  delete updateData.tier_based;
  if (updates.tier_based !== undefined) {
    updateData.type = updates.tier_based ? 'tiered' : 'points';
  }

  const { data, error } = await supabase
    .from("loyalty_programs")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update loyalty program: ${error.message}`);
  }

  if (!data) throw new Error('Failed to update loyalty program');

  const updatedProgram: LoyaltyProgram = {
    id: data.id as string,
    salon_id: data.salon_id as string | undefined,
    name: data.name as string,
    description: data.description as string | undefined,
    is_active: data.is_active as boolean,
    points_per_dollar: data.points_per_dollar as number,
    reward_threshold: 100,
    reward_value: 10,
    tier_based: data.type === 'tiered',
    created_at: data.created_at as string,
    updated_at: data.updated_at as string
  };

  return updatedProgram;
}

/**
 * Get customer loyalty for program
 */
export async function getCustomerLoyalty(
  customerId: string,
  programId: string
): Promise<CustomerLoyalty | null> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const { data: { user }, error: authError } = await supabase.auth.getUser();
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
    id: data.id ?? '',
    program_id: data.program_id ?? '',
    customer_id: data.customer_id ?? '',
    points_balance: data.points_balance ?? 0,
    lifetime_points: data.lifetime_points ?? 0,
    tier_id: data.tier_level ?? null,
    visits_count: data.visits_count ?? 0,
    enrolled_at: data.enrolled_at ?? new Date().toISOString(),
    last_visit_at: data.last_activity_at ?? null,
    created_at: data.created_at ?? new Date().toISOString(),
    updated_at: data.updated_at ?? new Date().toISOString()
  };
}

/**
 * Enroll customer in loyalty program
 */
export async function enrollCustomer(
  customerId: string,
  programId: string
): Promise<CustomerLoyalty> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("customer_loyalty")
    .insert({
      customer_id: customerId,
      program_id: programId,
      points_balance: 0,
      lifetime_points: 0,
      visits_count: 0,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to enroll customer: ${error.message}`);
  }

  if (!data) throw new Error('Failed to enroll customer');

  return {
    id: data.id || '',
    program_id: data.program_id || '',
    customer_id: data.customer_id || '',
    points_balance: data.points_balance || 0,
    lifetime_points: data.lifetime_points || 0,
    tier_id: data.tier_id || null,
    visits_count: data.visits_count || 0,
    enrolled_at: data.enrolled_at || new Date().toISOString(),
    last_visit_at: data.last_visit_at || null,
    created_at: data.created_at || new Date().toISOString(),
    updated_at: data.updated_at || new Date().toISOString()
  } as CustomerLoyalty;
}

/**
 * Update customer loyalty
 */
export async function updateCustomerLoyalty(
  id: string,
  updates: CustomerLoyaltyUpdate
): Promise<CustomerLoyalty> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("customer_loyalty")
    .update({
      ...updates,
      tier_level: updates.tier_id,
      last_activity_at: updates.last_visit_at
    })
    .eq("id", id)
    .select()
    .single() as unknown as { data: Record<string, unknown> | null, error: Error | null };

  if (error) {
    throw new Error(`Failed to update customer loyalty: ${error.message}`);
  }

  if (!data) throw new Error('Failed to update customer loyalty');

  return {
    id: data.id ?? '',
    program_id: data.program_id ?? '',
    customer_id: data.customer_id ?? '',
    points_balance: data.points_balance ?? 0,
    lifetime_points: data.lifetime_points ?? 0,
    tier_id: data.tier_level ?? null,
    visits_count: data.visits_count ?? 0,
    enrolled_at: data.enrolled_at ?? new Date().toISOString(),
    last_visit_at: data.last_activity_at ?? null,
    created_at: data.created_at ?? new Date().toISOString(),
    updated_at: data.updated_at ?? new Date().toISOString()
  };
}

/**
 * Award points to customer
 */
export async function awardPoints(
  customerLoyaltyId: string,
  points: number,
  description: string,
  appointmentId?: string
): Promise<LoyaltyTransaction> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Get current customer loyalty data
  const { data: customerLoyalty, error: loyaltyError } = await supabase
    .from("customer_loyalty")
    .select("points_balance, lifetime_points")
    .eq("id", customerLoyaltyId)
    .single() as unknown as { data: { points_balance?: number, lifetime_points?: number } | null, error: Error | null };

  if (loyaltyError) {
    throw new Error(`Failed to fetch customer loyalty: ${loyaltyError.message}`);
  }

  const newBalance = (customerLoyalty?.points_balance ?? 0) + points;
  const newLifetimePoints = (customerLoyalty?.lifetime_points ?? 0) + points;

  // Create transaction
  const { data: transaction, error: transactionError } = await supabase
    .from("loyalty_transactions")
    .insert({
      customer_loyalty_id: customerLoyaltyId,
      appointment_id: appointmentId,
      transaction_type: "earned",
      points_amount: points,
      description,
      balance_after: newBalance,
    })
    .select()
    .single() as unknown as { data: Record<string, unknown> | null, error: Error | null };

  if (transactionError) {
    throw new Error(`Failed to create loyalty transaction: ${transactionError.message}`);
  }

  // Update customer loyalty balance
  const { error: updateError } = await supabase
    .from("customer_loyalty")
    .update({
      points_balance: newBalance,
      lifetime_points: newLifetimePoints,
      last_activity_at: new Date().toISOString(),
    })
    .eq("id", customerLoyaltyId) as unknown as { error: Error | null };

  if (updateError) {
    throw new Error(`Failed to update customer loyalty balance: ${updateError.message}`);
  }

  if (!transaction) throw new Error('Failed to create loyalty transaction');

  return {
    id: transaction.id ?? '',
    customer_loyalty_id: transaction.customer_loyalty_id ?? '',
    appointment_id: transaction.appointment_id ?? null,
    transaction_type: transaction.transaction_type as TransactionType,
    points_amount: transaction.points_amount ?? 0,
    description: transaction.description ?? undefined,
    reference_id: transaction.reference_id ?? null,
    reference_type: transaction.reference_type as ReferenceType | null,
    balance_after: transaction.balance_after ?? 0,
    expires_at: transaction.expires_at ?? null,
    created_at: transaction.created_at ?? new Date().toISOString()
  };
}

/**
 * Redeem points
 */
export async function redeemPoints(
  customerLoyaltyId: string,
  points: number,
  description: string
): Promise<LoyaltyTransaction> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Get current customer loyalty data
  const { data: customerLoyalty, error: loyaltyError } = await supabase
    .from("customer_loyalty")
    .select("points_balance")
    .eq("id", customerLoyaltyId)
    .single() as unknown as { data: { points_balance?: number } | null, error: Error | null };

  if (loyaltyError) {
    throw new Error(`Failed to fetch customer loyalty: ${loyaltyError.message}`);
  }

  if ((customerLoyalty?.points_balance ?? 0) < points) {
    throw new Error("Insufficient points balance");
  }

  const newBalance = (customerLoyalty?.points_balance ?? 0) - points;

  // Create transaction
  const { data: transaction, error: transactionError } = await supabase
    .from("loyalty_transactions")
    .insert({
      customer_loyalty_id: customerLoyaltyId,
      transaction_type: "redeemed",
      points_amount: -points, // Negative for redemption
      description,
      balance_after: newBalance,
    })
    .select()
    .single() as unknown as { data: Record<string, unknown> | null, error: Error | null };

  if (transactionError) {
    throw new Error(`Failed to create loyalty transaction: ${transactionError.message}`);
  }

  // Update customer loyalty balance
  const { error: updateError } = await supabase
    .from("customer_loyalty")
    .update({
      points_balance: newBalance,
      last_activity_at: new Date().toISOString(),
    })
    .eq("id", customerLoyaltyId) as unknown as { error: Error | null };

  if (updateError) {
    throw new Error(`Failed to update customer loyalty balance: ${updateError.message}`);
  }

  if (!transaction) throw new Error('Failed to create loyalty transaction');

  return {
    id: transaction.id ?? '',
    customer_loyalty_id: transaction.customer_loyalty_id ?? '',
    appointment_id: transaction.appointment_id ?? null,
    transaction_type: transaction.transaction_type as TransactionType,
    points_amount: transaction.points_amount ?? 0,
    description: transaction.description ?? undefined,
    reference_id: transaction.reference_id ?? null,
    reference_type: transaction.reference_type as ReferenceType | null,
    balance_after: transaction.balance_after ?? 0,
    expires_at: transaction.expires_at ?? null,
    created_at: transaction.created_at ?? new Date().toISOString()
  };
}

/**
 * Get loyalty transactions
 */
export async function getLoyaltyTransactions(
  customerLoyaltyId: string,
  limit = 50
): Promise<LoyaltyTransaction[]> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("loyalty_transactions")
    .select("*")
    .eq("customer_loyalty_id", customerLoyaltyId)
    .order("created_at", { ascending: false })
    .limit(limit) as unknown as { data: Record<string, unknown>[] | null, error: Error | null };

  if (error) {
    throw new Error(`Failed to fetch loyalty transactions: ${error.message}`);
  }

  return (data || []).map((transaction: Record<string, unknown>) => ({
    id: transaction.id ?? '',
    customer_loyalty_id: transaction.customer_loyalty_id ?? '',
    appointment_id: transaction.appointment_id ?? null,
    transaction_type: transaction.transaction_type as TransactionType,
    points_amount: transaction.points_amount ?? 0,
    description: transaction.description ?? undefined,
    reference_id: transaction.reference_id ?? null,
    reference_type: transaction.reference_type as ReferenceType | null,
    balance_after: transaction.balance_after ?? 0,
    expires_at: transaction.expires_at ?? null,
    created_at: transaction.created_at ?? new Date().toISOString()
  }));
}