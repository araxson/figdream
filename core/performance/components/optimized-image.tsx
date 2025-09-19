'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  priority?: boolean
  className?: string
  fill?: boolean
  sizes?: string
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  onLoad?: () => void
  fallbackSrc?: string
  lazy?: boolean
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className,
  fill = false,
  sizes,
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
  onLoad,
  fallbackSrc = '/placeholder.jpg',
  lazy = true
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [currentSrc, setCurrentSrc] = useState(src)

  // Reset error state when src changes
  useEffect(() => {
    setError(false)
    setCurrentSrc(src)
    setIsLoading(true)
  }, [src])

  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    setError(true)
    setIsLoading(false)
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc)
    }
  }

  // Common image props
  const imageProps = {
    src: currentSrc,
    alt,
    quality,
    className: cn(
      'transition-opacity duration-300',
      isLoading ? 'opacity-0' : 'opacity-100',
      className
    ),
    onLoad: handleLoad,
    onError: handleError,
    ...(placeholder === 'blur' && blurDataURL ? { placeholder: 'blur' as const, blurDataURL } : {}),
    ...(priority ? { priority } : { loading: lazy ? 'lazy' as const : 'eager' as const })
  }

  return (
    <div className={cn('relative overflow-hidden', fill && 'w-full h-full')}>
      {isLoading && (
        <Skeleton
          className={cn(
            'absolute inset-0',
            !fill && width && height && `w-[${width}px] h-[${height}px]`
          )}
        />
      )}

      {fill ? (
        <Image
          {...imageProps}
          fill
          sizes={sizes || '100vw'}
        />
      ) : (
        <Image
          {...imageProps}
          width={width || 500}
          height={height || 500}
          sizes={sizes}
        />
      )}

      {error && !currentSrc.includes(fallbackSrc!) && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <span className="text-xs text-muted-foreground">Failed to load image</span>
        </div>
      )}
    </div>
  )
}

// Avatar image optimization wrapper
interface OptimizedAvatarProps {
  src?: string | null
  alt: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  fallback?: string
}

const avatarSizes = {
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80
}

export function OptimizedAvatar({
  src,
  alt,
  size = 'md',
  className,
  fallback
}: OptimizedAvatarProps) {
  const dimension = avatarSizes[size]

  if (!src) {
    return (
      <div
        className={cn(
          'rounded-full bg-muted flex items-center justify-center',
          `w-[${dimension}px] h-[${dimension}px]`,
          className
        )}
      >
        <span className="text-sm font-medium">
          {fallback || alt.slice(0, 2).toUpperCase()}
        </span>
      </div>
    )
  }

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={dimension}
      height={dimension}
      className={cn('rounded-full', className)}
      sizes={`${dimension}px`}
      quality={90}
    />
  )
}

// Gallery image with lightbox support
interface GalleryImageProps extends OptimizedImageProps {
  onClick?: () => void
  thumbnail?: boolean
}

export function GalleryImage({
  thumbnail = false,
  onClick,
  ...imageProps
}: GalleryImageProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className={cn(
        'relative cursor-pointer overflow-hidden rounded-lg',
        'transition-transform duration-300',
        isHovered && 'scale-105'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <OptimizedImage
        {...imageProps}
        sizes={thumbnail ? '(max-width: 768px) 100vw, 200px' : imageProps.sizes}
        quality={thumbnail ? 60 : imageProps.quality}
      />

      {isHovered && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
          <div className="bg-white/90 rounded-full p-2">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
              />
            </svg>
          </div>
        </div>
      )}
    </div>
  )
}

// Hero image with responsive sizes
interface HeroImageProps extends Omit<OptimizedImageProps, 'sizes'> {
  mobileHeight?: number
  desktopHeight?: number
}

export function HeroImage({
  mobileHeight = 300,
  desktopHeight = 600,
  ...imageProps
}: HeroImageProps) {
  return (
    <div className="relative w-full">
      <div className={`h-[${mobileHeight}px] md:h-[${desktopHeight}px]`}>
        <OptimizedImage
          {...imageProps}
          fill
          priority
          sizes="100vw"
          quality={85}
        />
      </div>
    </div>
  )
}

// Product image with zoom capability
interface ProductImageProps extends OptimizedImageProps {
  enableZoom?: boolean
}

export function ProductImage({
  enableZoom = true,
  ...imageProps
}: ProductImageProps) {
  const [isZoomed, setIsZoomed] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enableZoom) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setMousePosition({ x, y })
  }

  return (
    <div
      className="relative overflow-hidden rounded-lg"
      onMouseEnter={() => enableZoom && setIsZoomed(true)}
      onMouseLeave={() => enableZoom && setIsZoomed(false)}
      onMouseMove={handleMouseMove}
    >
      <OptimizedImage
        {...imageProps}
        className={cn(
          imageProps.className,
          isZoomed && 'scale-150 transition-transform duration-300'
        )}
        style={
          isZoomed
            ? {
                transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`
              }
            : undefined
        }
      />
    </div>
  )
}