'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface SkeletonLoaderProps {
  className?: string
  variant?: 'default' | 'card' | 'table-row' | 'list-item' | 'form'
  count?: number
  animate?: boolean
}

export function SkeletonLoader({
  className,
  variant = 'default',
  count = 1,
  animate = true
}: SkeletonLoaderProps) {
  const skeletons = Array.from({ length: count }, (_, i) => i)

  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return (
          <Card className={cn('w-full', className)}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </CardContent>
          </Card>
        )

      case 'table-row':
        return (
          <div className={cn('flex items-center gap-4 p-4 border-b', className)}>
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        )

      case 'list-item':
        return (
          <div className={cn('flex items-start gap-3 p-3', className)}>
            <Skeleton className="h-12 w-12 rounded" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <div className="flex gap-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </div>
        )

      case 'form':
        return (
          <div className={cn('space-y-4', className)}>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-20 w-full" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
        )

      default:
        return <Skeleton className={cn('h-4 w-full', className)} />
    }
  }

  if (!animate) {
    return <>{skeletons.map(i => <div key={i}>{renderSkeleton()}</div>)}</>
  }

  return (
    <>
      {skeletons.map(i => (
        <div
          key={i}
          className="animate-pulse"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          {renderSkeleton()}
        </div>
      ))}
    </>
  )
}