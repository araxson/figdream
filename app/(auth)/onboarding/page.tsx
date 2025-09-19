import { UserOnboardingFlow } from "@/core/users/components";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

/**
 * Ultra-thin page for user onboarding
 */
export default async function OnboardingPage() {
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <UserOnboardingFlow
      userId={user.id}
      initialStep={1}
    />
  );
}