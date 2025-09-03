import { Metadata } from 'next'
import { AuditLogTable } from '@/components/super-admin/audit/audit-log-table'
import { AuditFilters } from '@/components/super-admin/audit/audit-filters'
import { AuditStats } from '@/components/super-admin/audit/audit-stats'
import { getAuditLogs, getAuditStats } from '@/lib/data-access/audit-logs'

export const metadata: Metadata = {
  title: 'Audit Logs',
  description: 'System audit logs and activity tracking',
}

export default async function AuditPage() {
  // Get audit data
  const [stats, logs] = await Promise.all([
    getAuditStats(),
    getAuditLogs({ limit: 100 })
  ])

  const initialFilters = {
    action: 'all',
    entity: 'all'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-muted-foreground">
          Track system activity and user actions
        </p>
      </div>
      <AuditStats stats={stats} />
      <AuditFilters initialFilters={initialFilters} />
      <AuditLogTable logs={logs} />
    </div>
  )
}