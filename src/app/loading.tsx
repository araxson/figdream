import { Skeleton } from '@/components/ui'
export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="space-y-3">
        <Skeleton className="h-12 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-4 w-[150px]" />
      </div>
    </div>
  )
}