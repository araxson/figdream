import { Suspense } from 'react'
import { AdminDashboard } from '@/components/features/analytics/dashboard/admin-dashboard'
import { CardGridSkeleton, ChartSkeleton, TableSkeleton } from '@/components/ui/skeleton-variants'
import { cn } from '@/lib/utils'

export default function AdminDashboardPage() {
  return (
    <div className={cn("space-y-6")}>
      <div>
        <h1 className={cn("text-3xl font-bold tracking-tight")}>Admin Dashboard</h1>
        <p className={cn("text-muted-foreground")}>
          System overview and management tools
        </p>
      </div>
      
      <Suspense fallback={
        <div className={cn("space-y-6")}>
          <CardGridSkeleton count={4} />
          <ChartSkeleton />
          <TableSkeleton count={5} />
        </div>
      }>
        <AdminDashboard />
      </Suspense>
    </div>
  )
}