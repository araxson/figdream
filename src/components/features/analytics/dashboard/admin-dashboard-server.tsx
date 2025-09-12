import { getAdminDashboardStats, getSystemStatus, getRecentActivity } from '@/lib/api/dal/admin-dashboard'
import { Dashboard } from './dashboard'
import { Suspense } from 'react'
import { CardGridSkeleton, ChartSkeleton, TableSkeleton } from '@/components/shared/ui-helpers/skeleton-patterns'

export async function AdminDashboardServer() {
  // Fetch all data on the server
  const [stats, systemStatus, recentActivity] = await Promise.all([
    getAdminDashboardStats(),
    getSystemStatus(),
    getRecentActivity()
  ])

  return (
    <Suspense fallback={
      <div className="space-y-6">
        <CardGridSkeleton count={4} />
        <ChartSkeleton />
        <TableSkeleton count={5} />
      </div>
    }>
      <Dashboard 
        userRole="super_admin" 
        initialStats={stats}
        initialSystemStatus={systemStatus}
        initialActivity={recentActivity}
      />
    </Suspense>
  )
}