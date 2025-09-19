// Performance Architecture Optimizer
// Advanced tools for implementing lazy loading, code splitting, and performance patterns

import { lazy, ComponentType } from 'react';

export interface PerformanceMetrics {
  bundleSize: number;
  loadTimes: Record<string, number>;
  chunkSizes: Record<string, number>;
  lazyComponents: string[];
  criticalPath: string[];
  performanceScore: number;
}

export interface LazyLoadingConfig {
  component: string;
  chunkName: string;
  priority: 'high' | 'medium' | 'low';
  preload: boolean;
  errorBoundary: boolean;
  loading: ComponentType | null;
}

export interface CodeSplitConfig {
  module: string;
  splitPoint: 'route' | 'feature' | 'component' | 'utility';
  priority: number;
  dependencies: string[];
  cacheStrategy: 'long-term' | 'medium-term' | 'short-term';
}

/**
 * Performance optimizer for React components and modules
 */
export class PerformanceOptimizer {
  private lazyComponents = new Map<string, LazyLoadingConfig>();
  private splitConfigs = new Map<string, CodeSplitConfig>();

  /**
   * Register component for lazy loading
   */
  registerLazyComponent(config: LazyLoadingConfig): void {
    this.lazyComponents.set(config.component, config);
  }

  /**
   * Generate lazy component factory
   */
  generateLazyComponent(componentPath: string): string {
    const config = this.lazyComponents.get(componentPath);
    if (!config) {
      throw new Error(`No lazy config found for ${componentPath}`);
    }

    const componentName = this.extractComponentName(componentPath);
    const chunkName = config.chunkName || this.generateChunkName(componentPath);

    return `
import { lazy, Suspense } from 'react';
import { ErrorBoundary } from '@/core/shared/components/error-boundary';
${config.loading ? `import { ${config.loading.name} } from '@/core/shared/components/loading';` : ''}

// Lazy load with chunk name for webpack
const ${componentName}Lazy = lazy(() =>
  import(
    /* webpackChunkName: "${chunkName}" */
    /* webpackPrefetch: ${config.preload} */
    '${componentPath}'
  )
);

export function ${componentName}WithSuspense(props: any) {
  const LoadingComponent = ${config.loading?.name || 'null'};

  return (
    ${config.errorBoundary ? '<ErrorBoundary>' : ''}
      <Suspense fallback={LoadingComponent ? <LoadingComponent /> : null}>
        <${componentName}Lazy {...props} />
      </Suspense>
    ${config.errorBoundary ? '</ErrorBoundary>' : ''}
  );
}

export { ${componentName}Lazy as ${componentName} };
`;
  }

  /**
   * Generate Next.js dynamic import configuration
   */
  generateDynamicImports(): Record<string, any> {
    const dynamicImports: Record<string, any> = {};

    for (const [component, config] of this.lazyComponents.entries()) {
      const componentName = this.extractComponentName(component);

      dynamicImports[componentName] = {
        dynamic: `() => import('${component}')`,
        loading: config.loading ? `() => <${config.loading.name} />` : 'null',
        ssr: config.priority === 'high', // SSR for high priority components
        suspense: true
      };
    }

    return dynamicImports;
  }

  /**
   * Generate webpack chunk optimization configuration
   */
  generateWebpackConfig(): any {
    return {
      optimization: {
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            // Vendor libraries
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: 10,
              enforce: true
            },
            // Shared utilities
            shared: {
              test: /[\\/]core[\\/]shared[\\/]/,
              name: 'shared',
              priority: 8,
              minChunks: 2
            },
            // UI components
            ui: {
              test: /[\\/]core[\\/]ui[\\/]/,
              name: 'ui',
              priority: 6,
              minChunks: 2
            },
            // Feature modules
            features: {
              test: /[\\/]core[\\/](?!shared|ui)[\\/]/,
              name: (module: any) => {
                const match = module.context.match(/core[\\/]([^[\\/]]+)/);
                return match ? `feature-${match[1]}` : 'features';
              },
              priority: 4,
              minChunks: 1,
              maxSize: 250000 // 250KB max chunk size
            }
          }
        },
        runtimeChunk: {
          name: 'runtime'
        }
      }
    };
  }

  /**
   * Generate service worker caching strategies
   */
  generateCacheStrategies(): Record<string, any> {
    const strategies: Record<string, any> = {};

    for (const [module, config] of this.splitConfigs.entries()) {
      const strategy = this.getCacheStrategy(config.cacheStrategy);

      strategies[module] = {
        urlPattern: new RegExp(`/_next/static/chunks/${this.generateChunkName(module)}`),
        handler: strategy.handler,
        options: strategy.options
      };
    }

    return {
      runtimeCaching: [
        // Static assets - long term cache
        {
          urlPattern: /^https?:\/\/.*\.(?:png|jpg|jpeg|svg|gif|webp)$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'images',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
            }
          }
        },
        // API routes - network first
        {
          urlPattern: /^https?:\/\/.*\/api\//,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            networkTimeoutSeconds: 3,
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 5 * 60 // 5 minutes
            }
          }
        },
        // Pages - stale while revalidate
        {
          urlPattern: /^https?:\/\/.*\//,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'pages',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 24 * 60 * 60 // 24 hours
            }
          }
        }
      ]
    };
  }

  /**
   * Generate performance monitoring setup
   */
  generatePerformanceMonitoring(): string {
    return `
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

// Performance monitoring setup
export function initPerformanceMonitoring() {
  // Core Web Vitals
  getCLS(console.log);
  getFID(console.log);
  getFCP(console.log);
  getLCP(console.log);
  getTTFB(console.log);

  // Custom performance metrics
  measureComponentLoadTimes();
  measureBundleSize();
  measureMemoryUsage();
}

function measureComponentLoadTimes() {
  // Measure lazy component load times
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.name.includes('chunk')) {
      }
    }
  });

  observer.observe({ entryTypes: ['measure'] });
}

function measureBundleSize() {
  // Measure and report bundle sizes
  if ('performance' in window && 'getEntriesByType' in performance) {
    const navigationEntries = performance.getEntriesByType('navigation');
    const resourceEntries = performance.getEntriesByType('resource');

      totalResources: resourceEntries.length,
      totalTransferSize: resourceEntries.reduce((sum: number, entry: any) =>
        sum + (entry.transferSize || 0), 0
      )
    });
  }
}

function measureMemoryUsage() {
  // Measure memory usage if available
  if ('memory' in performance) {
    const memory = (performance as any).memory;
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit
    });
  }
}

// Component performance HOC
export function withPerformanceTracking<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  componentName: string
) {
  return function PerformanceTrackedComponent(props: T) {
    const renderStart = performance.now();

    React.useEffect(() => {
      const renderEnd = performance.now();
    });

    return <WrappedComponent {...props} />;
  };
}
`;
  }

  /**
   * Generate resource preloading strategies
   */
  generatePreloadingStrategies(): string {
    return `
import { useEffect } from 'react';

// Critical resource preloading
export function PreloadCriticalResources() {
  useEffect(() => {
    // Preload critical chunks
    const criticalChunks = [
      '/static/chunks/shared.js',
      '/static/chunks/ui.js',
      '/static/chunks/auth.js'
    ];

    criticalChunks.forEach(chunk => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'script';
      link.href = chunk;
      document.head.appendChild(link);
    });

    // Preload critical images
    const criticalImages = [
      '/images/logo.svg',
      '/images/hero-bg.jpg'
    ];

    criticalImages.forEach(image => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = image;
      document.head.appendChild(link);
    });
  }, []);

  return null;
}

// Intersection Observer for lazy loading images
export function useLazyImage(src: string, threshold = 0.1) {
  const [imageSrc, setImageSrc] = React.useState<string | null>(null);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setImageSrc(src);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src, threshold]);

  const handleLoad = () => setIsLoaded(true);

  return { imageSrc, isLoaded, imgRef, handleLoad };
}

// Prefetch components on hover
export function usePrefetchOnHover(componentPath: string) {
  const handleMouseEnter = React.useCallback(() => {
    import(componentPath).catch(console.error);
  }, [componentPath]);

  return { onMouseEnter: handleMouseEnter };
}
`;
  }

  /**
   * Generate virtual scrolling implementation
   */
  generateVirtualScrolling(): string {
    return `
import React, { useState, useEffect, useMemo } from 'react';

interface VirtualScrollProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
}

export function VirtualScroll<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5
}: VirtualScrollProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.floor((scrollTop + containerHeight) / itemHeight) + overscan
    );
    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.startIndex * itemHeight;

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange.startIndex, visibleRange.endIndex]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  return (
    <div
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: \`translateY(\${offsetY}px)\`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {visibleItems.map((item, index) =>
            renderItem(item, visibleRange.startIndex + index)
          )}
        </div>
      </div>
    </div>
  );
}

// Hook for intersection-based loading
export function useInfiniteScroll<T>(
  fetchMore: () => Promise<T[]>,
  hasMore: boolean,
  threshold = 1.0
) {
  const [isLoading, setIsLoading] = useState(false);
  const sentinelRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (entry.isIntersecting && hasMore && !isLoading) {
          setIsLoading(true);
          try {
            await fetchMore();
          } finally {
            setIsLoading(false);
          }
        }
      },
      { threshold }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, [fetchMore, hasMore, isLoading, threshold]);

  return { sentinelRef, isLoading };
}
`;
  }

  private extractComponentName(path: string): string {
    const parts = path.split('/');
    const fileName = parts[parts.length - 1];
    return fileName.replace(/\.(tsx?|jsx?)$/, '').replace(/[-_]/g, '');
  }

  private generateChunkName(path: string): string {
    const parts = path.split('/');
    const module = parts.find(part => part !== 'core' && part !== 'components');
    const component = this.extractComponentName(path);
    return module ? `${module}-${component}` : component;
  }

  private getCacheStrategy(strategy: string): any {
    switch (strategy) {
      case 'long-term':
        return {
          handler: 'CacheFirst',
          options: {
            expiration: {
              maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
            }
          }
        };
      case 'medium-term':
        return {
          handler: 'StaleWhileRevalidate',
          options: {
            expiration: {
              maxAgeSeconds: 24 * 60 * 60 // 24 hours
            }
          }
        };
      case 'short-term':
        return {
          handler: 'NetworkFirst',
          options: {
            expiration: {
              maxAgeSeconds: 5 * 60 // 5 minutes
            }
          }
        };
      default:
        return {
          handler: 'StaleWhileRevalidate',
          options: {}
        };
    }
  }
}

/**
 * Factory function to create performance optimizer
 */
export function createPerformanceOptimizer(): PerformanceOptimizer {
  return new PerformanceOptimizer();
}

/**
 * Performance optimization utilities
 */
export class PerformanceUtils {
  /**
   * Measure component render time
   */
  static measureRenderTime(componentName: string) {
    return function<T extends React.ComponentType<any>>(WrappedComponent: T): T {
      const MeasuredComponent = (props: any) => {
        const startTime = performance.now();

        React.useLayoutEffect(() => {
          const endTime = performance.now();
        });

        return React.createElement(WrappedComponent, props);
      };

      return MeasuredComponent as T;
    };
  }

  /**
   * Debounce expensive operations
   */
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  /**
   * Throttle high-frequency events
   */
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
}