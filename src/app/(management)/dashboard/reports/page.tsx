import { Suspense } from 'react'
// import { ReportsHeader } from '@/components/sections/owner/reports/header'
// import { RevenueChart } from '@/components/sections/owner/reports/revenue-chart'
// import { BookingChart } from '@/components/sections/owner/reports/booking-chart'
// import { TopServices } from '@/components/sections/owner/reports/top-services'
import { Skeleton } from '@/components/ui/skeleton'

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      {/* <ReportsHeader /> */}
      
      <div className="grid gap-6 md:grid-cols-2">
        <Suspense fallback={<Skeleton className="h-[350px]" />}>
          {/* <RevenueChart /> */}
          <div className="border rounded-lg p-6">
            <h3 className="font-semibold mb-4">Revenue Chart</h3>
            <p className="text-muted-foreground">Revenue analytics coming soon</p>
          </div>
        </Suspense>
        
        <Suspense fallback={<Skeleton className="h-[350px]" />}>
          {/* <BookingChart /> */}
          <div className="border rounded-lg p-6">
            <h3 className="font-semibold mb-4">Booking Chart</h3>
            <p className="text-muted-foreground">Booking analytics coming soon</p>
          </div>
        </Suspense>
      </div>
      
      <Suspense fallback={<Skeleton className="h-[300px]" />}>
        {/* <TopServices /> */}
        <div className="border rounded-lg p-6">
          <h3 className="font-semibold mb-4">Top Services</h3>
          <p className="text-muted-foreground">Service analytics coming soon</p>
        </div>
      </Suspense>
    </div>
  )
}