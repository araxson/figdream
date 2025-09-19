import { UsersDashboard } from "@/core/users/components";
import {
  getUsersWithRoles,
  getUserManagementStats
} from "@/core/users/dal/users-queries";

/**
 * Ultra-thin page for user management dashboard
 * All business logic is in the UsersDashboard component
 */
export default async function UserManagementPage() {
  // Fetch initial data server-side for better performance
  const [users, stats] = await Promise.all([
    getUsersWithRoles(),
    getUserManagementStats()
  ]);

  return <UsersDashboard initialUsers={users} initialStats={stats} />;
}