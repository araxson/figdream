import { createClient } from "@/lib/supabase/server";
import type {
  FavoritesFilter,
  FavoriteWithDetails,
  FavoritesResponse,
} from "./favorites-types";

export async function getFavorites(
  filter: FavoritesFilter = {},
): Promise<FavoritesResponse> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  let query = supabase.from("customer_favorites").select(`
      *,
      salon:salons(*),
      staff:staff_profiles(*),
      service:services(*),
      customer:profiles(*)
    `);

  if (filter.customerId) {
    query = query.eq("customer_id", filter.customerId);
  }
  if (filter.salonId) {
    query = query.eq("salon_id", filter.salonId);
  }
  if (filter.staffId) {
    query = query.eq("staff_id", filter.staffId);
  }
  if (filter.serviceId) {
    query = query.eq("service_id", filter.serviceId);
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .returns<FavoriteWithDetails[]>();

  if (error) throw error;

  return {
    favorites: data || [],
    total: count || 0,
    page: 1,
    pageSize: 50,
  };
}

export async function getFavoriteById(
  id: string,
): Promise<FavoriteWithDetails | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("customer_favorites")
    .select(
      `
      *,
      salon:salons(*),
      staff:staff_profiles(*),
      service:services(*),
      customer:profiles(*)
    `,
    )
    .eq("id", id)
    .single<FavoriteWithDetails>();

  if (error && error.code !== "PGRST116") throw error;
  return data;
}

export async function checkIsFavorite(params: {
  customerId: string;
  salonId?: string;
  staffId?: string;
  serviceId?: string;
}): Promise<boolean> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  let query = supabase
    .from("customer_favorites")
    .select("id")
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

  const { data, error } = await query.single();

  if (error && error.code !== "PGRST116") throw error;
  return !!data;
}
