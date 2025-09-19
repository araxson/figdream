'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export interface ProgressiveImageProps {
  src: string
  alt: string
  className?: string
  placeholderSrc?: string
  onLoad?: () => void
}

export function ProgressiveImage({
  src,
  alt,
  className,
  placeholderSrc,
  onLoad
}: ProgressiveImageProps) {
  const [currentSrc, setCurrentSrc] = useState(placeholderSrc || '')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const img = new Image()
    img.src = src

    img.onload = () => {
      setCurrentSrc(src)
      setIsLoading(false)
      onLoad?.()
    }

    return () => {
      img.onload = null
    }
  }, [src, onLoad])

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <img
        src={currentSrc}
        alt={alt}
        className={cn(
          'w-full h-full object-cover transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
      />
    </div>
  )
}