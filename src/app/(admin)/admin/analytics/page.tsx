import { Suspense } from 'react'
import { requireRole } from '@/lib/api/dal/auth'
import { USER_ROLES } from '@/lib/auth/constants'
import { PlatformAnalyticsServer } from '@/components/features/analytics/platform-analytics-server'
import { CardGridSkeleton, ChartSkeleton } from '@/components/shared/ui-helpers/skeleton-patterns'

export default async function AdminAnalyticsPage() {
  await requireRole([USER_ROLES.SUPER_ADMIN])
  
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <CardGridSkeleton count={4} />
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    }>
      <PlatformAnalyticsServer />
    </Suspense>
  )
}