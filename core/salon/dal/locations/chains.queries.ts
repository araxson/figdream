import { createClient } from "@/lib/supabase/server";
import type {
  SalonChainsFilter,
  salonchainsResponse,
} from "./salon-chains-types";

export async function getSalonChainss(
  filter: SalonChainsFilter = {},
): Promise<salonchainsResponse> {
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

export async function getSalonChainsById(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Placeholder implementation
  return null;
}
