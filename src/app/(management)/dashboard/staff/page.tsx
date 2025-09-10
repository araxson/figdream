import { Suspense } from 'react'
import { StaffManagementClient } from './client'
import { Skeleton } from '@/components/ui/skeleton'

export const metadata = {
  title: 'Staff Management',
  description: 'Manage salon staff, schedules, and assignments'
}

export default function StaffManagementPage() {
  return (
    <Suspense fallback={<StaffManagementSkeleton />}>
      <StaffManagementClient />
    </Suspense>
  )
}

function StaffManagementSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-64" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-48" />
        ))}
      </div>
    </div>
  )
}