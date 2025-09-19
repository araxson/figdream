import { createClient } from "@/lib/supabase/server";
import type { packagesData } from "./packages-types";

export async function createpackages(data: Partial<packagesData>) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Placeholder implementation
  return { ...data, id: crypto.randomUUID() } as packagesData;
}

export async function updatepackages(id: string, data: Partial<packagesData>) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Placeholder implementation
  return { ...data, id } as packagesData;
}

export async function deletepackages(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Placeholder implementation
  return;
}
