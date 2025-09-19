import { RoleManager } from "@/core/users/components";

/**
 * Ultra-thin page for role management
 */
export default function RolesPage() {
  return (
    <RoleManager
      canCreateRoles={true}
      canEditRoles={true}
    />
  );
}