import { Suspense } from 'react'
import { StaffManagementWrapper } from '@/components/features/staff/staff-management-wrapper'
import { Skeleton } from '@/components/ui/skeleton'
import { requireRole } from '@/lib/api/dal/auth'
import { USER_ROLES } from '@/lib/auth/constants'

export const metadata = {
  title: 'Staff Management',
  description: 'Manage salon staff, schedules, and assignments'
}

export default async function StaffManagementPage() {
  // Only salon owner and manager can access
  await requireRole([USER_ROLES.SALON_OWNER, USER_ROLES.SALON_MANAGER])
  
  return (
    <Suspense fallback={<StaffManagementSkeleton />}>
      {/* No salonId needed - will get from user context */}
      <StaffManagementWrapper />
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