// Integration types for the unified platform
import type { Database } from '@/types/database.types'

export type UserRole = Database['public']['Enums']['role']

export interface FeatureModule {
  id: string
  name: string
  path: string
  icon?: string
  roles: UserRole[]
  badge?: string | number
  children?: FeatureModule[]
  isNew?: boolean
  isComingSoon?: boolean
  description?: string
}

export interface NavigationItem {
  id: string
  label: string
  href: string
  icon?: string
  badge?: string | number
  roles: UserRole[]
  children?: NavigationItem[]
  isActive?: boolean
  isExpanded?: boolean
}

export interface AppContext {
  user: {
    id: string
    email: string
    role: UserRole
    profile?: {
      full_name?: string
      avatar_url?: string
      salon_id?: string
      staff_id?: string
    }
  } | null
  salon: {
    id: string
    name: string
    slug: string
    settings?: Record<string, any>
  } | null
  notifications: {
    count: number
    unread: number
  }
  features: {
    [key: string]: boolean
  }
}

export interface RouteGuard {
  path: string | RegExp
  roles?: UserRole[]
  redirect?: string
  condition?: (context: AppContext) => boolean
}

export interface PerformanceMetric {
  name: string
  value: number
  unit: 'ms' | 'kb' | 'mb' | '%'
  timestamp: number
  category: 'navigation' | 'api' | 'render' | 'resource'
}

export interface GlobalState {
  isLoading: boolean
  error: Error | null
  notifications: Notification[]
  activeModals: string[]
  sidebarOpen: boolean
  theme: 'light' | 'dark' | 'system'
}

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}