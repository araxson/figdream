'use client'

import { cn } from '@/lib/utils'

export function ContentPlaceholder({
  lines = 3,
  className
}: {
  lines?: number
  className?: string
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-shimmer"
          style={{
            width: `${100 - i * 10}%`,
            animationDelay: `${i * 100}ms`
          }}
        />
      ))}
    </div>
  )
}