import { Metadata } from 'next';
import { AlertConfigurationManager } from '@/components/features/monitoring/alert-configuration-manager';

export const metadata: Metadata = {
  title: 'Alert Configuration | Dashboard',
  description: 'Configure system alerts and notifications',
};

export default function AlertsPage() {
  return <AlertConfigurationManager />;
}