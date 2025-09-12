import { Suspense } from 'react'
import { requireRole } from '@/lib/api/dal/auth'
import { USER_ROLES } from '@/lib/auth/constants'
import { StaffSchedulesServer } from '@/components/features/staff/schedules-server'
import { CardGridSkeleton } from '@/components/shared/ui-helpers/skeleton-patterns'

export default async function StaffSchedulesPage() {
  await requireRole([USER_ROLES.SALON_OWNER, USER_ROLES.SALON_MANAGER])
  
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div className="h-10 w-64 bg-muted animate-pulse rounded" />
        <CardGridSkeleton count={4} />
        <div className="h-[600px] bg-muted animate-pulse rounded" />
      </div>
    }>
      <StaffSchedulesServer />
    </Suspense>
  )
}