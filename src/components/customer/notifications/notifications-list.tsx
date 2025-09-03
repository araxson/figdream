"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Tabs, TabsContent, TabsList, TabsTrigger, ScrollArea, Skeleton } from "@/components/ui"
import { NotificationCard } from "./notification-card"
import { Bell, Check, Trash2 } from "lucide-react"
import type { Database } from "@/types/database.types"
type Notification = Database["public"]["Tables"]["notifications"]["Row"]
interface NotificationsListProps {
  userId: string
}
export function NotificationsList({ userId }: NotificationsListProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all")
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set())
  useEffect(() => {
    fetchNotifications()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, filter])
  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/notifications?userId=${userId}&filter=${filter}`)
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    } finally {
      setLoading(false)
    }
  }
  const markAsRead = async (notificationIds: string[]) => {
    try {
      await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: notificationIds }),
      })
      await fetchNotifications()
      setSelectedNotifications(new Set())
    } catch (error) {
      console.error("Failed to mark notifications as read:", error)
    }
  }
  const deleteNotifications = async (notificationIds: string[]) => {
    try {
      await fetch("/api/notifications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: notificationIds }),
      })
      await fetchNotifications()
      setSelectedNotifications(new Set())
    } catch (error) {
      console.error("Failed to delete notifications:", error)
    }
  }
  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedNotifications)
    if (newSelection.has(id)) {
      newSelection.delete(id)
    } else {
      newSelection.add(id)
    }
    setSelectedNotifications(newSelection)
  }
  const selectAll = () => {
    if (selectedNotifications.size === notifications.length) {
      setSelectedNotifications(new Set())
    } else {
      setSelectedNotifications(new Set(notifications.map(n => n.id)))
    }
  }
  const filteredNotifications = notifications.filter(notification => {
    if (filter === "unread") return !notification.read_at
    if (filter === "read") return !!notification.read_at
    return true
  })
  const unreadCount = notifications.filter(n => !n.read_at).length
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>Notifications</CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount}</Badge>
            )}
          </div>
          <div className="flex gap-2">
            {selectedNotifications.size > 0 && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => markAsRead(Array.from(selectedNotifications))}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Mark as Read
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => deleteNotifications(Array.from(selectedNotifications))}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={selectAll}
            >
              {selectedNotifications.size === notifications.length ? "Deselect All" : "Select All"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">
              All ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread">
              Unread ({unreadCount})
            </TabsTrigger>
            <TabsTrigger value="read">
              Read ({notifications.length - unreadCount})
            </TabsTrigger>
          </TabsList>
          <TabsContent value={filter} className="mt-4">
            <ScrollArea className="h-[600px]">
              <div className="space-y-2">
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No notifications to display</p>
                  </div>
                ) : (
                  filteredNotifications.map((notification) => (
                    <NotificationCard
                      key={notification.id}
                      notification={notification}
                      selected={selectedNotifications.has(notification.id)}
                      onToggleSelection={() => toggleSelection(notification.id)}
                      onMarkAsRead={() => markAsRead([notification.id])}
                      onDelete={() => deleteNotifications([notification.id])}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}