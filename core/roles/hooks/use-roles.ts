import { useQuery } from "@tanstack/react-query";
import { getRoless, getRolesById } from "../dal/roles-queries";
import type { RolesFilter } from "../dal/roles-types";

export function useRolesList(filter: RolesFilter = {}) {
  return useQuery({
    queryKey: ["roles", filter],
    queryFn: () => getRoless(filter),
  });
}

export function useRole(id: string) {
  return useQuery({
    queryKey: ["roles", id],
    queryFn: () => getRolesById(id),
    enabled: !!id,
  });
}
