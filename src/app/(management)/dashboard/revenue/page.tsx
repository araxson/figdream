import { Suspense } from 'react'
import { CardGridSkeleton, ChartSkeleton, TableSkeleton } from '@/components/shared/ui-helpers/skeleton-patterns'
// import { RevenueManagement } from '@/components/sections/owner/revenue/revenue-management'

export default function RevenuePage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Revenue Management</h2>
      </div>
      
      <Suspense fallback={<CardGridSkeleton count={4} />}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Metric {i}</p>
              <p className="text-2xl font-bold">$0.00</p>
            </div>
          ))}
        </div>
      </Suspense>
      
      <Suspense fallback={<ChartSkeleton />}>
        {/* <RevenueChart /> */}
        <div className="border rounded-lg p-8 text-center">
          <h3 className="text-lg font-semibold mb-2">Revenue Dashboard</h3>
          <p className="text-muted-foreground">Revenue charts will be displayed here</p>
        </div>
      </Suspense>
      
      <Suspense fallback={<TableSkeleton count={10} />}>
        {/* <RevenueTable /> */}
        <div className="border rounded-lg p-8 text-center">
          <h3 className="text-lg font-semibold mb-2">Transaction History</h3>
          <p className="text-muted-foreground">Transaction details will be displayed here</p>
        </div>
      </Suspense>
    </div>
  )
}