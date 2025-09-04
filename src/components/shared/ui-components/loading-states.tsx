import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  text?: string
}

export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
  const sizeClass = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  }[size]

  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <Loader2 className={cn("animate-spin text-primary", sizeClass)} />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  )
}

interface PageLoadingProps {
  text?: string
  className?: string
}

export function PageLoading({ text = "Loading...", className }: PageLoadingProps) {
  return (
    <div className={cn("flex min-h-[60vh] items-center justify-center", className)}>
      <LoadingSpinner size="lg" text={text} />
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <Skeleton className="h-10 w-[250px]" />
        <Skeleton className="h-5 w-[350px]" />
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-8 w-[120px]" />
              <Skeleton className="h-3 w-[80px]" />
            </div>
          </Card>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <div className="space-y-3">
            <Skeleton className="h-6 w-[150px]" />
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="space-y-3">
            <Skeleton className="h-6 w-[150px]" />
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-10 w-full max-w-sm" />
        <Skeleton className="h-10 w-[100px]" />
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center gap-4 pb-4 border-b">
            <Skeleton className="h-5 w-[150px]" />
            <Skeleton className="h-5 w-[200px]" />
            <Skeleton className="h-5 w-[100px]" />
            <Skeleton className="h-5 w-[120px]" />
            <Skeleton className="h-5 w-[80px] ml-auto" />
          </div>
          
          {/* Rows */}
          <div className="space-y-3 pt-4">
            {[...Array(rows)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-[150px]" />
                <Skeleton className="h-10 w-[200px]" />
                <Skeleton className="h-10 w-[100px]" />
                <Skeleton className="h-10 w-[120px]" />
                <Skeleton className="h-10 w-[80px] ml-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2">
        <Skeleton className="h-9 w-[100px]" />
        <Skeleton className="h-9 w-[40px]" />
        <Skeleton className="h-9 w-[40px]" />
        <Skeleton className="h-9 w-[40px]" />
        <Skeleton className="h-9 w-[100px]" />
      </div>
    </div>
  )
}

export function FormSkeleton() {
  return (
    <div className="space-y-6">
      {/* Form Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-4 w-[350px]" />
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-2">
        <Skeleton className="h-10 w-[100px]" />
        <Skeleton className="h-10 w-[120px]" />
      </div>
    </div>
  )
}

export function CardSkeleton() {
  return (
    <Card className="p-6">
      <div className="space-y-3">
        <Skeleton className="h-6 w-[150px]" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </Card>
  )
}

export function ListSkeleton({ items = 3 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {[...Array(items)].map((_, i) => (
        <Card key={i} className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-5 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
            <Skeleton className="h-9 w-[100px]" />
          </div>
        </Card>
      ))}
    </div>
  )
}

interface OverlayLoadingProps {
  show: boolean
  text?: string
  className?: string
}

export function OverlayLoading({ show, text = "Loading...", className }: OverlayLoadingProps) {
  if (!show) return null

  return (
    <div className={cn(
      "absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm",
      className
    )}>
      <LoadingSpinner size="lg" text={text} />
    </div>
  )
}

export function InlineLoading({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>{text}</span>
    </div>
  )
}

export function ButtonLoading({ text = "Loading..." }: { text?: string }) {
  return (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      {text}
    </>
  )
}