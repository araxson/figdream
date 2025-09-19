'use client'

import { ReactNode, useEffect, useState, useRef } from 'react'
import { SkeletonLoader } from './skeleton-loader'

export interface LazyLoadProps {
  children: ReactNode
  placeholder?: ReactNode
  rootMargin?: string
  threshold?: number
  onVisible?: () => void
}

export function LazyLoad({
  children,
  placeholder,
  rootMargin = '100px',
  threshold = 0.1,
  onVisible
}: LazyLoadProps) {
  const [isVisible, setIsVisible] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true)
          onVisible?.()
        }
      },
      { rootMargin, threshold }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [rootMargin, threshold, onVisible, isVisible])

  return (
    <div ref={containerRef}>
      {isVisible ? children : placeholder || <SkeletonLoader />}
    </div>
  )
}