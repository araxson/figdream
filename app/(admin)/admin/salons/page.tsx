import { SalonManagement } from "@/core/admin/components/salon-management";
import { getPlatformSalons } from "@/core/admin/dal";
import { redirect } from "next/navigation";

export default async function AdminSalonsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  try {
    const resolvedParams = await searchParams;
    // Parse search parameters for filtering
    const filters = {
      page: resolvedParams.page ? parseInt(resolvedParams.page as string) : 1,
      limit: resolvedParams.limit ? parseInt(resolvedParams.limit as string) : 25,
      search: resolvedParams.search as string,
      status: resolvedParams.status as string,
      salon_tier: resolvedParams.salon_tier as string,
      sort_by: resolvedParams.sort_by as string,
      sort_order: resolvedParams.sort_order as "asc" | "desc",
    };

    // Fetch initial salons data
    const { salons, totalCount, totalPages } = await getPlatformSalons(filters);

    return (
      <SalonManagement
        initialSalons={salons}
        initialTotalCount={totalCount}
        initialTotalPages={totalPages}
      />
    );
  } catch (_error) {
    // If user doesn't have super admin access, redirect to unauthorized
    redirect("/unauthorized");
  }
}
