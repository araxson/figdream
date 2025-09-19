import { useQuery } from "@tanstack/react-query";
import {
  getFavorites,
  getFavoriteById,
  checkIsFavorite,
} from "../dal/favorites-queries";
import type { FavoritesFilter } from "../dal/favorites-types";

export function useFavorites(filter: FavoritesFilter = {}) {
  return useQuery({
    queryKey: ["favorites", filter],
    queryFn: () => getFavorites(filter),
  });
}

export function useFavorite(id: string) {
  return useQuery({
    queryKey: ["favorites", id],
    queryFn: () => getFavoriteById(id),
    enabled: !!id,
  });
}

export function useIsFavorite(params: {
  customerId: string;
  salonId?: string;
  staffId?: string;
  serviceId?: string;
}) {
  return useQuery({
    queryKey: ["favorites", "check", params],
    queryFn: () => checkIsFavorite(params),
    enabled:
      !!params.customerId &&
      !!(params.salonId || params.staffId || params.serviceId),
  });
}
