'use client'

import { useState, useCallback, useTransition } from 'react'
import { toast } from 'sonner'
import type { NotificationDTO } from '@/lib/api/dal/notifications'

export function useNotifications(initialNotifications: NotificationDTO[] = []) {
  const [notifications, setNotifications] = useState(initialNotifications)
  const [isPending, startTransition] = useTransition()

  const markAsRead = useCallback((id: string) => {
    startTransition(async () => {
      try {
        const response = await fetch('/api/notifications/mark-read', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id })
        })

        if (!response.ok) throw new Error('Failed to mark as read')

        setNotifications(prev =>
          prev.map(n =>
            n.id === id ? { ...n, read_at: new Date().toISOString() } : n
          )
        )
      } catch {
        toast.error('Failed to mark notification as read')
      }
    })
  }, [])

  const markAllAsRead = useCallback(() => {
    startTransition(async () => {
      try {
        const response = await fetch('/api/notifications/mark-all-read', {
          method: 'POST'
        })

        if (!response.ok) throw new Error('Failed to mark all as read')

        setNotifications(prev =>
          prev.map(n => ({ ...n, read_at: new Date().toISOString() }))
        )
        
        toast.success('All notifications marked as read')
      } catch {
        toast.error('Failed to mark all notifications as read')
      }
    })
  }, [])

  const deleteNotification = useCallback((id: string) => {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/notifications?id=${id}`, {
          method: 'DELETE'
        })

        if (!response.ok) throw new Error('Failed to delete')

        setNotifications(prev => prev.filter(n => n.id !== id))
        toast.success('Notification deleted')
      } catch {
        toast.error('Failed to delete notification')
      }
    })
  }, [])

  const deleteAll = useCallback(() => {
    startTransition(async () => {
      try {
        const response = await fetch('/api/notifications?deleteAll=true', {
          method: 'DELETE'
        })

        if (!response.ok) throw new Error('Failed to delete all')

        setNotifications([])
        toast.success('All notifications deleted')
      } catch {
        toast.error('Failed to delete all notifications')
      }
    })
  }, [])

  const dismiss = useCallback((id: string) => {
    startTransition(async () => {
      try {
        const response = await fetch('/api/notifications/dismiss', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id })
        })

        if (!response.ok) throw new Error('Failed to dismiss')

        setNotifications(prev => prev.filter(n => n.id !== id))
      } catch {
        toast.error('Failed to dismiss notification')
      }
    })
  }, [])

  const updateSettings = useCallback(async (settings: Record<string, unknown>) => {
    try {
      const response = await fetch('/api/notifications/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      if (!response.ok) throw new Error('Failed to update settings')
      
      toast.success('Notification settings updated')
      return true
    } catch (error) {
      toast.error('Failed to update notification settings')
      return false
    }
  }, [])

  return {
    notifications,
    setNotifications,
    isPending,
    unreadCount: notifications.filter(n => !n.read_at).length,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAll,
    dismiss,
    updateSettings
  }
}