import { createClient } from "@/lib/supabase/server";
import type { LocationsFilter, locationsResponse } from "./locations-types";

export async function getLocationss(
  filter: LocationsFilter = {},
): Promise<locationsResponse> {
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

export async function getLocationsById(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Placeholder implementation
  return null;
}
