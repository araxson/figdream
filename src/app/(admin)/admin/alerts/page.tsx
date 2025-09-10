import { Suspense } from 'react'
import { AlertsManagementClient } from './client'
import { Skeleton } from '@/components/ui/skeleton'

export const metadata = {
  title: 'Alert Management',
  description: 'Configure and manage system alerts and notifications'
}

export default function AlertsPage() {
  return (
    <Suspense fallback={<AlertsSkeleton />}>
      <AlertsManagementClient />
    </Suspense>
  )
}

function AlertsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-64" />
      <div className="grid gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    </div>
  )
}