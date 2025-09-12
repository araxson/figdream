import { Suspense } from 'react'
import { requireRole } from '@/lib/api/dal/auth'
import { USER_ROLES } from '@/lib/auth/constants'
import { UsersServer } from '@/components/features/platform/users-server'
import { CardGridSkeleton } from '@/components/shared/ui-helpers/skeleton-patterns'

export default async function UsersPage() {
  await requireRole([USER_ROLES.SUPER_ADMIN])
  
  return (
    <Suspense fallback={<CardGridSkeleton count={5} />}>
      <UsersServer />
    </Suspense>
  )
}