import { Metadata } from 'next';
import { ErrorLogsViewer } from '@/components/features/monitoring/error-logs-viewer';

export const metadata: Metadata = {
  title: 'Error Logs | Dashboard',
  description: 'Monitor and analyze system errors and warnings',
};

export default function ErrorLogsPage() {
  return <ErrorLogsViewer />;
}