import { createClient } from "@/lib/supabase/server";
import type {
  SubscriptionsFilter,
  subscriptionsResponse,
} from "./subscriptions-types";

export async function getSubscriptionss(
  filter: SubscriptionsFilter = {},
): Promise<subscriptionsResponse> {
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

export async function getSubscriptionsById(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Placeholder implementation
  return null;
}
