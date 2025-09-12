import { Metadata } from 'next';
import { ErrorLogsViewer } from '@/components/features/admin/error-logs-viewer';

export const metadata: Metadata = {
  title: 'Error Logs | Admin',
  description: 'View and analyze system error logs',
};

export default function ErrorLogsPage() {
  return <ErrorLogsViewer />;
}