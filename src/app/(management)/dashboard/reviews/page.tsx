import { Suspense } from 'react'
// import { ReviewsHeader } from '@/components/sections/owner/reviews/header'
// import { ReviewsList } from '@/components/sections/owner/reviews/list'
// import { ReviewStats } from '@/components/sections/owner/reviews/stats'
import { Skeleton } from '@/components/ui/skeleton'

export default function ReviewsPage() {
  return (
    <div className="space-y-6">
      {/* <ReviewsHeader /> */}
      
      <Suspense fallback={<Skeleton className="h-32" />}>
        {/* <ReviewStats /> */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Average Rating</p>
            <p className="text-2xl font-bold">4.5</p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total Reviews</p>
            <p className="text-2xl font-bold">0</p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Response Rate</p>
            <p className="text-2xl font-bold">0%</p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">This Month</p>
            <p className="text-2xl font-bold">0</p>
          </div>
        </div>
      </Suspense>
      
      <Suspense fallback={<Skeleton className="h-[500px]" />}>
        {/* <ReviewsList /> */}
        <div className="border rounded-lg p-8 text-center">
          <h3 className="text-lg font-semibold mb-2">Customer Reviews</h3>
          <p className="text-muted-foreground">Reviews will be displayed here</p>
        </div>
      </Suspense>
    </div>
  )
}