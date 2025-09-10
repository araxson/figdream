import { Suspense } from 'react'
// import { SalonsHeader } from '@/components/sections/admin/salons/header'
// import { SalonsTable } from '@/components/sections/admin/salons/table'
import { Skeleton } from '@/components/ui/skeleton'

export default function AdminSalonsPage() {
  return (
    <div className="space-y-6">
      {/* <SalonsHeader /> */}
      
      <Suspense fallback={<Skeleton className="h-[500px]" />}>
        {/* <SalonsTable /> */}
      </Suspense>
    </div>
  )
}