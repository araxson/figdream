import { Suspense } from 'react'
// import { StaffSelection } from '@/components/sections/booking/staff-selection'
// import { BookingProgress } from '@/components/sections/booking/progress'
import { Skeleton } from '@/components/ui/skeleton'

export default async function StaffSelectionPage({ 
    params 
}: { 
  params: Promise<{ salonSlug: string }>
}) {
  await params // Resolve the promise
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* <BookingProgress currentStep={2} /> */}
      
      <Suspense fallback={<StaffSkeleton />}>
        {/* <StaffSelection salonSlug={params.salonSlug} /> */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Select Staff Member</h2>
          <div className="grid gap-4">
            <p className="text-center text-muted-foreground py-8">
              Staff selection will be available soon
            </p>
          </div>
        </div>
      </Suspense>
    </div>
  )
}

function StaffSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <Skeleton key={i} className="h-32" />
      ))}
    </div>
  )
}