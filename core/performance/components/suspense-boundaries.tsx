'use client'

import { Suspense, ReactNode, lazy, ComponentType } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

// Chart loading skeleton
export function ChartSkeleton({ height = 350 }: { height?: number }) {
  return (
    <Card className="p-6">
      <div className="space-y-2">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>
      <Skeleton className={`w-full mt-4`} style={{ height }} />
    </Card>
  )
}

// Table loading skeleton
export function TableSkeleton({ rows = 5, columns = 6 }: { rows?: number; columns?: number }) {
  return (
    <div className="rounded-md border">
      <div className="p-4 border-b">
        <div className="flex space-x-2">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-24" />
          ))}
        </div>
      </div>
      <div className="p-4 space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex space-x-2">
            {Array.from({ length: columns }).map((_, j) => (
              <Skeleton key={j} className="h-10 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// Stats card skeleton
export function StatsSkeleton({ cards = 4 }: { cards?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: cards }).map((_, i) => (
        <Card key={i} className="p-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </Card>
      ))}
    </div>
  )
}

// Form skeleton
export function FormSkeleton({ fields = 5 }: { fields?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <div className="flex space-x-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  )
}

// List skeleton
export function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: items }).map((_, i) => (
        <Card key={i} className="p-4">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        </Card>
      ))}
    </div>
  )
}

// Centered loading spinner
export function LoadingSpinner({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <p className="mt-2 text-sm text-muted-foreground">{text}</p>
    </div>
  )
}

// Dashboard widget skeleton
export function DashboardWidgetSkeleton() {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-8" />
        </div>
        <Skeleton className="h-24 w-full" />
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </Card>
  )
}

// Suspense boundary wrapper with error handling
interface SuspenseBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  errorFallback?: (error: Error) => ReactNode
}

export function SuspenseBoundary({
  children,
  fallback = <LoadingSpinner />,
  errorFallback
}: SuspenseBoundaryProps) {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  )
}

// Chart with Suspense
export function ChartWithSuspense({ children }: { children: ReactNode }) {
  return (
    <SuspenseBoundary fallback={<ChartSkeleton />}>
      {children}
    </SuspenseBoundary>
  )
}

// Table with Suspense
export function TableWithSuspense({ children }: { children: ReactNode }) {
  return (
    <SuspenseBoundary fallback={<TableSkeleton />}>
      {children}
    </SuspenseBoundary>
  )
}

// Stats with Suspense
export function StatsWithSuspense({ children }: { children: ReactNode }) {
  return (
    <SuspenseBoundary fallback={<StatsSkeleton />}>
      {children}
    </SuspenseBoundary>
  )
}

// Form with Suspense
export function FormWithSuspense({ children }: { children: ReactNode }) {
  return (
    <SuspenseBoundary fallback={<FormSkeleton />}>
      {children}
    </SuspenseBoundary>
  )
}

// List with Suspense
export function ListWithSuspense({ children }: { children: ReactNode }) {
  return (
    <SuspenseBoundary fallback={<ListSkeleton />}>
      {children}
    </SuspenseBoundary>
  )
}

// Lazy load component with suspense
export function lazyLoadWithSuspense<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: ReactNode
) {
  const LazyComponent = lazy(importFunc)

  return (props: any) => (
    <SuspenseBoundary fallback={fallback || <LoadingSpinner />}>
      <LazyComponent {...props} />
    </SuspenseBoundary>
  )
}

// Preload component
export function preloadComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
) {
  // Start loading the component immediately
  const componentPromise = importFunc()

  return {
    Component: lazy(() => componentPromise),
    preload: () => componentPromise
  }
}