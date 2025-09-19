import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Verify admin authentication for API routes
 * Returns user if authenticated as admin, otherwise returns error response
 */
export async function verifyAdminAuth() {
  const supabase = await createClient();

  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      error: NextResponse.json(
        { error: "Unauthorized: Authentication required" },
        { status: 401 }
      )
    };
  }

  // Check if user has admin role
  const { data: roleData, error: roleError } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (roleError || !roleData) {
    return {
      error: NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      )
    };
  }

  // Only super_admin and salon_owner (admin) roles allowed
  if (roleData.role !== "super_admin" && roleData.role !== "salon_owner") {
    return {
      error: NextResponse.json(
        { error: "Forbidden: Insufficient permissions" },
        { status: 403 }
      )
    };
  }

  return { user, role: roleData.role };
}