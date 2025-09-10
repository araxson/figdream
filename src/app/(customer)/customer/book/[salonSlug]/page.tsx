import { Suspense } from 'react'
// import { ServiceSelection } from '@/components/sections/booking/service-selection'
// import { SalonHeader } from '@/components/sections/booking/salon-header'
import { Skeleton } from '@/components/ui/skeleton'

export default async function SalonBookingPage({ 
    params 
}: { 
  params: Promise<{ salonSlug: string }>
}) {
  await params // Resolve the promise
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Suspense fallback={<Skeleton className="h-20" />}>
        {/* <SalonHeader salonSlug={params.salonSlug} /> */}
        <div className="border-b pb-4">
          <h1 className="text-2xl font-bold">Select Services</h1>
          <p className="text-muted-foreground">Choose from our available services</p>
        </div>
      </Suspense>
      
      <Suspense fallback={<ServicesSkeleton />}>
        {/* <ServiceSelection salonSlug={params.salonSlug} /> */}
        <div className="space-y-4">
          <p className="text-center text-muted-foreground py-8">
            Service selection will be available soon
          </p>
        </div>
      </Suspense>
    </div>
  )
}

function ServicesSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-24" />
      ))}
    </div>
  )
}