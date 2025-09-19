import { useQuery } from "@tanstack/react-query";
import { getCampaignss, getCampaignsById } from "../dal/campaigns-queries";
import type { CampaignsFilter } from "../dal/campaigns-types";

export function useCampaignsList(filter: CampaignsFilter = {}) {
  return useQuery({
    queryKey: ["campaigns", filter],
    queryFn: () => getCampaignss(filter),
  });
}

export function useCampaign(id: string) {
  return useQuery({
    queryKey: ["campaigns", id],
    queryFn: () => getCampaignsById(id),
    enabled: !!id,
  });
}
