import { Suspense } from 'react'
import { PlatformSubscriptionsClient } from './client'
import { Skeleton } from '@/components/ui/skeleton'

export const metadata = {
  title: 'Platform Subscriptions',
  description: 'Manage platform subscription plans and billing'
}

export default function PlatformSubscriptionsPage() {
  return (
    <Suspense fallback={<SubscriptionsSkeleton />}>
      <PlatformSubscriptionsClient />
    </Suspense>
  )
}

function SubscriptionsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-64" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-48" />
        ))}
      </div>
    </div>
  )
}