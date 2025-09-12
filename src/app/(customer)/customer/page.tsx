import { Suspense } from 'react'
import { Dashboard } from '@/components/features/analytics/dashboard/dashboard'
import { DashboardHeader } from '@/components/features/analytics/dashboard/dashboard-header'
import { CardGridSkeleton, AppointmentCardSkeleton } from '@/components/shared/ui-helpers/skeleton-patterns'
import { requireAuth } from '@/lib/api/dal/auth'

export default async function CustomerDashboardPage() {
  const session = await requireAuth()
  const userRole = session.user.role
  
  return (
    <div className="space-y-6">
      <DashboardHeader userRole={userRole} />
      
      <Suspense fallback={
        <div className="space-y-6">
          <CardGridSkeleton count={4} />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <AppointmentCardSkeleton key={i} />
            ))}
          </div>
        </div>
      }>
        <Dashboard userRole={userRole} />
      </Suspense>
    </div>
  )
}