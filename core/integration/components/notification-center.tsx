'use client'

// Unified notification center for the application
import { useState, useEffect } from 'react'
import { Bell, X, Check, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAppContext, useGlobalState } from './context-orchestrator'
import { cn } from '@/lib/utils'

interface SystemNotification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  timestamp: string
  read: boolean
  actionUrl?: string
  actionLabel?: string
}

export function NotificationCenter() {
  const { notifications: contextNotifications } = useAppContext()
  const { notifications: toastNotifications } = useGlobalState()
  const [systemNotifications, setSystemNotifications] = useState<SystemNotification[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Load notifications on mount
  useEffect(() => {
    loadNotifications()

    // Set up polling for new notifications
    const interval = setInterval(loadNotifications, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [])

  // Load notifications using Server Action
  const loadNotifications = async () => {
    try {
      const { getNotificationsAction } = await import('@/core/notifications/actions/notification-actions')
      const data = await getNotificationsAction()
      setSystemNotifications(data.notifications || [])
    } catch (error) {
      console.error('Failed to load notifications:', error)
    }
  }

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const { markNotificationReadAction } = await import('@/core/notifications/actions/notification-actions')
      await markNotificationReadAction(notificationId)

      setSystemNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      )
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  // Mark all as read
  const markAllAsRead = async () => {
    setIsLoading(true)
    try {
      const { markAllNotificationsReadAction } = await import('@/core/notifications/actions/notification-actions')
      await markAllNotificationsReadAction()

      setSystemNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      )
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Clear all notifications
  const clearAll = async () => {
    setIsLoading(true)
    try {
      const { clearAllNotificationsAction } = await import('@/core/notifications/actions/notification-actions')
      await clearAllNotificationsAction()

      setSystemNotifications([])
    } catch (error) {
      console.error('Failed to clear notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Get icon for notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <Check className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'Just now'
  }

  const unreadCount = systemNotifications.filter(n => !n.read).length + contextNotifications.unread

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge
                className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center"
                variant="destructive"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>Notifications</span>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                disabled={isLoading || unreadCount === 0}
                className="h-7 text-xs"
              >
                Mark all read
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                disabled={isLoading || systemNotifications.length === 0}
                className="h-7 text-xs"
              >
                Clear
              </Button>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <ScrollArea className="h-[400px]">
            {systemNotifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notifications</p>
              </div>
            ) : (
              <div className="space-y-1 p-1">
                {systemNotifications.map(notification => (
                  <DropdownMenuItem
                    key={notification.id}
                    className={cn(
                      'flex flex-col items-start p-3 cursor-pointer',
                      !notification.read && 'bg-accent/50'
                    )}
                    onClick={() => {
                      markAsRead(notification.id)
                      if (notification.actionUrl) {
                        window.location.href = notification.actionUrl
                      }
                    }}
                  >
                    <div className="flex items-start gap-3 w-full">
                      <div className="mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            {formatTime(notification.timestamp)}
                          </p>
                          {notification.actionLabel && (
                            <span className="text-xs text-primary hover:underline">
                              {notification.actionLabel}
                            </span>
                          )}
                        </div>
                      </div>
                      {!notification.read && (
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      )}
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
            )}
          </ScrollArea>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="text-center justify-center text-sm text-primary hover:text-primary"
            onClick={() => window.location.href = '/notifications'}
          >
            View all notifications
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Toast notifications */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 pointer-events-none">
        {toastNotifications.map(notification => (
          <div
            key={notification.id}
            className={cn(
              'pointer-events-auto flex items-start gap-3 p-4 rounded-lg shadow-lg border animate-in slide-in-from-bottom-2',
              'bg-background',
              notification.type === 'error' && 'border-destructive',
              notification.type === 'success' && 'border-green-500',
              notification.type === 'warning' && 'border-yellow-500',
              notification.type === 'info' && 'border-blue-500'
            )}
          >
            <div>{getNotificationIcon(notification.type)}</div>
            <div className="flex-1">
              <p className="font-medium text-sm">{notification.title}</p>
              {notification.message && (
                <p className="text-xs text-muted-foreground mt-1">
                  {notification.message}
                </p>
              )}
              {notification.action && (
                <Button
                  size="sm"
                  variant="link"
                  className="h-auto p-0 mt-2 text-xs"
                  onClick={notification.action.onClick}
                >
                  {notification.action.label}
                </Button>
              )}
            </div>
            <button
              onClick={() => {
                document.dispatchEvent(
                  new CustomEvent('dismiss-notification', {
                    detail: { id: notification.id }
                  })
                )
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </>
  )
}