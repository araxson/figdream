import { CardGridSkeleton, TableSkeleton } from '@/components/ui/skeleton-variants'
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2"><Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-96" /></div>
      <CardGridSkeleton count={4} />
      <TableSkeleton count={5} />
    </div>
  )
}