/**
 * Image Optimization Utilities for FigDream
 * Handles image processing, optimization, and delivery
 */

import sharp from 'sharp'
import { createClient } from '@/lib/database/supabase/server'

/**
 * Image format configurations
 */
export const imageFormats = {
  webp: {
    quality: 85,
    effort: 6,
  },
  avif: {
    quality: 80,
    effort: 7,
  },
  jpeg: {
    quality: 85,
    progressive: true,
    mozjpeg: true,
  },
  png: {
    compressionLevel: 9,
    adaptive: true,
  },
} as const

/**
 * Responsive image sizes
 */
export const responsiveSizes = {
  thumbnail: { width: 150, height: 150 },
  small: { width: 320, height: 240 },
  medium: { width: 640, height: 480 },
  large: { width: 1024, height: 768 },
  xlarge: { width: 1920, height: 1080 },
  '2k': { width: 2560, height: 1440 },
  '4k': { width: 3840, height: 2160 },
} as const

/**
 * Optimize and resize image
 */
export async function optimizeImage(
  input: Buffer | string,
  options: {
    width?: number
    height?: number
    format?: keyof typeof imageFormats
    quality?: number
    fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'
  } = {}
): Promise<Buffer> {
  const {
    width,
    height,
    format = 'webp',
    quality,
    fit = 'cover',
  } = options

  let pipeline = sharp(input)

  // Resize if dimensions provided
  if (width || height) {
    pipeline = pipeline.resize(width, height, { fit })
  }

  // Apply format-specific optimizations
  switch (format) {
    case 'webp':
      pipeline = pipeline.webp({
        quality: quality || imageFormats.webp.quality,
        effort: imageFormats.webp.effort,
      })
      break
    case 'avif':
      pipeline = pipeline.avif({
        quality: quality || imageFormats.avif.quality,
        effort: imageFormats.avif.effort,
      })
      break
    case 'jpeg':
      pipeline = pipeline.jpeg({
        quality: quality || imageFormats.jpeg.quality,
        progressive: imageFormats.jpeg.progressive,
        mozjpeg: imageFormats.jpeg.mozjpeg,
      })
      break
    case 'png':
      pipeline = pipeline.png({
        compressionLevel: imageFormats.png.compressionLevel,
        adaptive: imageFormats.png.adaptive,
      })
      break
  }

  return pipeline.toBuffer()
}

/**
 * Generate responsive image variants
 */
export async function generateResponsiveImages(
  input: Buffer | string,
  sizes: (keyof typeof responsiveSizes)[] = ['small', 'medium', 'large']
): Promise<Record<string, Buffer>> {
  const variants: Record<string, Buffer> = {}

  for (const size of sizes) {
    const { width, height } = responsiveSizes[size]
    
    // Generate WebP variant
    variants[`${size}-webp`] = await optimizeImage(input, {
      width,
      height,
      format: 'webp',
    })

    // Generate AVIF variant for modern browsers
    variants[`${size}-avif`] = await optimizeImage(input, {
      width,
      height,
      format: 'avif',
    })

    // Generate fallback JPEG
    variants[`${size}-jpeg`] = await optimizeImage(input, {
      width,
      height,
      format: 'jpeg',
    })
  }

  return variants
}

/**
 * Upload optimized image to Supabase Storage
 */
export async function uploadOptimizedImage(
  bucket: string,
  path: string,
  input: Buffer | string,
  options: {
    generateVariants?: boolean
    sizes?: (keyof typeof responsiveSizes)[]
  } = {}
): Promise<{
  url: string
  variants?: Record<string, string>
}> {
  const supabase = await createClient()
  const { generateVariants = true, sizes } = options

  // Upload original optimized image
  const optimized = await optimizeImage(input)
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, optimized, {
      contentType: 'image/webp',
      upsert: true,
    })

  if (uploadError) {
    throw new Error(`Failed to upload image: ${uploadError.message}`)
  }

  const result: {
    url: string
    variants?: Record<string, string>
  } = {
    url: supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl,
  }

  // Generate and upload variants if requested
  if (generateVariants) {
    const variants = await generateResponsiveImages(input, sizes)
    const variantUrls: Record<string, string> = {}

    for (const [variantName, variantBuffer] of Object.entries(variants)) {
      const variantPath = `${path.replace(/\.[^.]+$/, '')}-${variantName}.${
        variantName.endsWith('avif') ? 'avif' : 
        variantName.endsWith('webp') ? 'webp' : 'jpg'
      }`

      const { error: variantError } = await supabase.storage
        .from(bucket)
        .upload(variantPath, variantBuffer, {
          contentType: `image/${variantName.split('-').pop()}`,
          upsert: true,
        })

      if (!variantError) {
        variantUrls[variantName] = supabase.storage
          .from(bucket)
          .getPublicUrl(variantPath).data.publicUrl
      }
    }

    result.variants = variantUrls
  }

  return result
}

/**
 * Generate blur placeholder for images
 */
export async function generateBlurPlaceholder(
  input: Buffer | string
): Promise<string> {
  const placeholder = await sharp(input)
    .resize(10, 10, { fit: 'inside' })
    .blur()
    .webp({ quality: 20 })
    .toBuffer()

  return `data:image/webp;base64,${placeholder.toString('base64')}`
}

/**
 * Extract dominant colors from image
 */
export async function extractDominantColors(
  input: Buffer | string,
  count: number = 5
): Promise<string[]> {
  const { dominant } = await sharp(input).stats()
  
  // This is a simplified version - in production, you'd use a proper
  // color extraction library like node-vibrant
  return [`rgb(${dominant.r}, ${dominant.g}, ${dominant.b})`]
}

/**
 * Lazy loading image component configuration
 */
export const lazyImageConfig = {
  // Intersection Observer options
  observerOptions: {
    root: null,
    rootMargin: '50px',
    threshold: 0.01,
  },
  
  // Loading states
  placeholderSrc: '/images/placeholder.svg',
  errorSrc: '/images/error.svg',
  
  // Sizes for srcset generation
  sizes: [320, 640, 768, 1024, 1280, 1536, 1920, 2560, 3840],
  
  // Quality settings
  quality: {
    thumbnail: 60,
    low: 70,
    medium: 80,
    high: 90,
    lossless: 100,
  },
}

/**
 * Generate srcset string for responsive images
 */
export function generateSrcSet(
  baseUrl: string,
  sizes: number[] = lazyImageConfig.sizes
): string {
  return sizes
    .map(size => `${baseUrl}?w=${size} ${size}w`)
    .join(', ')
}

/**
 * Generate sizes attribute for responsive images
 */
export function generateSizes(breakpoints: {
  mobile?: number
  tablet?: number
  desktop?: number
} = {}): string {
  const {
    mobile = 100,
    tablet = 50,
    desktop = 33,
  } = breakpoints

  return `(max-width: 640px) ${mobile}vw, (max-width: 1024px) ${tablet}vw, ${desktop}vw`
}

/**
 * Image CDN URL builder
 */
export class ImageCDN {
  private baseUrl: string

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_IMAGE_CDN_URL || '') {
    this.baseUrl = baseUrl
  }

  /**
   * Build optimized image URL
   */
  buildUrl(
    path: string,
    params: {
      width?: number
      height?: number
      quality?: number
      format?: 'auto' | 'webp' | 'avif' | 'jpeg' | 'png'
      fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'
      blur?: number
      sharpen?: number
      brightness?: number
      contrast?: number
      saturation?: number
    } = {}
  ): string {
    const url = new URL(path, this.baseUrl)
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value))
      }
    })

    return url.toString()
  }

  /**
   * Generate picture element sources
   */
  generatePictureSources(
    path: string,
    options: {
      sizes?: (keyof typeof responsiveSizes)[]
      formats?: ('avif' | 'webp' | 'jpeg')[]
    } = {}
  ): Array<{
    srcset: string
    type: string
    media?: string
  }> {
    const {
      sizes = ['small', 'medium', 'large'],
      formats = ['avif', 'webp', 'jpeg'],
    } = options

    const sources: Array<{
      srcset: string
      type: string
      media?: string
    }> = []

    for (const format of formats) {
      const srcset = sizes
        .map(size => {
          const { width } = responsiveSizes[size]
          const url = this.buildUrl(path, { width, format })
          return `${url} ${width}w`
        })
        .join(', ')

      sources.push({
        srcset,
        type: `image/${format}`,
      })
    }

    return sources
  }
}

// Export singleton instance
export const imageCDN = new ImageCDN()

/**
 * Preload critical images
 */
export function preloadCriticalImages(urls: string[]): void {
  if (typeof window === 'undefined') return

  urls.forEach(url => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = url
    link.setAttribute('fetchpriority', 'high')
    document.head.appendChild(link)
  })
}

/**
 * Progressive image loading strategy
 */
export class ProgressiveImageLoader {
  private loaded: Set<string> = new Set()
  private loading: Map<string, Promise<void>> = new Map()

  /**
   * Load image progressively
   */
  async load(url: string): Promise<void> {
    // Check if already loaded
    if (this.loaded.has(url)) {
      return Promise.resolve()
    }

    // Check if currently loading
    if (this.loading.has(url)) {
      return this.loading.get(url)!
    }

    // Start loading
    const loadPromise = new Promise<void>((resolve, reject) => {
      const img = new Image()
      
      img.onload = () => {
        this.loaded.add(url)
        this.loading.delete(url)
        resolve()
      }
      
      img.onerror = () => {
        this.loading.delete(url)
        reject(new Error(`Failed to load image: ${url}`))
      }
      
      img.src = url
    })

    this.loading.set(url, loadPromise)
    return loadPromise
  }

  /**
   * Preload multiple images
   */
  async preload(urls: string[]): Promise<void[]> {
    return Promise.all(urls.map(url => this.load(url)))
  }

  /**
   * Clear cache
   */
  clear(): void {
    this.loaded.clear()
    this.loading.clear()
  }
}

// Export singleton instance
export const imageLoader = new ProgressiveImageLoader()