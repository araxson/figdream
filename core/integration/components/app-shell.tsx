'use client'

// Master application shell that wraps all features with global providers and contexts
import { ReactNode, useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { NavigationManager } from './navigation-manager'
import { ContextOrchestrator } from './context-orchestrator'
import { GlobalErrorBoundary } from './global-error-boundary'
import { PerformanceMonitor } from './performance-monitor'
import { NotificationCenter } from './notification-center'
import { useGlobalState } from '../hooks/use-global-state'
import { useAppNavigation } from '../hooks/use-app-navigation'
import { cn } from '@/lib/utils'

interface AppShellProps {
  children: ReactNode
  role?: string
}

export function AppShell({ children, role }: AppShellProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { isLoading, error } = useGlobalState()
  const { currentRoute, breadcrumbs } = useAppNavigation()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Handle sidebar visibility based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    handleResize()

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K for search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        // Trigger global search
        document.dispatchEvent(new CustomEvent('open-search'))
      }

      // Cmd/Ctrl + B for sidebar toggle
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault()
        setSidebarOpen(prev => !prev)
      }

      // Cmd/Ctrl + N for notifications
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault()
        router.push('/notifications')
      }

      // Escape to close modals
      if (e.key === 'Escape') {
        document.dispatchEvent(new CustomEvent('close-modals'))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [router])

  if (!isMounted) {
    return null
  }

  // Check if current route should show navigation
  const isAuthRoute = pathname?.startsWith('/login') ||
                      pathname?.startsWith('/register') ||
                      pathname?.startsWith('/forgot-password') ||
                      pathname?.startsWith('/reset-password')

  const isPublicRoute = pathname === '/' ||
                        pathname?.startsWith('/about') ||
                        pathname?.startsWith('/contact') ||
                        pathname?.startsWith('/privacy') ||
                        pathname?.startsWith('/terms')

  const showNavigation = !isAuthRoute && !isPublicRoute

  return (
    <ContextOrchestrator>
      <GlobalErrorBoundary>
        <PerformanceMonitor>
          <div className="min-h-screen bg-background">
            {/* Global loading indicator */}
            {isLoading && (
              <div className="fixed top-0 left-0 right-0 h-1 bg-primary/20 z-50">
                <div className="h-full bg-primary animate-pulse" />
              </div>
            )}

            {/* Main layout */}
            <div className="flex h-screen overflow-hidden">
              {/* Sidebar navigation */}
              {showNavigation && (
                <aside
                  className={cn(
                    'fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-200 ease-in-out bg-card border-r',
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full',
                    'lg:translate-x-0 lg:static lg:inset-0'
                  )}
                >
                  <NavigationManager
                    role={role}
                    onNavigate={() => {
                      if (window.innerWidth < 1024) {
                        setSidebarOpen(false)
                      }
                    }}
                  />
                </aside>
              )}

              {/* Main content area */}
              <main className="flex-1 flex flex-col overflow-hidden">
                {/* Top header bar */}
                {showNavigation && (
                  <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-6">
                    <button
                      onClick={() => setSidebarOpen(!sidebarOpen)}
                      className="lg:hidden p-2 hover:bg-accent rounded-md"
                      aria-label="Toggle sidebar"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d={sidebarOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                        />
                      </svg>
                    </button>

                    {/* Breadcrumbs */}
                    <nav className="flex-1 flex items-center space-x-2 text-sm text-muted-foreground">
                      {breadcrumbs.map((crumb, index) => (
                        <div key={crumb.path} className="flex items-center">
                          {index > 0 && <span className="mx-2">/</span>}
                          {index === breadcrumbs.length - 1 ? (
                            <span className="text-foreground font-medium">{crumb.label}</span>
                          ) : (
                            <button
                              onClick={() => router.push(crumb.path)}
                              className="hover:text-foreground transition-colors"
                            >
                              {crumb.label}
                            </button>
                          )}
                        </div>
                      ))}
                    </nav>

                    {/* Quick actions */}
                    <div className="flex items-center gap-2">
                      {/* Search trigger */}
                      <button
                        onClick={() => document.dispatchEvent(new CustomEvent('open-search'))}
                        className="p-2 hover:bg-accent rounded-md"
                        aria-label="Search"
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                      </button>

                      {/* Notifications */}
                      <NotificationCenter />

                      {/* Theme toggle */}
                      <button
                        onClick={() => document.dispatchEvent(new CustomEvent('toggle-theme'))}
                        className="p-2 hover:bg-accent rounded-md"
                        aria-label="Toggle theme"
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                          />
                        </svg>
                      </button>

                      {/* User menu */}
                      <button
                        onClick={() => router.push('/settings')}
                        className="p-2 hover:bg-accent rounded-md"
                        aria-label="User settings"
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </button>
                    </div>
                  </header>
                )}

                {/* Page content */}
                <div className="flex-1 overflow-auto">
                  <div className="container mx-auto p-6">
                    {error && (
                      <div className="mb-6 p-4 bg-destructive/10 border border-destructive rounded-lg">
                        <p className="text-sm text-destructive">{error.message}</p>
                      </div>
                    )}
                    {children}
                  </div>
                </div>
              </main>
            </div>

            {/* Mobile sidebar overlay */}
            {showNavigation && sidebarOpen && (
              <div
                className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}
          </div>
        </PerformanceMonitor>
      </GlobalErrorBoundary>
    </ContextOrchestrator>
  )
}