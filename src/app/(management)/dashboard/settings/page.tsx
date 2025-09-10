import { Metadata } from 'next'
import { Suspense } from 'react'
import { SettingsPage } from '@/components/features/settings/settings-page'
import { FormSkeleton } from '@/components/ui/skeleton-variants'

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