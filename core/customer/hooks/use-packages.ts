import { useQuery } from "@tanstack/react-query";
import { getPackagess, getPackagesById } from "../dal/packages-queries";
import type { PackagesFilter } from "../dal/packages-types";

export function usePackagesList(filter: PackagesFilter = {}) {
  return useQuery({
    queryKey: ["packages", filter],
    queryFn: () => getPackagess(filter),
  });
}

export function usePackage(id: string) {
  return useQuery({
    queryKey: ["packages", id],
    queryFn: () => getPackagesById(id),
    enabled: !!id,
  });
}
