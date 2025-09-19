import { useQuery } from "@tanstack/react-query";
import { getLocationss, getLocationsById } from "../dal/locations-queries";
import type { LocationsFilter } from "../dal/locations-types";

export function useLocationsList(filter: LocationsFilter = {}) {
  return useQuery({
    queryKey: ["locations", filter],
    queryFn: () => getLocationss(filter),
  });
}

export function useLocation(id: string) {
  return useQuery({
    queryKey: ["locations", id],
    queryFn: () => getLocationsById(id),
    enabled: !!id,
  });
}
