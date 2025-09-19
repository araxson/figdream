// Hook for navigation management and breadcrumb generation
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { featureRegistry } from '../lib/feature-registry'

interface Breadcrumb {
  label: string
  path: string
}

export function useAppNavigation() {
  const pathname = usePathname()
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([])
  const [currentRoute, setCurrentRoute] = useState<string | null>(null)

  useEffect(() => {
    if (!pathname) return

    // Generate breadcrumbs from path
    const segments = pathname.split('/').filter(Boolean)
    const crumbs: Breadcrumb[] = []

    let currentPath = ''
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`

      // Get feature name from registry
      const feature = Array.from(featureRegistry.getAllFeatures()).find(f =>
        f.path === currentPath || f.children?.some(c => c.path === currentPath)
      )

      if (feature) {
        crumbs.push({
          label: feature.name,
          path: currentPath
        })
      } else {
        // Format segment for display
        const label = segment
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')

        crumbs.push({
          label,
          path: currentPath
        })
      }
    })

    setBreadcrumbs(crumbs)
    setCurrentRoute(pathname)
  }, [pathname])

  // Navigation helpers
  const navigateTo = (path: string) => {
    window.location.href = path
  }

  const navigateBack = () => {
    window.history.back()
  }

  const navigateForward = () => {
    window.history.forward()
  }

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`)
  }

  const canGoBack = () => {
    return typeof window !== 'undefined' && window.history.length > 1
  }

  // Get parent route
  const getParentRoute = (): string | null => {
    if (!pathname) return null
    const segments = pathname.split('/').filter(Boolean)
    if (segments.length <= 1) return '/'
    segments.pop()
    return `/${segments.join('/')}`
  }

  // Get sibling routes
  const getSiblingRoutes = (): string[] => {
    if (!pathname) return []

    const parentPath = getParentRoute()
    if (!parentPath) return []

    // Find parent feature
    const parentFeature = featureRegistry.getAllFeatures().find(f =>
      f.path === parentPath
    )

    if (parentFeature?.children) {
      return parentFeature.children.map(c => c.path)
    }

    return []
  }

  return {
    currentRoute,
    breadcrumbs,
    navigateTo,
    navigateBack,
    navigateForward,
    isActive,
    canGoBack,
    getParentRoute,
    getSiblingRoutes
  }
}