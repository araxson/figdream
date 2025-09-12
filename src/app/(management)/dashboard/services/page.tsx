import { Suspense } from 'react'
import { ServicesHeader } from '@/components/features/services/services-header'
import { ServicesTable } from '@/components/features/services/services-table'
import { ServiceListSkeleton } from '@/components/shared/ui-helpers/skeleton-patterns'
import { Skeleton } from '@/components/ui/skeleton'

export default function ServicesPage() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<div className="space-y-2"><Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-96" /></div>}>
        <ServicesHeader />
      </Suspense>
      
      <Suspense fallback={<ServiceListSkeleton count={8} />}>
        <ServicesTable />
      </Suspense>
    </div>
  )
}