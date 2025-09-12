import { Metadata } from 'next';
import { SystemHealthDashboard } from '@/components/features/admin/system-health-dashboard';

export const metadata: Metadata = {
  title: 'System Health | Admin',
  description: 'Monitor platform health and performance metrics',
};

export default function SystemHealthPage() {
  return <SystemHealthDashboard />;
}