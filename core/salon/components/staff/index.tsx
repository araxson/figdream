import { Suspense } from "react";
import { getStaffMembers } from "../../dal/staff-queries";
import { StaffHeader } from "./header";
import { StaffStats } from "./stats";
import { StaffList } from "./list";
import { StaffGrid } from "./grid";
import { LoadingState } from "@/core/shared/ui/components";
import type { StaffFilters } from "../../dal/staff-types";

interface StaffManagementProps {
  role: "admin" | "owner" | "manager";
  filters?: StaffFilters;
  viewMode?: "grid" | "list";
}

export async function StaffManagement({
  role,
  filters = {},
  viewMode = "grid",
}: StaffManagementProps) {
  const [staff, topPerformer] = await Promise.all([
    getStaffMembers(filters),
    getTopPerformer(filters.salon_id),
  ]);

  const stats = {
    total: staff.length,
    active: staff.filter((s) => s.is_active).length,
    bookable: staff.filter((s) => s.is_bookable).length,
    featured: staff.filter((s) => s.is_featured).length,
    topPerformer,
  };

  return (
    <div className="space-y-6">
      <StaffHeader role={role} />

      <Suspense fallback={<LoadingState />}>
        <StaffStats stats={stats} />
      </Suspense>

      <Suspense fallback={<LoadingState />}>
        {viewMode === "grid" ? (
          <StaffGrid staff={staff} role={role} />
        ) : (
          <StaffList staff={staff} role={role} />
        )}
      </Suspense>
    </div>
  );
}

async function getTopPerformer(salonId?: string) {
  try {
    const staff = await getStaffMembers({
      salon_id: salonId,
      is_active: true,
      is_bookable: true,
    });

    if (!staff.length) return null;

    // Sort by rating and appointments
    const sorted = staff.sort((a, b) => {
      const scoreA = (a.rating_average || 0) * (a.total_appointments || 0);
      const scoreB = (b.rating_average || 0) * (b.total_appointments || 0);
      return scoreB - scoreA;
    });

    return sorted[0];
  } catch {
    return null;
  }
}
