import { SecurityCenter } from "@/core/users/components";
import { getUserSecuritySettings } from "@/core/users/dal";

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Ultra-thin page for user security settings
 */
export default async function UserSecurityPage({ params }: PageProps) {
  const resolvedParams = await params;
  const settings = await getUserSecuritySettings(resolvedParams.id);

  return (
    <SecurityCenter
      userId={resolvedParams.id}
      settings={settings}
      passwordStrength={85}
    />
  );
}