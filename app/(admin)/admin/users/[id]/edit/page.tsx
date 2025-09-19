import { UserProfileEditor } from "@/core/users/components";
import { getUserById, getUserActivity, getAvailableRoles } from "@/core/users/dal";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Ultra-thin page for user profile editing
 */
export default async function EditUserPage({ params }: PageProps) {
  const resolvedParams = await params;

  try {
    const [user, activity, roles] = await Promise.all([
      getUserById(resolvedParams.id),
      getUserActivity(resolvedParams.id, 20),
      getAvailableRoles()
    ]);

    if (!user) {
      notFound();
    }

    return (
      <UserProfileEditor
        user={user}
        userActivity={activity}
        availableRoles={roles}
        canEditRole={true}
        canEditSecurity={true}
      />
    );
  } catch (_error) {
    notFound();
  }
}