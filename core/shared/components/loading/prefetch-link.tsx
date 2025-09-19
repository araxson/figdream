'use client'

import { ReactNode, useRef, useCallback } from 'react'
import { prefetchManager } from './prefetch-manager'

export interface PrefetchLinkProps {
  href: string
  prefetchFn: () => Promise<any>
  children: ReactNode
  className?: string
  prefetchDelay?: number
}

export function PrefetchLink({
  href,
  prefetchFn,
  children,
  className,
  prefetchDelay = 200
}: PrefetchLinkProps) {
  const timeoutRef = useRef<NodeJS.Timeout>()

  const handlePrefetch = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      prefetchManager.prefetch(href, prefetchFn)
    }, prefetchDelay)
  }, [href, prefetchFn, prefetchDelay])

  const handleCancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }, [])

  return (
    <a
      href={href}
      className={className}
      onMouseEnter={handlePrefetch}
      onFocus={handlePrefetch}
      onMouseLeave={handleCancel}
      onBlur={handleCancel}
    >
      {children}
    </a>
  )
}