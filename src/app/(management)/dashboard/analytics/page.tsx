import { Suspense } from 'react'
import { ChartSkeleton, CardGridSkeleton } from '@/components/ui/skeleton-variants'
import { ChartAreaInteractive } from '@/components/features/analytics/charts/chart-area-interactive'
import { ChartBarInteractive } from '@/components/features/analytics/charts/chart-bar-interactive'

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Track your business performance and insights</p>
      </div>
      
      <Suspense fallback={<CardGridSkeleton count={4} />}>
        {/* Stats cards will go here */}
      </Suspense>
      
      <div className="grid gap-6 lg:grid-cols-2">
        <Suspense fallback={<ChartSkeleton />}>
          <ChartAreaInteractive />
        </Suspense>
        
        <Suspense fallback={<ChartSkeleton />}>
          <ChartBarInteractive />
        </Suspense>
      </div>
    </div>
  )
}