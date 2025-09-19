// Hook for accessing and managing global application state
import { useContext } from 'react'
import { useGlobalState as useGlobalStateContext, useActions } from '../components/context-orchestrator'

export function useGlobalState() {
  const state = useGlobalStateContext()
  const actions = useActions()

  return {
    // State
    isLoading: state.isLoading,
    error: state.error,
    notifications: state.notifications,
    activeModals: state.activeModals,
    sidebarOpen: state.sidebarOpen,
    theme: state.theme,

    // Actions
    setLoading: actions.setLoading,
    setError: actions.setError,
    showNotification: actions.showNotification,
    clearNotifications: actions.clearNotifications,
    openModal: actions.openModal,
    closeModal: actions.closeModal,
    updateTheme: actions.updateTheme,

    // Helper methods
    isModalOpen: (modalId: string) => state.activeModals.includes(modalId),
    hasNotifications: state.notifications.length > 0,
    isDarkMode: state.theme === 'dark' ||
                 (state.theme === 'system' &&
                  typeof window !== 'undefined' &&
                  window.matchMedia('(prefers-color-scheme: dark)').matches)
  }
}