import { Suspense } from 'react'
import { SalonsServer } from '@/components/features/salons/salons-server'
import { CardGridSkeleton } from '@/components/shared/ui-helpers/skeleton-patterns'

export default function AdminSalonsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Salons Management</h1>
        <p className="text-muted-foreground">
          Manage all registered salons on the platform
        </p>
      </div>
      
      <Suspense fallback={<CardGridSkeleton count={5} />}>
        <SalonsServer />
      </Suspense>
    </div>
  )
}