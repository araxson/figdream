'use client'

// Manages all feature contexts and provides unified state management
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import type { AppContext, GlobalState, Notification } from '../types'

interface ContextOrchestratorProps {
  children: ReactNode
}

// Global app context
const AppStateContext = createContext<AppContext | null>(null)
const GlobalStateContext = createContext<GlobalState | null>(null)
const ActionsContext = createContext<{
  showNotification: (notification: Omit<Notification, 'id'>) => void
  clearNotifications: () => void
  setLoading: (loading: boolean) => void
  setError: (error: Error | null) => void
  openModal: (modalId: string) => void
  closeModal: (modalId: string) => void
  updateTheme: (theme: 'light' | 'dark' | 'system') => void
  refreshContext: () => Promise<void>
} | null>(null)

export function ContextOrchestrator({ children }: ContextOrchestratorProps) {
  const router = useRouter()

  // App context state
  const [appContext, setAppContext] = useState<AppContext>({
    user: null,
    salon: null,
    notifications: { count: 0, unread: 0 },
    features: {}
  })

  // Global UI state
  const [globalState, setGlobalState] = useState<GlobalState>({
    isLoading: false,
    error: null,
    notifications: [],
    activeModals: [],
    sidebarOpen: true,
    theme: 'system'
  })

  // Load initial context
  useEffect(() => {
    loadContext()

    // Set up event listeners for global events
    const handleSearch = () => openModal('search')
    const handleCloseModals = () => setGlobalState(prev => ({ ...prev, activeModals: [] }))
    const handleToggleTheme = () => toggleTheme()

    document.addEventListener('open-search', handleSearch)
    document.addEventListener('close-modals', handleCloseModals)
    document.addEventListener('toggle-theme', handleToggleTheme)

    return () => {
      document.removeEventListener('open-search', handleSearch)
      document.removeEventListener('close-modals', handleCloseModals)
      document.removeEventListener('toggle-theme', handleToggleTheme)
    }
  }, [])

  // Sync theme with system/user preference
  useEffect(() => {
    const theme = globalState.theme
    const root = document.documentElement

    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.toggle('dark', prefersDark)
    } else {
      root.classList.toggle('dark', theme === 'dark')
    }
  }, [globalState.theme])

  // Load context from API/storage
  const loadContext = async () => {
    try {
      setGlobalState(prev => ({ ...prev, isLoading: true }))

      // Load user session using Server Action
      const { getSessionAction } = await import('@/core/auth/actions/session-actions')
      const session = await getSessionAction()

      if (session.user) {
        setAppContext(prev => ({
          ...prev,
          user: {
            id: session.user.id,
            email: session.user.email,
            role: session.user.role,
            profile: session.user.profile
          },
          salon: session.salon
        }))

        // Load notifications count
        loadNotificationCount(session.user.id)
      }

      // Load feature flags - TODO: Implement feature flags Server Action when needed
      const features = {}
      setAppContext(prev => ({ ...prev, features }))

      // Load saved theme
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system'
      if (savedTheme) {
        setGlobalState(prev => ({ ...prev, theme: savedTheme }))
      }
    } catch (error) {
      console.error('Failed to load context:', error)
      setGlobalState(prev => ({
        ...prev,
        error: error as Error
      }))
    } finally {
      setGlobalState(prev => ({ ...prev, isLoading: false }))
    }
  }

  // Load notification count
  const loadNotificationCount = async (userId: string) => {
    try {
      const { getNotificationCountAction } = await import('@/core/auth/actions/session-actions')
      const data = await getNotificationCountAction()
      setAppContext(prev => ({
        ...prev,
        notifications: {
          count: data.total || 0,
          unread: data.unread || 0
        }
      }))
    } catch (error) {
      console.error('Failed to load notification count:', error)
    }
  }

  // Show notification
  const showNotification = (notification: Omit<Notification, 'id'>) => {
    const id = `notification-${Date.now()}`
    const newNotification: Notification = { ...notification, id }

    setGlobalState(prev => ({
      ...prev,
      notifications: [...prev.notifications, newNotification]
    }))

    // Auto-dismiss after duration
    if (notification.duration !== 0) {
      setTimeout(() => {
        setGlobalState(prev => ({
          ...prev,
          notifications: prev.notifications.filter(n => n.id !== id)
        }))
      }, notification.duration || 5000)
    }
  }

  // Clear notifications
  const clearNotifications = () => {
    setGlobalState(prev => ({ ...prev, notifications: [] }))
  }

  // Set loading state
  const setLoading = (loading: boolean) => {
    setGlobalState(prev => ({ ...prev, isLoading: loading }))
  }

  // Set error state
  const setError = (error: Error | null) => {
    setGlobalState(prev => ({ ...prev, error }))

    if (error) {
      showNotification({
        type: 'error',
        title: 'Error',
        message: error.message
      })
    }
  }

  // Open modal
  const openModal = (modalId: string) => {
    setGlobalState(prev => ({
      ...prev,
      activeModals: [...prev.activeModals, modalId]
    }))
  }

  // Close modal
  const closeModal = (modalId: string) => {
    setGlobalState(prev => ({
      ...prev,
      activeModals: prev.activeModals.filter(id => id !== modalId)
    }))
  }

  // Update theme
  const updateTheme = (theme: 'light' | 'dark' | 'system') => {
    setGlobalState(prev => ({ ...prev, theme }))
    localStorage.setItem('theme', theme)
  }

  // Toggle theme
  const toggleTheme = () => {
    const themes: ('light' | 'dark' | 'system')[] = ['light', 'dark', 'system']
    const currentIndex = themes.indexOf(globalState.theme)
    const nextTheme = themes[(currentIndex + 1) % themes.length]
    updateTheme(nextTheme)
  }

  // Refresh context
  const refreshContext = async () => {
    await loadContext()
  }

  // Actions object
  const actions = {
    showNotification,
    clearNotifications,
    setLoading,
    setError,
    openModal,
    closeModal,
    updateTheme,
    refreshContext
  }

  // Listen for auth changes
  useEffect(() => {
    const handleAuthChange = async (event: CustomEvent) => {
      if (event.detail.type === 'login') {
        await loadContext()
        router.push('/dashboard')
      } else if (event.detail.type === 'logout') {
        setAppContext({
          user: null,
          salon: null,
          notifications: { count: 0, unread: 0 },
          features: {}
        })
        router.push('/login')
      }
    }

    window.addEventListener('auth-change' as any, handleAuthChange)
    return () => window.removeEventListener('auth-change' as any, handleAuthChange)
  }, [router])

  // WebSocket for real-time updates
  useEffect(() => {
    if (!appContext.user) return

    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001')

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)

      switch (data.type) {
        case 'notification':
          showNotification({
            type: 'info',
            title: data.title,
            message: data.message
          })
          // Update notification count
          setAppContext(prev => ({
            ...prev,
            notifications: {
              ...prev.notifications,
              count: prev.notifications.count + 1,
              unread: prev.notifications.unread + 1
            }
          }))
          break

        case 'refresh':
          refreshContext()
          break

        case 'salon-update':
          if (data.salon) {
            setAppContext(prev => ({ ...prev, salon: data.salon }))
          }
          break

        default:
          break
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    return () => {
      ws.close()
    }
  }, [appContext.user])

  return (
    <AppStateContext.Provider value={appContext}>
      <GlobalStateContext.Provider value={globalState}>
        <ActionsContext.Provider value={actions}>
          {children}
        </ActionsContext.Provider>
      </GlobalStateContext.Provider>
    </AppStateContext.Provider>
  )
}

// Export hooks for consuming contexts
export function useAppContext() {
  const context = useContext(AppStateContext)
  if (!context) {
    throw new Error('useAppContext must be used within ContextOrchestrator')
  }
  return context
}

export function useGlobalState() {
  const context = useContext(GlobalStateContext)
  if (!context) {
    throw new Error('useGlobalState must be used within ContextOrchestrator')
  }
  return context
}

export function useActions() {
  const context = useContext(ActionsContext)
  if (!context) {
    throw new Error('useActions must be used within ContextOrchestrator')
  }
  return context
}