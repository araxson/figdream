import { createClient } from "@/lib/supabase/server";
import type { ReferralsFilter, referralsResponse } from "./referrals-types";

export async function getReferralss(
  filter: ReferralsFilter = {},
): Promise<referralsResponse> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Placeholder implementation
  return {
    data: [],
    total: 0,
    page: filter.page || 1,
    pageSize: filter.pageSize || 50,
  };
}

export async function getReferralsById(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Placeholder implementation
  return null;
}
