'use client'

import { useState } from 'react'
import { NotificationDTO } from '@/lib/api/dal/notifications'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import {
  Calendar,
  User,
  Bell,
  Mail,
  MessageSquare,
  Star,
  AlertCircle,
  CheckCircle,
  Clock,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NotificationItemProps {
  notification: NotificationDTO
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  appointment: Calendar,
  user: User,
  review: Star,
  alert: AlertCircle,
  success: CheckCircle,
  message: MessageSquare,
  email: Mail,
  default: Bell
}

const priorityColors = {
  low: 'secondary',
  medium: 'default',
  high: 'destructive'
} as const

export function NotificationItem({ notification }: NotificationItemProps) {
  const [isRead, setIsRead] = useState(notification.is_read)
  const [isHidden, setIsHidden] = useState(false)
  const supabase = createClient()

  const Icon = iconMap[notification.type || 'default'] || iconMap.default
  const timeAgo = getTimeAgo(new Date(notification.created_at))

  async function markAsRead() {
    if (isRead) return

    await supabase
      .from('notifications')
      .update({ 
        is_read: true, 
        read_at: new Date().toISOString() 
      })
      .eq('id', notification.id)

    setIsRead(true)
  }

  async function dismissNotification() {
    await supabase
      .from('notifications')
      .delete()
      .eq('id', notification.id)

    setIsHidden(true)
  }

  if (isHidden) return null

  return (
    <Card
      className={cn(
        'p-4 transition-all hover:shadow-md cursor-pointer',
        !isRead && 'bg-accent/50 border-primary/20'
      )}
      onClick={markAsRead}
    >
      <div className="flex items-start space-x-4">
        <div className={cn(
          'p-2 rounded-full',
          isRead ? 'bg-muted' : 'bg-primary/10'
        )}>
          <Icon className="h-5 w-5" />
        </div>
        
        <div className="flex-1 space-y-1">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className={cn(
                'text-sm',
                !isRead && 'font-medium'
              )}>
                {notification.title}
              </p>
              {notification.message && (
                <p className="text-sm text-muted-foreground">
                  {notification.message}
                </p>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {Boolean((notification.data as Record<string, unknown>)?.priority) && (
                <Badge 
                  variant={priorityColors[(notification.data as Record<string, unknown>).priority as keyof typeof priorityColors]}
                  className="text-xs"
                >
                  {String((notification.data as Record<string, unknown>).priority)}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation()
                  dismissNotification()
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
            <div className="flex items-center">
              <Clock className="mr-1 h-3 w-3" />
              {timeAgo}
            </div>
            {Boolean((notification.data as Record<string, unknown>)?.channel) && (
              <Badge variant="outline" className="text-xs">
                {String((notification.data as Record<string, unknown>).channel)}
              </Badge>
            )}
          </div>

          {Boolean((notification.data as Record<string, unknown>)?.action_url) && (
            <Button
              variant="link"
              className="h-auto p-0 text-xs"
              onClick={(e) => {
                e.stopPropagation()
                window.location.href = String((notification.data as Record<string, unknown>).action_url)
              }}
            >
              {String((notification.data as Record<string, unknown>)?.action_text) || 'View details'}
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
  
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  
  return date.toLocaleDateString()
}