import { UserManagement } from "@/core/admin/components/user-management";
import { getPlatformUsers } from "@/core/admin/dal";
import { redirect } from "next/navigation";

export default async function AdminUsersPage({
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
      sort_by: resolvedParams.sort_by as string,
      sort_order: resolvedParams.sort_order as "asc" | "desc",
    };

    // Fetch initial users data
    const { users, totalCount, totalPages } = await getPlatformUsers(filters);

    return (
      <UserManagement
        initialUsers={users}
        initialTotalCount={totalCount}
        initialTotalPages={totalPages}
      />
    );
  } catch (_error) {
    // If user doesn't have super admin access, redirect to unauthorized
    redirect("/unauthorized");
  }
}
