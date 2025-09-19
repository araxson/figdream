import { AdminDashboard } from "@/core/platform/components";
import { getAdminDashboardStats, getSystemHealthMetrics } from "@/core/platform/dal";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  try {
    // Fetch initial data for the dashboard
    const [stats, healthMetrics] = await Promise.all([
      getAdminDashboardStats(),
      getSystemHealthMetrics()
    ]);

    return (
      <AdminDashboard
        initialStats={stats}
        initialHealthMetrics={healthMetrics}
      />
    );
  } catch (_error) {
    // If user doesn't have super admin access, redirect to unauthorized
    redirect("/unauthorized");
  }
}
