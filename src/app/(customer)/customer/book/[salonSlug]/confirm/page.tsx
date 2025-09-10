import { Suspense } from 'react'
// import { BookingConfirmation } from '@/components/sections/booking/confirmation'
// import { BookingProgress } from '@/components/sections/booking/progress'
import { Skeleton } from '@/components/ui/skeleton'

export default async function ConfirmationPage({ 
    params 
}: { 
  params: Promise<{ salonSlug: string }>
}) {
  await params // Resolve the promise
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* <BookingProgress currentStep={4} /> */}
      
      <Suspense fallback={<Skeleton className="h-[400px]" />}>
        {/* <BookingConfirmation salonSlug={params.salonSlug} /> */}
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold mb-4">Booking Confirmation</h2>
          <p className="text-muted-foreground">Your booking has been confirmed.</p>
        </div>
      </Suspense>
    </div>
  )
}