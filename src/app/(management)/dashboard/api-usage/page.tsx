import { Metadata } from 'next';
import { ApiUsageDashboard } from '@/components/features/analytics/api-usage-dashboard';

export const metadata: Metadata = {
  title: 'API Usage | Dashboard',
  description: 'Monitor API calls, performance, and rate limits',
};

export default function ApiUsagePage() {
  return <ApiUsageDashboard />;
}