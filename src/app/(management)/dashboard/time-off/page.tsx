import { Metadata } from 'next';
import { TimeOffRequestsManager } from '@/components/features/staff/time-off-requests-manager';

export const metadata: Metadata = {
  title: 'Time Off Requests | Dashboard',
  description: 'Manage staff time off requests and approvals',
};

export default function TimeOffRequestsPage() {
  return <TimeOffRequestsManager />;
}