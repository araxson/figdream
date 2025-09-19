import type { Database } from "@/types/database.types";

export type Favorite = Database["public"]["Views"]["customer_favorites"]["Row"];
export type FavoriteInsert =
  Database["public"]["Views"]["customer_favorites"]["Insert"];
export type FavoriteUpdate =
  Database["public"]["Views"]["customer_favorites"]["Update"];

export interface FavoriteWithDetails extends Favorite {
  salon?: Database["public"]["Views"]["salons"]["Row"];
  staff?: Database["public"]["Views"]["staff_profiles"]["Row"];
  service?: Database["public"]["Views"]["services"]["Row"];
  customer?: Database["public"]["Views"]["profiles"]["Row"];
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
