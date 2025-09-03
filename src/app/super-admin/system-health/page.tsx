import { Metadata } from 'next'
import { SystemHealthDashboard } from '@/components/super-admin/system'

export const metadata: Metadata = {
  title: 'System Health',
  description: 'Monitor system health and performance',
}

export default async function SystemHealthPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Health</h1>
        <p className="text-muted-foreground">
          Monitor system performance and health metrics
        </p>
      </div>
      <SystemHealthDashboard />
    </div>
  )
}