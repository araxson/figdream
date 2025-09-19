/**
 * Loyalty Mutations DAL
 * Security-first data access layer for loyalty program write operations
 */

import { createClient } from "@/lib/supabase/server";
import type {
  LoyaltyProgram,
  CustomerLoyalty,
  LoyaltyTransaction,
  LoyaltyProgramInsert,
  LoyaltyProgramUpdate,
  CustomerLoyaltyInsert,
  CustomerLoyaltyUpdate,
  LoyaltyTransactionInsert
} from "./loyalty-types";

/**
 * Create a new loyalty program with auth check
 */
export async function createLoyaltyProgram(
  data: LoyaltyProgramInsert
): Promise<LoyaltyProgram> {
  const supabase = await createClient();

  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Check user has permission for this salon
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("salon_id, role")
    .eq("user_id", user.id)
    .single();

  if (!profile || profile.salon_id !== data.salon_id) {
    throw new Error("You don't have permission to create a loyalty program for this salon");
  }

  const { data: program, error } = await supabase
    .from("loyalty_programs")
    .insert(data)
    .select()
    .single();

  if (error) throw new Error(`Failed to create loyalty program: ${error.message}`);

  return program as unknown as LoyaltyProgram;
}

/**
 * Update loyalty program with auth check
 */
export async function updateLoyaltyProgram(
  id: string,
  data: LoyaltyProgramUpdate
): Promise<LoyaltyProgram> {
  const supabase = await createClient();

  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Check user has permission
  const { data: existing } = await supabase
    .from("loyalty_programs")
    .select("salon_id")
    .eq("id", id)
    .single();

  if (!existing) throw new Error("Loyalty program not found");

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("salon_id, role")
    .eq("user_id", user.id)
    .single();

  if (!profile || profile.salon_id !== existing.salon_id) {
    throw new Error("You don't have permission to update this loyalty program");
  }

  const { data: program, error } = await supabase
    .from("loyalty_programs")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update loyalty program: ${error.message}`);

  return program as unknown as LoyaltyProgram;
}

/**
 * Delete loyalty program with auth check
 */
export async function deleteLoyaltyProgram(id: string): Promise<void> {
  const supabase = await createClient();

  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Check user has permission
  const { data: existing } = await supabase
    .from("loyalty_programs")
    .select("salon_id")
    .eq("id", id)
    .single();

  if (!existing) throw new Error("Loyalty program not found");

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("salon_id, role")
    .eq("user_id", user.id)
    .single();

  if (!profile || profile.salon_id !== existing.salon_id) {
    throw new Error("You don't have permission to delete this loyalty program");
  }

  const { error } = await supabase
    .from("loyalty_programs")
    .delete()
    .eq("id", id);

  if (error) throw new Error(`Failed to delete loyalty program: ${error.message}`);
}

/**
 * Enroll customer in loyalty program
 */
export async function enrollCustomer(
  data: CustomerLoyaltyInsert
): Promise<CustomerLoyalty> {
  const supabase = await createClient();

  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Check if already enrolled
  const { data: existing } = await supabase
    .from("customer_loyalty")
    .select("id")
    .eq("customer_id", data.customer_id)
    .eq("program_id", data.program_id)
    .single();

  if (existing) throw new Error("Customer is already enrolled in this program");

  const { data: enrollment, error } = await supabase
    .from("customer_loyalty")
    .insert({
      ...data,
      points_balance: 0,
      lifetime_points: 0,
      visits_count: 0,
      enrolled_at: new Date().toISOString(),
      metadata: {}
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to enroll customer: ${error.message}`);

  return enrollment as unknown as CustomerLoyalty;
}

/**
 * Unenroll customer from loyalty program
 */
export async function unenrollCustomer(
  customerLoyaltyId: string
): Promise<void> {
  const supabase = await createClient();

  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("customer_loyalty")
    .delete()
    .eq("id", customerLoyaltyId);

  if (error) throw new Error(`Failed to unenroll customer: ${error.message}`);
}

/**
 * Update customer loyalty details
 */
export async function updateCustomerLoyalty(
  id: string,
  data: CustomerLoyaltyUpdate
): Promise<CustomerLoyalty> {
  const supabase = await createClient();

  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: loyalty, error } = await supabase
    .from("customer_loyalty")
    .update({
      ...data,
      updated_at: new Date().toISOString()
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update customer loyalty: ${error.message}`);

  return loyalty as unknown as CustomerLoyalty;
}

/**
 * Add loyalty transaction (earn or redeem points)
 */
export async function addLoyaltyTransaction(
  data: LoyaltyTransactionInsert
): Promise<LoyaltyTransaction> {
  const supabase = await createClient();

  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Get current loyalty info
  const { data: loyalty } = await supabase
    .from("customer_loyalty")
    .select("points_balance, lifetime_points, visits_count")
    .eq("id", data.customer_loyalty_id)
    .single();

  if (!loyalty) throw new Error("Customer loyalty record not found");

  const currentBalance = loyalty.points_balance as number;
  const currentLifetime = loyalty.lifetime_points as number;
  const currentVisits = loyalty.visits_count as number;

  // Calculate new balance
  let newBalance = currentBalance;
  let newLifetime = currentLifetime;
  let newVisits = currentVisits;

  if (data.transaction_type === "earned") {
    newBalance += data.points_amount;
    newLifetime += data.points_amount;
    if (data.appointment_id) {
      newVisits += 1;
    }
  } else if (data.transaction_type === "redeemed") {
    if (currentBalance < data.points_amount) {
      throw new Error("Insufficient points balance");
    }
    newBalance -= data.points_amount;
  } else if (data.transaction_type === "expired") {
    newBalance = Math.max(0, currentBalance - data.points_amount);
  } else if (data.transaction_type === "adjusted") {
    newBalance = currentBalance + data.points_amount;
    if (data.points_amount > 0) {
      newLifetime += data.points_amount;
    }
  }

  // Create transaction
  const { data: transaction, error: txError } = await supabase
    .from("loyalty_transactions")
    .insert({
      ...data,
      balance_after: newBalance
    })
    .select()
    .single();

  if (txError) throw new Error(`Failed to create transaction: ${txError.message}`);

  // Update customer loyalty balance
  const { error: updateError } = await supabase
    .from("customer_loyalty")
    .update({
      points_balance: newBalance,
      lifetime_points: newLifetime,
      visits_count: newVisits,
      last_activity_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq("id", data.customer_loyalty_id);

  if (updateError) throw new Error(`Failed to update balance: ${updateError.message}`);

  return transaction as unknown as LoyaltyTransaction;
}

/**
 * Award points for appointment
 */
export async function awardPointsForAppointment(
  appointmentId: string,
  customerId: string,
  salonId: string,
  amount: number
): Promise<LoyaltyTransaction | null> {
  const supabase = await createClient();

  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Get loyalty program
  const { data: program } = await supabase
    .from("loyalty_programs")
    .select("id, points_per_dollar, points_per_visit, is_active")
    .eq("salon_id", salonId)
    .eq("is_active", true)
    .single();

  if (!program) return null;

  // Get customer loyalty enrollment
  const { data: enrollment } = await supabase
    .from("customer_loyalty")
    .select("id")
    .eq("customer_id", customerId)
    .eq("program_id", program.id)
    .single();

  if (!enrollment) return null;

  // Calculate points
  const pointsPerDollar = Number(program.points_per_dollar) || 0;
  const pointsPerVisit = program.points_per_visit as number || 0;
  const pointsFromAmount = Math.floor(amount * pointsPerDollar);
  const totalPoints = pointsFromAmount + pointsPerVisit;

  if (totalPoints <= 0) return null;

  // Create transaction
  return await addLoyaltyTransaction({
    customer_loyalty_id: enrollment.id as string,
    appointment_id: appointmentId,
    transaction_type: "earned",
    points_amount: totalPoints,
    description: `Earned ${totalPoints} points (${pointsFromAmount} from purchase, ${pointsPerVisit} from visit)`,
    reference_id: appointmentId,
    reference_type: "appointment"
  });
}

/**
 * Redeem loyalty points
 */
export async function redeemPoints(
  customerLoyaltyId: string,
  points: number,
  description: string,
  referenceId?: string,
  referenceType?: string
): Promise<LoyaltyTransaction> {
  const supabase = await createClient();

  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  return await addLoyaltyTransaction({
    customer_loyalty_id: customerLoyaltyId,
    transaction_type: "redeemed",
    points_amount: points,
    description,
    reference_id: referenceId,
    reference_type: referenceType
  });
}

/**
 * Adjust points manually
 */
export async function adjustPoints(
  customerLoyaltyId: string,
  points: number,
  description: string
): Promise<LoyaltyTransaction> {
  const supabase = await createClient();

  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  return await addLoyaltyTransaction({
    customer_loyalty_id: customerLoyaltyId,
    transaction_type: "adjusted",
    points_amount: points,
    description
  });
}

/**
 * Add points to customer loyalty account
 */
export async function addPoints(
  customerId: string,
  salonId: string,
  points: number,
  reason: string
): Promise<LoyaltyTransaction> {
  const supabase = await createClient();

  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Check permissions
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("salon_id, role")
    .eq("user_id", user.id)
    .single();

  if (!profile || (profile.salon_id !== salonId && profile.role !== 'admin')) {
    throw new Error("You don't have permission to add points");
  }

  // Create transaction
  const transaction: LoyaltyTransactionInsert = {
    salon_id: salonId,
    customer_id: customerId,
    type: 'earned',
    points,
    description: reason,
    created_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from("loyalty_transactions")
    .insert(transaction)
    .select()
    .single();

  if (error) throw new Error(`Failed to add points: ${error.message}`);

  // Update customer loyalty balance
  const { error: updateError } = await supabase
    .from("customer_loyalty")
    .update({
      points_balance: points,
      updated_at: new Date().toISOString()
    })
    .eq("customer_id", customerId)
    .eq("salon_id", salonId);

  if (updateError) throw new Error(`Failed to update balance: ${updateError.message}`);

  return data as unknown as LoyaltyTransaction;
}

/**
 * Create a new loyalty tier
 */
export async function createLoyaltyTier(
  salonId: string,
  data: {
    name: string;
    min_points: number;
    benefits: string[];
    discount_percentage?: number;
  }
): Promise<any> {
  const supabase = await createClient();

  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Check permissions - only salon owners can create tiers
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("salon_id, role")
    .eq("user_id", user.id)
    .single();

  if (!profile || profile.salon_id !== salonId || !['owner', 'admin'].includes(profile.role)) {
    throw new Error("Only salon owners can create loyalty tiers");
  }

  const { data: tier, error } = await supabase
    .from("loyalty_tiers")
    .insert({
      salon_id: salonId,
      ...data,
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create tier: ${error.message}`);

  return tier;
}

/**
 * Update a loyalty tier
 */
export async function updateLoyaltyTier(
  tierId: string,
  data: {
    name?: string;
    min_points?: number;
    benefits?: string[];
    discount_percentage?: number;
  }
): Promise<any> {
  const supabase = await createClient();

  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: tier, error } = await supabase
    .from("loyalty_tiers")
    .update({
      ...data,
      updated_at: new Date().toISOString()
    })
    .eq("id", tierId)
    .select()
    .single();

  if (error) throw new Error(`Failed to update tier: ${error.message}`);

  return tier;
}

/**
 * Delete a loyalty tier
 */
export async function deleteLoyaltyTier(tierId: string): Promise<void> {
  const supabase = await createClient();

  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("loyalty_tiers")
    .delete()
    .eq("id", tierId);

  if (error) throw new Error(`Failed to delete tier: ${error.message}`);
}