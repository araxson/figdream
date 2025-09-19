import { NextRequest, NextResponse } from "next/server";
import { updateSalonStatusAction } from "@/core/admin/actions";
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

    formData.append("salonId", resolvedParams.id);
    formData.append("updates", JSON.stringify(body.updates));
    if (body.reason) {
      formData.append("reason", body.reason);
    }

    const result = await updateSalonStatusAction(formData);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, details: result.details },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in update salon status API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}