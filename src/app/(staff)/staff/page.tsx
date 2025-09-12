import { Suspense } from 'react'
import { Dashboard } from '@/components/features/analytics/dashboard/dashboard'
import { DashboardHeader } from '@/components/features/analytics/dashboard/dashboard-header'
import { CardGridSkeleton, AppointmentCardSkeleton, CalendarSkeleton } from '@/components/shared/ui-helpers/skeleton-patterns'
import { requireRole } from '@/lib/api/dal/auth'
import { USER_ROLES } from '@/lib/auth/constants'

export default async function StaffDashboardPage() {
  await requireRole([USER_ROLES.STAFF])
  
  return (
    <div className="space-y-6">
      <DashboardHeader userRole="staff" />
      
      <Suspense fallback={
        <div className="space-y-6">
          <CardGridSkeleton count={3} className="md:grid-cols-3" />
          <div className="grid gap-6 lg:grid-cols-2">
            <CalendarSkeleton />
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <AppointmentCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      }>
        <Dashboard userRole="staff" />
      </Suspense>
    </div>
  )
}