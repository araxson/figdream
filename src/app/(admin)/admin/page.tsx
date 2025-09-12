import { Suspense } from 'react'
import { DashboardHeader } from '@/components/features/analytics/dashboard/dashboard-header'
import { CardGridSkeleton, ChartSkeleton, TableSkeleton } from '@/components/shared/ui-helpers/skeleton-patterns'
import { cn } from '@/lib/utils'
import { requireRole } from '@/lib/api/dal/auth'
import { USER_ROLES } from '@/lib/auth/constants'
import { AdminDashboardServer } from '@/components/features/analytics/dashboard/admin-dashboard-server'

export default async function AdminDashboardPage() {
  const session = await requireRole([USER_ROLES.SUPER_ADMIN])
  const userRole = session.user.role
  
  return (
    <div className={cn("space-y-6")}>
      <DashboardHeader userRole={userRole} />
      
      <Suspense fallback={
        <div className={cn("space-y-6")}>
          <CardGridSkeleton count={4} />
          <ChartSkeleton />
          <TableSkeleton count={5} />
        </div>
      }>
        <AdminDashboardServer />
      </Suspense>
    </div>
  )
}