import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface LoadingCardProps {
  title?: string
  message?: string
  className?: string
}

export function LoadingCard({ title, message = 'Loading...', className }: LoadingCardProps) {
  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <h3 className={cn("text-lg font-semibold")}>{title}</h3>
        </CardHeader>
      )}
      <CardContent>
        <div className={cn("flex items-center justify-center py-8")}>
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>{message}</span>
        </div>
      </CardContent>
    </Card>
  )
}

interface LoadingSkeletonProps {
  rows?: number
  className?: string
}

export function LoadingSkeleton({ rows = 3, className }: LoadingSkeletonProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  )
}

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }
  
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <Loader2 className={cn(sizeClasses[size], "animate-spin")} />
    </div>
  )
}