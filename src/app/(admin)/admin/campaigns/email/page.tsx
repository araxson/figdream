import { Suspense } from 'react'
import { requireRole } from '@/lib/api/dal/auth'
import { USER_ROLES } from '@/lib/auth/constants'
import { EmailCampaignsServer } from '@/components/features/campaigns/email-campaigns-server'
import { CardGridSkeleton } from '@/components/shared/ui-helpers/skeleton-patterns'

export default async function EmailCampaignsPage() {
  await requireRole([USER_ROLES.SUPER_ADMIN])
  
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div className="h-10 w-64 bg-muted animate-pulse rounded" />
        <CardGridSkeleton count={4} />
        <div className="h-[400px] bg-muted animate-pulse rounded" />
      </div>
    }>
      <EmailCampaignsServer />
    </Suspense>
  )
}