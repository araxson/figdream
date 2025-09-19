/**
 * Loyalty Program Page
 * Ultra-thin page that returns the loyalty program component
 */

import { LoyaltyProgramMain } from "@/core/loyalty/components";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function LoyaltyPage() {
  const supabase = await createClient();

  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // Get user's salon context from profiles table
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Check if user has salon access through user_roles
  const { data: userRoles } = await supabase
    .from("user_roles")
    .select("salon_id")
    .eq("user_id", user.id)
    .eq("is_active", true);

  // Get salon from first active role
  const salonId = userRoles?.[0]?.salon_id;

  if (!salonId) {
    redirect("/dashboard");
  }

  return <LoyaltyProgramMain salonId={salonId} />;
}