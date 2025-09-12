import { Suspense } from 'react'
import { Dashboard } from '@/components/features/analytics/dashboard/dashboard'
import { DashboardHeader } from '@/components/features/analytics/dashboard/dashboard-header'
import { CardGridSkeleton, ChartSkeleton } from '@/components/shared/ui-helpers/skeleton-patterns'
import { requireAuth } from '@/lib/api/dal/auth'
import { getCurrentSalonContext } from '@/lib/api/salon-context'
import { AdminSalonBanner } from '@/components/features/admin/admin-salon-banner'

export default async function DashboardPage() {
  const session = await requireAuth()
  const userRole = session.user.role
  const salonContext = await getCurrentSalonContext()
  
  return (
    <>
      {/* Show banner if Super Admin is managing a salon */}
      {salonContext?.isManagingAsAdmin && (
        <AdminSalonBanner salonName={salonContext.salonName || 'Unknown Salon'} />
      )}
      
      <div className="space-y-6">
        <DashboardHeader userRole={userRole} />
        
        <Suspense fallback={
          <div className="space-y-6">
            <CardGridSkeleton count={4} />
            <div className="grid gap-6 lg:grid-cols-2">
              <ChartSkeleton />
              <ChartSkeleton />
            </div>
          </div>
        }>
          <Dashboard userRole={userRole} salonId={salonContext?.salonId} />
        </Suspense>
      </div>
    </>
  )
}