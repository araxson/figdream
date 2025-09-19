import { NextRequest, NextResponse } from "next/server";
import { getPlatformSalonsAction } from "@/core/admin/actions";
import { verifyAdminAuth } from "../auth-check";

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminAuth();
    if ("error" in authResult) return authResult.error;
    const { searchParams } = new URL(request.url);

    const filters = {
      page: searchParams.get("page") ? parseInt(searchParams.get("page") || "1") : 1,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit") || "25") : 25,
      search: searchParams.get("search") || undefined,
      status: searchParams.get("status") || undefined,
      salon_tier: searchParams.get("salon_tier") || undefined,
      sort_by: searchParams.get("sort_by") || "created_at",
      sort_order: (searchParams.get("sort_order") as "asc" | "desc") || "desc",
    };

    const result = await getPlatformSalonsAction(filters);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Error in admin salons API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}