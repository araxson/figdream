import { Suspense } from 'react'
import { CustomersHeader } from '@/components/features/customers/list/customers-header'
import { CustomersTable } from '@/components/features/customers/customers-table'
import { TableSkeleton } from '@/components/shared/ui-helpers/skeleton-patterns'
import { Skeleton } from '@/components/ui/skeleton'

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<div className="space-y-2"><Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-96" /></div>}>
        <CustomersHeader />
      </Suspense>
      
      <Suspense fallback={<TableSkeleton count={10} />}>
        <CustomersTable />
      </Suspense>
    </div>
  )
}