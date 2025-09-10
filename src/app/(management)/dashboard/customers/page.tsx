import { Suspense } from 'react'
// import { CustomersHeader } from '@/components/sections/owner/customers/header'
// import { CustomersTable } from '@/components/sections/owner/customers/table'
import { TableSkeleton, SearchBarSkeleton } from '@/components/ui/skeleton-variants'
import { Skeleton } from '@/components/ui/skeleton'

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<div className="space-y-2"><Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-96" /></div>}>
        {/* <CustomersHeader /> */}
        <div>
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-muted-foreground">Manage your customer base</p>
        </div>
      </Suspense>
      
      <Suspense fallback={<SearchBarSkeleton />}>
        <div className="flex gap-4">
          {/* Search and filter components will go here */}
        </div>
      </Suspense>
      
      <Suspense fallback={<TableSkeleton count={10} />}>
        {/* <CustomersTable filters={{
          search: '',
          status: 'all',
          lastVisit: 'all',
          visitFrequency: 'all'
        }} /> */}
        <div className="border rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Customer Management</h2>
          <p className="text-muted-foreground">Customer table will be displayed here</p>
        </div>
      </Suspense>
    </div>
  )
}