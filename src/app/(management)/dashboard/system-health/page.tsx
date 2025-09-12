import { Metadata } from 'next';
import { SystemHealthDashboard } from '@/components/features/monitoring/system-health-dashboard';

export const metadata: Metadata = {
  title: 'System Health | Dashboard',
  description: 'Real-time system monitoring and health status',
};

export default function SystemHealthPage() {
  return <SystemHealthDashboard />;
}