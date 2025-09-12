'use client'

import { Button } from '@/components/ui/button'
import { Bell, Settings, CheckCheck } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { toast } from '@/hooks/use-toast'

interface NotificationHeaderProps {
  initialUnreadCount: number
  onSettingsClick?: () => void
}

export function NotificationHeader({ initialUnreadCount, onSettingsClick }: NotificationHeaderProps) {
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function markAllAsRead() {
    setLoading(true)
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        setUnreadCount(0)
        toast({
          title: 'Success',
          description: 'All notifications marked as read'
        })
        router.refresh()
      } else {
        throw new Error('Failed to mark all as read')
      }
    } catch (_error) {
      toast({
        title: 'Error',
        description: 'Failed to mark all notifications as read',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex items-center justify-between")}>
      <div className={cn("flex items-center space-x-2")}>
        <Bell className={cn("h-6 w-6")} />
        <h1 className={cn("text-3xl font-bold tracking-tight")}>Notifications</h1>
        {unreadCount > 0 && (
          <Badge variant="destructive" className={cn("ml-2")}>
            {unreadCount} unread
          </Badge>
        )}
      </div>
      
      <div className={cn("flex items-center space-x-2")}>
        <Button
          variant="outline"
          onClick={markAllAsRead}
          disabled={unreadCount === 0 || loading}
        >
          <CheckCheck className={cn("mr-2 h-4 w-4")} />
          {loading ? 'Marking...' : 'Mark all as read'}
        </Button>
        <Button 
          variant="outline" 
          size="icon"
          onClick={onSettingsClick}
        >
          <Settings className={cn("h-4 w-4")} />
        </Button>
      </div>
    </div>
  )
}