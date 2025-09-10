import { Suspense } from 'react'
// import { ServicesHeader } from '@/components/sections/owner/services/header'
// import { ServicesTable } from '@/components/sections/owner/services/table'
import { ServiceListSkeleton, SearchBarSkeleton } from '@/components/ui/skeleton-variants'
import { Skeleton } from '@/components/ui/skeleton'

export default function ServicesPage() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<div className="space-y-2"><Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-96" /></div>}>
        {/* <ServicesHeader /> */}
        <div>
          <h1 className="text-3xl font-bold">Services</h1>
          <p className="text-muted-foreground">Manage your salon services and pricing</p>
        </div>
      </Suspense>
      
      <Suspense fallback={<SearchBarSkeleton />}>
        {/* Search and filter components will go here */}
      </Suspense>
      
      <Suspense fallback={<ServiceListSkeleton count={8} />}>
        {/* <ServicesTable /> */}
        <div className="border rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Service Management</h2>
          <p className="text-muted-foreground">Services configuration will be displayed here</p>
        </div>
      </Suspense>
    </div>
  )
}