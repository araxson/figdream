import { Suspense } from 'react'
import { OwnerDashboard } from '@/components/features/analytics/dashboard/owner-dashboard'
import { CardGridSkeleton, ChartSkeleton } from '@/components/ui/skeleton-variants'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground">
          Manage your salon business and view analytics
        </p>
      </div>
      
      <Suspense fallback={
        <div className="space-y-6">
          <CardGridSkeleton count={4} />
          <div className="grid gap-6 lg:grid-cols-2">
            <ChartSkeleton />
            <ChartSkeleton />
          </div>
        </div>
      }>
        <OwnerDashboard />
      </Suspense>
    </div>
  )
}