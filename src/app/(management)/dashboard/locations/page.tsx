import { Suspense } from 'react'
import { CardGridSkeleton } from '@/components/shared/ui-helpers/skeleton-patterns'
import { Skeleton } from '@/components/ui/skeleton'
// import { LocationsHeader } from '@/components/sections/locations/header'
// import { LocationsList } from '@/components/sections/locations/list'

export default function LocationsPage() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<div className="space-y-2"><Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-96" /></div>}>
        {/* <LocationsHeader /> */}
        <div>
          <h1 className="text-3xl font-bold">Locations</h1>
          <p className="text-muted-foreground">Manage your salon locations</p>
        </div>
      </Suspense>
      
      <Suspense fallback={<CardGridSkeleton count={6} className="md:grid-cols-2 lg:grid-cols-3" />}>
        {/* <LocationsList /> */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="col-span-full border rounded-lg p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Salon Locations</h2>
            <p className="text-muted-foreground">Location management coming soon</p>
          </div>
        </div>
      </Suspense>
    </div>
  )
}