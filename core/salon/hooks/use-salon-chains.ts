import { useQuery } from "@tanstack/react-query";
import {
  getSalonChainss,
  getSalonChainsById,
} from "../dal/salon-chains-queries";
import type { SalonChainsFilter } from "../dal/salon-chains-types";

export function useSalonChainsList(filter: SalonChainsFilter = {}) {
  return useQuery({
    queryKey: ["salon-chains", filter],
    queryFn: () => getSalonChainss(filter),
  });
}

export function useSalonChain(id: string) {
  return useQuery({
    queryKey: ["salon-chains", id],
    queryFn: () => getSalonChainsById(id),
    enabled: !!id,
  });
}
