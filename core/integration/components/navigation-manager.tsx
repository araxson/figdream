'use client'

// Dynamic navigation manager with role-based visibility and active state management
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { featureRegistry } from '../lib/feature-registry'
import type { NavigationItem, UserRole } from '../types'
import { cn } from '@/lib/utils'

interface NavigationManagerProps {
  role?: string
  onNavigate?: () => void
}

export function NavigationManager({ role = 'guest', onNavigate }: NavigationManagerProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>([])
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)

  // Load navigation items based on role
  useEffect(() => {
    const loadNavigation = async () => {
      setIsLoading(true)
      try {
        const features = featureRegistry.getFeaturesForRole(role as UserRole)

        const items: NavigationItem[] = features.map(feature => ({
          id: feature.id,
          label: feature.name,
          href: feature.path,
          roles: feature.roles,
          badge: feature.badge,
          children: feature.children?.map(child => ({
            id: child.id,
            label: child.name,
            href: child.path,
            roles: child.roles,
            badge: child.badge
          }))
        }))

        setNavigationItems(items)

        // Auto-expand active sections
        const activeSection = items.find(item =>
          pathname?.startsWith(item.href) ||
          item.children?.some(child => pathname?.startsWith(child.href))
        )
        if (activeSection) {
          setExpandedItems(new Set([activeSection.id]))
        }
      } catch (error) {
        console.error('Failed to load navigation:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadNavigation()
  }, [role, pathname])

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId)
    } else {
      newExpanded.add(itemId)
    }
    setExpandedItems(newExpanded)
  }

  const handleNavigation = (href: string) => {
    router.push(href)
    onNavigate?.()
  }

  const renderNavItem = (item: NavigationItem, level = 0) => {
    const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.has(item.id)

    return (
      <li key={item.id} className="relative">
        <div
          className={cn(
            'flex items-center justify-between rounded-md transition-colors',
            'hover:bg-accent hover:text-accent-foreground',
            isActive && 'bg-accent text-accent-foreground font-medium',
            level > 0 && 'ml-4'
          )}
        >
          <button
            onClick={() => {
              if (hasChildren) {
                toggleExpanded(item.id)
              } else {
                handleNavigation(item.href)
              }
            }}
            className="flex-1 flex items-center gap-3 px-3 py-2 text-left"
          >
            {/* Icon placeholder */}
            <div className="h-4 w-4 opacity-70">
              {getIconForRoute(item.href)}
            </div>

            <span className="flex-1">{item.label}</span>

            {/* Badge */}
            {item.badge && (
              <span className="ml-auto flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-primary px-2 text-xs font-medium text-primary-foreground">
                {item.badge}
              </span>
            )}

            {/* Expand/collapse indicator */}
            {hasChildren && (
              <div className="ml-2">
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>
            )}
          </button>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <ul className="mt-1 space-y-1">
            {item.children!.map(child => renderNavItem(child, level + 1))}
          </ul>
        )}
      </li>
    )
  }

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-muted animate-pulse rounded-md" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <nav className="flex flex-col h-full">
      {/* Logo/Brand */}
      <div className="p-4 border-b">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold">
            F
          </div>
          <span className="font-semibold text-lg">FigDream</span>
        </Link>
      </div>

      {/* Navigation items */}
      <div className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {navigationItems.map(item => renderNavItem(item))}
        </ul>
      </div>

      {/* Footer/User section */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-muted" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">User Name</p>
            <p className="text-xs text-muted-foreground truncate capitalize">
              {role.replace(/_/g, ' ')}
            </p>
          </div>
        </div>
      </div>
    </nav>
  )
}

// Icon mapping for different routes
function getIconForRoute(href: string): JSX.Element {
  if (href.includes('dashboard')) {
    return (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )
  }
  if (href.includes('appointments')) {
    return (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )
  }
  if (href.includes('customers')) {
    return (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    )
  }
  if (href.includes('staff')) {
    return (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )
  }
  if (href.includes('services')) {
    return (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    )
  }
  if (href.includes('analytics')) {
    return (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )
  }
  if (href.includes('settings')) {
    return (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  }
  // Default icon
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  )
}