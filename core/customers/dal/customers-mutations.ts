import { createClient } from "@/lib/supabase/server";
import type {
  CustomerProfileUpdate,
  CustomerPreferenceInsert,
  CustomerPreferenceUpdate,
  CustomerFavoriteInsert,
  CustomerNoteInsert,
  CustomerNoteUpdate,
  FavoriteType,
} from "./customers-types";

/**
 * Update customer profile
 */
export async function updateCustomerProfile(
  id: string,
  updates: CustomerProfileUpdate,
) {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("profiles")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Create or update customer preferences
 */
export async function upsertCustomerPreferences(
  customerId: string,
  preferences: Omit<CustomerPreferenceInsert, "customer_id">,
) {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // TODO: customer_preferences table needs to be added to database
  const data = {
    customer_id: customerId,
    ...preferences,
    id: crypto.randomUUID(),
    updated_at: new Date().toISOString(),
  };

  return data;
}

/**
 * Add favorite salon/service/staff
 */
export async function addCustomerFavorite(favorite: CustomerFavoriteInsert) {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // TODO: customer_favorites table needs to be added to database
  const data = {
    ...favorite,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  };

  return data;
}

/**
 * Remove favorite
 */
export async function removeCustomerFavorite(favoriteId: string) {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // TODO: customer_favorites table needs to be added to database
  return { success: true };
}

/**
 * Toggle favorite status
 */
export async function toggleFavorite(
  customerId: string,
  targetId: string,
  type: FavoriteType,
) {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Check if favorite already exists
  const favoriteQuery = supabase
    .from("customer_favorites")
    .select("id")
    .eq("customer_id", customerId);

  // Add appropriate filter based on type
  if (type === "salon") {
    favoriteQuery.eq("salon_id", targetId).is("staff_id", null).is("service_id", null);
  } else if (type === "staff") {
    favoriteQuery.eq("staff_id", targetId).is("salon_id", null).is("service_id", null);
  } else if (type === "service") {
    favoriteQuery.eq("service_id", targetId).is("salon_id", null).is("staff_id", null);
  }

  const { data: existingFavorite, error: checkError } = await favoriteQuery.single();

  if (checkError && checkError.code !== "PGRST116") {
    throw new Error(`Failed to check existing favorite: ${checkError.message}`);
  }

  if (existingFavorite) {
    // Remove favorite
    const { error: deleteError } = await supabase
      .from("customer_favorites")
      .delete()
      .eq("id", existingFavorite.id || "");

    if (deleteError) {
      throw new Error(`Failed to remove favorite: ${deleteError.message}`);
    }

    return { success: true, action: "removed" };
  } else {
    // Add favorite
    const favoriteData: any = {
      customer_id: customerId,
      salon_id: null,
      staff_id: null,
      service_id: null,
    };

    if (type === "salon") {
      favoriteData.salon_id = targetId;
    } else if (type === "staff") {
      favoriteData.staff_id = targetId;
    } else if (type === "service") {
      favoriteData.service_id = targetId;
    }

    const { error: insertError } = await supabase
      .from("customer_favorites")
      .insert(favoriteData);

    if (insertError) {
      throw new Error(`Failed to add favorite: ${insertError.message}`);
    }

    return { success: true, action: "added" };
  }
}

/**
 * Clear all favorites of a specific type
 */
export async function clearFavoritesByType(
  customerId: string,
  type: FavoriteType,
) {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  let query = supabase
    .from("customer_favorites")
    .delete()
    .eq("customer_id", customerId);

  // Add appropriate filter based on type
  if (type === "salon") {
    query = query.not("salon_id", "is", null);
  } else if (type === "staff") {
    query = query.not("staff_id", "is", null);
  } else if (type === "service") {
    query = query.not("service_id", "is", null);
  }

  const { error } = await query;

  if (error) {
    throw new Error(`Failed to clear favorites: ${error.message}`);
  }

  return { success: true };
}

/**
 * Add customer note
 */
export async function addCustomerNote(note: CustomerNoteInsert) {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // TODO: customer_notes table needs to be added to database
  const data = {
    ...note,
    id: crypto.randomUUID(),
    created_by: user.id,
    created_at: new Date().toISOString(),
  };

  return data;
}

/**
 * Update customer note
 */
export async function updateCustomerNote(
  id: string,
  updates: CustomerNoteUpdate,
) {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // TODO: customer_notes table needs to be added to database
  const data = {
    id,
    ...updates,
    updated_at: new Date().toISOString(),
  };

  return data;
}

/**
 * Delete customer note
 */
export async function deleteCustomerNote(id: string) {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // TODO: customer_notes table needs to be added to database
  return { success: true };
}

/**
 * Add loyalty points
 */
export async function addLoyaltyPoints(
  customerId: string,
  points: number,
  description: string,
  referenceId?: string,
) {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // TODO: loyalty_points and loyalty_transactions tables need to be added to database
  const data = {
    id: crypto.randomUUID(),
    customer_id: customerId,
    type: points > 0 ? "earned" : "redeemed",
    points: Math.abs(points),
    balance_after: points,
    description,
    reference_id: referenceId,
    created_at: new Date().toISOString(),
  };

  return data;
}

/**
 * Redeem loyalty points
 */
export async function redeemLoyaltyPoints(
  customerId: string,
  points: number,
  description: string,
  referenceId?: string,
) {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // TODO: Check balance when loyalty_points table is available
  // For now, use negative points for redemption
  return addLoyaltyPoints(customerId, -points, description, referenceId);
}

/**
 * Mark customer as VIP
 */
export async function markCustomerAsVIP(customerId: string) {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("profiles")
    .update({
      is_vip: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", customerId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Remove VIP status
 */
export async function removeVIPStatus(customerId: string) {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("profiles")
    .update({
      is_vip: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", customerId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
