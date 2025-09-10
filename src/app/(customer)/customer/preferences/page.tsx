import { Suspense } from 'react'
import { CustomerPreferencesClient } from './client'
import { Skeleton } from '@/components/ui/skeleton'

export const metadata = {
  title: 'My Preferences',
  description: 'Manage your personal preferences and settings'
}

export default function CustomerPreferencesPage() {
  return (
    <Suspense fallback={<PreferencesSkeleton />}>
      <CustomerPreferencesClient />
    </Suspense>
  )
}

function PreferencesSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-64" />
      <div className="grid gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    </div>
  )
}