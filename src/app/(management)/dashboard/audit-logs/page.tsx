import { Metadata } from 'next';
import { AuditLogsViewer } from '@/components/features/security/audit-logs-viewer';

export const metadata: Metadata = {
  title: 'Audit Logs | Dashboard',
  description: 'Track all system activities and user actions',
};

export default function AuditLogsPage() {
  return <AuditLogsViewer />;
}