import { useState, useEffect } from 'react'

interface UseSkeletonOptions {
  delay?: number
  minDuration?: number
}

export function useSkeleton(
  isLoading: boolean,
  options: UseSkeletonOptions = {}
) {
  const { delay = 0, minDuration = 500 } = options
  const [showSkeleton, setShowSkeleton] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)

  useEffect(() => {
    let delayTimer: NodeJS.Timeout | null = null
    let minDurationTimer: NodeJS.Timeout | null = null

    if (isLoading) {
      if (delay > 0) {
        delayTimer = setTimeout(() => {
          setShowSkeleton(true)
          setStartTime(Date.now())
        }, delay)
      } else {
        setShowSkeleton(true)
        setStartTime(Date.now())
      }
    } else if (showSkeleton && startTime) {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, minDuration - elapsed)
      
      if (remaining > 0) {
        minDurationTimer = setTimeout(() => {
          setShowSkeleton(false)
          setStartTime(null)
        }, remaining)
      } else {
        setShowSkeleton(false)
        setStartTime(null)
      }
    }

    return () => {
      if (delayTimer) clearTimeout(delayTimer)
      if (minDurationTimer) clearTimeout(minDurationTimer)
    }
  }, [isLoading, delay, minDuration, showSkeleton, startTime])

  return showSkeleton
}