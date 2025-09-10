import { Suspense } from 'react'
// import { DateTimeSelection } from '@/components/sections/booking/datetime-selection'
// import { BookingProgress } from '@/components/sections/booking/progress'
import { Skeleton } from '@/components/ui/skeleton'

export default async function DateTimeSelectionPage({ 
    params 
}: { 
  params: Promise<{ salonSlug: string }>
}) {
  await params // Resolve the promise
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* <BookingProgress currentStep={3} /> */}
      
      <Suspense fallback={<DateTimeSkeleton />}>
        {/* <DateTimeSelection salonSlug={params.salonSlug} /> */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Select Date & Time</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-6">
              <h3 className="font-semibold mb-4">Select Date</h3>
              <p className="text-muted-foreground">Date selection coming soon</p>
            </div>
            <div className="border rounded-lg p-6">
              <h3 className="font-semibold mb-4">Select Time</h3>
              <p className="text-muted-foreground">Time selection coming soon</p>
            </div>
          </div>
        </div>
      </Suspense>
    </div>
  )
}

function DateTimeSkeleton() {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Skeleton className="h-[350px]" />
      <Skeleton className="h-[350px]" />
    </div>
  )
}