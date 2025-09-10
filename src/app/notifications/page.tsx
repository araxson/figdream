import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export default function NotificationsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="grid gap-6 md:grid-cols-4">
        <div className="md:col-span-1">
          <Suspense fallback={<Skeleton className="h-[300px]" />}>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Filters</h3>
              <p className="text-sm text-muted-foreground">Filter options will appear here</p>
            </div>
          </Suspense>
        </div>
        
        <div className="md:col-span-3">
          <Suspense fallback={<Skeleton className="h-[600px]" />}>
            <div className="border rounded-lg p-8 text-center">
              <h2 className="text-xl font-semibold mb-2">Notifications</h2>
              <p className="text-muted-foreground">Your notifications will appear here</p>
            </div>
          </Suspense>
        </div>
      </div>
    </div>
  )
}