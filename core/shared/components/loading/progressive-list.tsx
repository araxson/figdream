'use client'

import { ReactNode, useEffect, useState } from 'react'

export interface ProgressiveListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => ReactNode
  batchSize?: number
  delay?: number
  skeleton?: ReactNode
  onLoadComplete?: () => void
}

export function ProgressiveList<T>({
  items,
  renderItem,
  batchSize = 10,
  delay = 50,
  skeleton,
  onLoadComplete
}: ProgressiveListProps<T>) {
  const [visibleCount, setVisibleCount] = useState(batchSize)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (visibleCount >= items.length) {
      setIsLoading(false)
      onLoadComplete?.()
      return
    }

    const timer = setTimeout(() => {
      setVisibleCount(prev => Math.min(prev + batchSize, items.length))
    }, delay)

    return () => clearTimeout(timer)
  }, [visibleCount, items.length, batchSize, delay, onLoadComplete])

  return (
    <>
      {items.slice(0, visibleCount).map((item, index) => (
        <div key={index} className="animate-in fade-in slide-in-from-bottom-2">
          {renderItem(item, index)}
        </div>
      ))}
      {isLoading && skeleton}
    </>
  )
}