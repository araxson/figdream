import { Metadata } from 'next'
import { Suspense } from 'react'
import { SettingsPage } from '@/components/features/settings/settings-content'
import { FormSkeleton } from '@/components/shared/ui-helpers/skeleton-patterns'

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Manage your salon preferences and configuration',
}

export default function Page() {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <SettingsPage />
    </Suspense>
  )
}