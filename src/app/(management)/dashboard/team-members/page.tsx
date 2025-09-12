import { Metadata } from 'next';
import { TeamMembersManager } from '@/components/features/team/team-members-manager';

export const metadata: Metadata = {
  title: 'Team Members | Dashboard',
  description: 'Manage team members and permissions',
};

export default function TeamMembersPage() {
  return <TeamMembersManager />;
}