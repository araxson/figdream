import { createClient } from "@/lib/supabase/server";
import type {
  FavoriteInsert,
  FavoriteUpdate,
  Favorite,
} from "./favorites-types";

export async function createFavorite(data: FavoriteInsert): Promise<Favorite> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: favorite, error } = await supabase
    .from("customer_favorites")
    .insert({
      ...data,
      customer_id: data.customer_id || user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return favorite;
}

export async function updateFavorite(
  id: string,
  data: FavoriteUpdate,
): Promise<Favorite> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: favorite, error } = await supabase
    .from("customer_favorites")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return favorite;
}

export async function deleteFavorite(id: string): Promise<void> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("customer_favorites")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function toggleFavorite(params: {
  customerId: string;
  salonId?: string;
  staffId?: string;
  serviceId?: string;
  notes?: string;
}): Promise<{ added: boolean; favorite?: Favorite }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Check if already favorited
  let query = supabase
    .from("customer_favorites")
    .select("*")
    .eq("customer_id", params.customerId);

  if (params.salonId) {
    query = query.eq("salon_id", params.salonId);
  }
  if (params.staffId) {
    query = query.eq("staff_id", params.staffId);
  }
  if (params.serviceId) {
    query = query.eq("service_id", params.serviceId);
  }

  const { data: existing } = await query.single();

  if (existing?.id) {
    // Remove favorite
    await deleteFavorite(existing.id);
    return { added: false };
  } else {
    // Add favorite
    const favorite = await createFavorite({
      customer_id: params.customerId,
      salon_id: params.salonId,
      staff_id: params.staffId,
      service_id: params.serviceId,
      notes: params.notes,
    });
    return { added: true, favorite };
  }
}
