'use client'

import { useState, useTransition } from 'react'
import { format } from 'date-fns'
import { Bell, Check, CheckCheck, Trash2, Archive, Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { NotificationItem } from './notification-item'
import type { NotificationDTO } from '@/lib/api/dal/notifications'

interface NotificationsListProps {
  initialNotifications: NotificationDTO[]
  enableGrouping?: boolean
  enableBulkActions?: boolean
  height?: string
}

export function NotificationsList({ 
  initialNotifications, 
  enableGrouping = true,
  enableBulkActions = true,
  height = "600px"
}: NotificationsListProps) {
  const [notifications, setNotifications] = useState(initialNotifications)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false)
  const [isPending, startTransition] = useTransition()

  const unreadCount = notifications.filter(n => !n.read_at).length

  const handleMarkAsRead = (id: string) => {
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
      } catch (_error) {
        toast.error('Failed to mark notification as read')
      }
    })
  }

  const handleMarkAllAsRead = () => {
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
      } catch (_error) {
        toast.error('Failed to mark all notifications as read')
      }
    })
  }

  const handleDelete = (id: string) => {
    setSelectedIds(new Set([id]))
    setShowDeleteDialog(true)
  }

  const confirmDelete = () => {
    startTransition(async () => {
      try {
        const idToDelete = Array.from(selectedIds)[0]
        const response = await fetch(`/api/notifications?id=${idToDelete}`, {
          method: 'DELETE'
        })

        if (!response.ok) throw new Error('Failed to delete notification')

        setNotifications(prev => prev.filter(n => n.id !== idToDelete))
        setSelectedIds(new Set())
        setShowDeleteDialog(false)

        toast.success('Notification deleted')
      } catch (_error) {
        toast.error('Failed to delete notification')
      }
    })
  }

  const confirmDeleteAll = () => {
    startTransition(async () => {
      try {
        const response = await fetch('/api/notifications?deleteAll=true', {
          method: 'DELETE'
        })

        if (!response.ok) throw new Error('Failed to delete all notifications')

        setNotifications([])
        setShowDeleteAllDialog(false)

        toast.success('All notifications deleted')
      } catch (_error) {
        toast.error('Failed to delete all notifications')
      }
    })
  }

  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case 'appointment_confirmation':
      case 'appointment_reminder':
        return 'bg-blue-500'
      case 'appointment_cancellation':
        return 'bg-red-500'
      case 'promotion':
        return 'bg-purple-500'
      case 'staff_update':
        return 'bg-green-500'
      case 'review_request':
        return 'bg-yellow-500'
      case 'general':
      default:
        return 'bg-gray-500'
    }
  }

  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case 'appointment_confirmation':
        return 'Appointment'
      case 'appointment_reminder':
        return 'Reminder'
      case 'appointment_cancellation':
        return 'Cancelled'
      case 'promotion':
        return 'Promotion'
      case 'staff_update':
        return 'Staff Update'
      case 'review_request':
        return 'Review'
      case 'general':
      default:
        return 'General'
    }
  }

  // Empty state
  if (notifications.length === 0) {
    return (
      <Card className={cn("border-dashed")}>
        <CardContent className={cn("flex flex-col items-center justify-center py-16")}>
          <div className={cn(
            "rounded-full bg-muted p-6 mb-4",
            "flex items-center justify-center"
          )}>
            <Inbox className={cn("h-12 w-12 text-muted-foreground")} />
          </div>
          <h3 className={cn("text-lg font-semibold mb-2")}>
            No notifications yet
          </h3>
          <p className={cn("text-sm text-muted-foreground text-center max-w-sm")}>
            You&apos;re all caught up! We&apos;ll notify you when there&apos;s something new.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Group notifications by date if enabled
  const groupedNotifications = enableGrouping ? groupNotificationsByDate(notifications) : { 'All': notifications }

  return (
    <div className={cn("space-y-4")}>
      {/* Header Actions */}
      {enableBulkActions && (
        <div className={cn("flex items-center justify-between")}>
          <div className={cn("flex items-center gap-2")}>
            <Bell className={cn("h-5 w-5")} />
            <span className={cn("text-lg font-semibold")}>
              Notifications
            </span>
            {unreadCount > 0 && (
              <Badge variant="destructive" className={cn("ml-2")}>
                {unreadCount} unread
              </Badge>
            )}
          </div>
          
          <div className={cn("flex items-center gap-2")}>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={isPending}
              >
                <CheckCheck className={cn("h-4 w-4 mr-1")} />
                Mark all read
              </Button>
            )}
            
            {notifications.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteAllDialog(true)}
                disabled={isPending}
              >
                <Archive className={cn("h-4 w-4 mr-1")} />
                Clear all
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Notifications List */}
      <ScrollArea className={cn("rounded-lg border")} style={{ height }}>
        {enableGrouping ? (
          <div className={cn("space-y-6 p-4")}>
            {Object.entries(groupedNotifications).map(([date, items]) => (
              <div key={date} className={cn("space-y-3")}>
                {/* Date header */}
                <div className={cn("flex items-center gap-3")}>
                  <h3 className={cn(
                    "text-sm font-semibold",
                    date === 'Today' ? "text-primary" : "text-muted-foreground"
                  )}>
                    {date}
                  </h3>
                  <Badge variant="outline" className={cn("text-xs")}>
                    {items.length} notification{items.length !== 1 ? 's' : ''}
                  </Badge>
                  <Separator className={cn("flex-1")} />
                </div>
                
                {/* Notification items */}
                <div className={cn("space-y-2")}>
                  {items.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={cn("divide-y")}>
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "p-4 hover:bg-muted/50 transition-colors",
                  !notification.read_at && "bg-accent/10"
                )}
              >
                <div className={cn("flex items-start justify-between gap-4")}>
                  <div className={cn("flex-1 space-y-1")}>
                    <div className={cn("flex items-center gap-2")}>
                      <Badge
                        variant="secondary"
                        className={cn(getNotificationTypeColor(notification.type), "text-white")}
                      >
                        {getNotificationTypeLabel(notification.type)}
                      </Badge>
                      {!notification.read_at && (
                        <Badge variant="default" className={cn("bg-blue-500")}>
                          New
                        </Badge>
                      )}
                    </div>
                    
                    <h4 className={cn("font-semibold", !notification.read_at && "text-primary")}>
                      {notification.title}
                    </h4>
                    
                    <p className={cn("text-sm text-muted-foreground")}>
                      {notification.message}
                    </p>
                    
                    <p className={cn("text-xs text-muted-foreground")}>
                      {format(new Date(notification.created_at), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                  
                  <div className={cn("flex items-center gap-1")}>
                    {!notification.read_at && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMarkAsRead(notification.id)}
                        disabled={isPending}
                      >
                        <Check className={cn("h-4 w-4")} />
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(notification.id)}
                      disabled={isPending}
                    >
                      <Trash2 className={cn("h-4 w-4")} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Notification</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this notification? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete All Confirmation Dialog */}
      <AlertDialog open={showDeleteAllDialog} onOpenChange={setShowDeleteAllDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Notifications</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete all notifications? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteAll}>Delete All</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function groupNotificationsByDate(notifications: NotificationDTO[]) {
  const groups: Record<string, NotificationDTO[]> = {}
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const lastWeek = new Date(today)
  lastWeek.setDate(lastWeek.getDate() - 7)

  notifications.forEach((notification) => {
    const date = new Date(notification.created_at)
    let label: string

    if (date.toDateString() === today.toDateString()) {
      label = 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      label = 'Yesterday'
    } else if (date > lastWeek) {
      label = 'This Week'
    } else {
      label = date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      })
    }

    if (!groups[label]) {
      groups[label] = []
    }
    groups[label].push(notification)
  })

  return groups
}