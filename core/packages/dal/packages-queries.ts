import { createClient } from "@/lib/supabase/server";
import type { PackagesFilter, packagesResponse } from "./packages-types";

export async function getPackagess(
  filter: PackagesFilter = {},
): Promise<packagesResponse> {
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

export async function getPackagesById(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Placeholder implementation
  return null;
}
