import { useQuery } from "@tanstack/react-query";
import { getReferralss, getReferralsById } from "../dal/referrals-queries";
import type { ReferralsFilter } from "../dal/referrals-types";

export function useReferralsList(filter: ReferralsFilter = {}) {
  return useQuery({
    queryKey: ["referrals", filter],
    queryFn: () => getReferralss(filter),
  });
}

export function useReferral(id: string) {
  return useQuery({
    queryKey: ["referrals", id],
    queryFn: () => getReferralsById(id),
    enabled: !!id,
  });
}
