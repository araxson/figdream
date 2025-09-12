import { Metadata } from 'next';
import { UserRolesManager } from '@/components/features/access/user-roles-manager';

export const metadata: Metadata = {
  title: 'User Roles | Dashboard',
  description: 'Manage user access and permissions',
};

export default function UserRolesPage() {
  return <UserRolesManager />;
}