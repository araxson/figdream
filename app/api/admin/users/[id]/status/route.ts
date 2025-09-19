import { NextRequest, NextResponse } from "next/server";
import { updateUserStatusAction } from "@/core/admin/actions";
import { verifyAdminAuth } from "../../../auth-check";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  try {
    // Verify admin authentication
    const authResult = await verifyAdminAuth();
    if ("error" in authResult) return authResult.error;
    const body = await request.json();
    const formData = new FormData();

    formData.append("userId", resolvedParams.id);
    formData.append("status", body.status);
    if (body.reason) {
      formData.append("reason", body.reason);
    }

    const result = await updateUserStatusAction(formData);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, details: result.details },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in update user status API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}