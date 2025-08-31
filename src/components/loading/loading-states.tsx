'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

/**
 * Full page loading spinner
 */
export interface PageLoaderProps {
  message?: string
  className?: string
}

export function PageLoader({ message = 'Loading...', className }: PageLoaderProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center min-h-[400px]', className)}>
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-4 text-sm text-muted-foreground">{message}</p>
    </div>
  )
}

/**
 * Inline loading spinner
 */
export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }
  
  return (
    <Loader2 className={cn('animate-spin', sizeClasses[size], className)} />
  )
}

/**
 * Button loading state
 */
export interface ButtonLoaderProps {
  loading?: boolean
  children: React.ReactNode
  loadingText?: string
}

export function ButtonLoader({ loading, children, loadingText = 'Loading...' }: ButtonLoaderProps) {
  if (loading) {
    return (
      <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        {loadingText}
      </>
    )
  }
  return <>{children}</>
}

/**
 * Card skeleton loader
 */
export interface CardSkeletonProps {
  showHeader?: boolean
  lines?: number
  className?: string
}

export function CardSkeleton({ showHeader = true, lines = 3, className }: CardSkeletonProps) {
  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader>
          <Skeleton className="h-6 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
        </CardHeader>
      )}
      <CardContent className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </CardContent>
    </Card>
  )
}

/**
 * Table skeleton loader
 */
export interface TableSkeletonProps {
  rows?: number
  columns?: number
  className?: string
}

export function TableSkeleton({ rows = 5, columns = 4, className }: TableSkeletonProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {/* Header */}
      <div className="flex gap-4 pb-2 border-b">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 py-2">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

/**
 * List skeleton loader
 */
export interface ListSkeletonProps {
  items?: number
  showAvatar?: boolean
  className?: string
}

export function ListSkeleton({ items = 3, showAvatar = false, className }: ListSkeletonProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          {showAvatar && <Skeleton className="h-10 w-10 rounded-full" />}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-3 w-[150px]" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Form skeleton loader
 */
export interface FormSkeletonProps {
  fields?: number
  className?: string
}

export function FormSkeleton({ fields = 3, className }: FormSkeletonProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <Skeleton className="h-10 w-[120px]" />
    </div>
  )
}

/**
 * Image skeleton loader
 */
export interface ImageSkeletonProps {
  className?: string
  aspectRatio?: 'square' | 'video' | 'portrait'
}

export function ImageSkeleton({ className, aspectRatio = 'square' }: ImageSkeletonProps) {
  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]'
  }
  
  return (
    <Skeleton className={cn('w-full', aspectClasses[aspectRatio], className)} />
  )
}

/**
 * Profile skeleton loader
 */
export function ProfileSkeleton() {
  return (
    <div className="flex items-center gap-4">
      <Skeleton className="h-16 w-16 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[150px]" />
        <Skeleton className="h-3 w-[200px]" />
        <Skeleton className="h-3 w-[100px]" />
      </div>
    </div>
  )
}

/**
 * Stats card skeleton
 */
export function StatsCardSkeleton() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-8 w-[150px]" />
          <Skeleton className="h-3 w-[120px]" />
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Loading overlay
 */
export interface LoadingOverlayProps {
  visible?: boolean
  message?: string
  className?: string
}

export function LoadingOverlay({ visible, message = 'Loading...', className }: LoadingOverlayProps) {
  if (!visible) return null
  
  return (
    <div className={cn(
      'absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-50',
      className
    )}>
      <div className="bg-background p-4 rounded-lg shadow-lg flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="text-sm">{message}</span>
      </div>
    </div>
  )
}