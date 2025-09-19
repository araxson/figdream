import { createClient } from "@/lib/supabase/server";
import type { referralsData } from "./referrals-types";

export async function createreferrals(data: Partial<referralsData>) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Placeholder implementation
  return { ...data, id: crypto.randomUUID() } as referralsData;
}

export async function updatereferrals(
  id: string,
  data: Partial<referralsData>,
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Placeholder implementation
  return { ...data, id } as referralsData;
}

export async function deletereferrals(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Placeholder implementation
  return;
}
