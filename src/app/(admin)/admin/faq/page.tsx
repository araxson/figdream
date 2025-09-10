import { Suspense } from 'react'
import { FAQManagementClient } from './client'
import { Skeleton } from '@/components/ui/skeleton'

export const metadata = {
  title: 'FAQ Management',
  description: 'Manage frequently asked questions'
}

export default function FAQManagementPage() {
  return (
    <Suspense fallback={<FAQSkeleton />}>
      <FAQManagementClient />
    </Suspense>
  )
}

function FAQSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-64" />
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    </div>
  )
}