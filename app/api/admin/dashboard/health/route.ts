import { NextRequest, NextResponse } from "next/server";
import { getSystemHealthMetricsAction } from "@/core/admin/actions";
import { verifyAdminAuth } from "../../auth-check";

export async function GET(_request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminAuth();
    if ("error" in authResult) return authResult.error;
    const result = await getSystemHealthMetricsAction();

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Error in admin health metrics API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}