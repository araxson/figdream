import { createClient } from "@/lib/supabase/server";
import type { timeoffData } from "./time-off-types";

export async function createtimeoff(data: Partial<timeoffData>) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Placeholder implementation
  return { ...data, id: crypto.randomUUID() } as timeoffData;
}

export async function updatetimeoff(id: string, data: Partial<timeoffData>) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Placeholder implementation
  return { ...data, id } as timeoffData;
}

export async function deletetimeoff(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Placeholder implementation
  return;
}
