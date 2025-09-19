import { createClient } from "@/lib/supabase/server";
import type { subscriptionsData } from "./subscriptions-types";

export async function createsubscriptions(data: Partial<subscriptionsData>) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Placeholder implementation
  return { ...data, id: crypto.randomUUID() } as subscriptionsData;
}

export async function updatesubscriptions(
  id: string,
  data: Partial<subscriptionsData>,
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Placeholder implementation
  return { ...data, id } as subscriptionsData;
}

export async function deletesubscriptions(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Placeholder implementation
  return;
}
