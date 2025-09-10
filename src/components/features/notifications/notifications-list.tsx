import { createClient } from '@/lib/supabase/server'
import { NotificationItem } from './notification-item'
import { Database } from '@/types/database.types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Bell, BellOff, Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'

type Notification = Database['public']['Tables']['notifications']['Row']

async function getNotifications(): Promise<Notification[]> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  return data || []
}

export async function NotificationList() {
  const notifications = await getNotifications()

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

  const groupedNotifications = groupNotificationsByDate(notifications)
  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <div className={cn("space-y-6")}>
      {/* Header with unread count */}
      {unreadCount > 0 && (
        <div className={cn("flex items-center justify-between")}>
          <div className={cn("flex items-center gap-2")}>
            <Bell className={cn("h-4 w-4 text-primary")} />
            <span className={cn("text-sm font-medium")}>
              You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </span>
          </div>
          <Badge variant="default" className={cn("rounded-full")}>
            {unreadCount} New
          </Badge>
        </div>
      )}

      {/* Grouped notifications */}
      <ScrollArea className={cn("h-[600px] pr-4")}>
        <div className={cn("space-y-6")}>
          {Object.entries(groupedNotifications).map(([date, items], index) => (
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
      </ScrollArea>
    </div>
  )
}

function groupNotificationsByDate(notifications: Notification[]) {
  const groups: Record<string, Notification[]> = {}
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