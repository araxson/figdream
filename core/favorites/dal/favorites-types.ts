import type { Database } from "@/types/database.types";

export type Favorite = Database["public"]["Tables"]["customer_favorites"]["Row"];
export type FavoriteInsert =
  Database["public"]["Tables"]["customer_favorites"]["Insert"];
export type FavoriteUpdate =
  Database["public"]["Tables"]["customer_favorites"]["Update"];

export interface FavoriteWithDetails extends Favorite {
  salon?: Database["public"]["Tables"]["salons"]["Row"];
  staff?: Database["public"]["Tables"]["staff_profiles"]["Row"];
  service?: Database["public"]["Tables"]["services"]["Row"];
  customer?: Database["public"]["Tables"]["profiles"]["Row"];
}

export interface FavoritesFilter {
  customerId?: string;
  salonId?: string;
  staffId?: string;
  serviceId?: string;
  type?: "salon" | "staff" | "service";
}

export interface FavoritesResponse {
  favorites: FavoriteWithDetails[];
  total: number;
  page: number;
  pageSize: number;
}
