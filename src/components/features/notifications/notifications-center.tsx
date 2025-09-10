'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Bell,
  Calendar,
  DollarSign,
  Star,
  Gift,
  CheckCircle,
  Circle,
  Trash2,
  Check
} from 'lucide-react'
import { useState } from 'react'

type Notification = {
  id: string
  type: 'appointment' | 'payment' | 'review' | 'promotion' | 'system'
  title: string
  message: string
  is_read: boolean
  created_at: string
  action_url?: string
  action_label?: string
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'appointment',
      title: 'New Appointment Booking',
      message: 'Sarah Johnson booked a Hair Cut for tomorrow at 2:00 PM',
      is_read: false,
      created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      action_url: '/appointments',
      action_label: 'View Appointment'
    },
    {
      id: '2',
      type: 'payment',
      title: 'Payment Received',
      message: 'Payment of $85.00 received from Michael Chen',
      is_read: false,
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '3',
      type: 'review',
      title: 'New 5-Star Review',
      message: 'Emma Wilson left a 5-star review for your service',
      is_read: true,
      created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      action_url: '/reviews',
      action_label: 'Read Review'
    },
    {
      id: '4',
      type: 'promotion',
      title: 'Campaign Sent Successfully',
      message: 'Your holiday promotion was sent to 156 customers',
      is_read: true,
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '5',
      type: 'system',
      title: 'System Maintenance',
      message: 'Scheduled maintenance on Jan 25, 2:00 AM - 4:00 AM',
      is_read: true,
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    }
  ])

  const unreadCount = notifications.filter(n => !n.is_read).length

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, is_read: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, is_read: true }))
    )
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'appointment': return Calendar
      case 'payment': return DollarSign
      case 'review': return Star
      case 'promotion': return Gift
      case 'system': return Bell
      default: return Bell
    }
  }

  const getIconColor = (type: string) => {
    switch (type) {
      case 'appointment': return 'text-blue-600'
      case 'payment': return 'text-green-600'
      case 'review': return 'text-yellow-600'
      case 'promotion': return 'text-purple-600'
      case 'system': return 'text-gray-600'
      default: return 'text-gray-600'
    }
  }

  const formatTime = (date: string) => {
    const now = new Date()
    const then = new Date(date)
    const diff = now.getTime() - then.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return then.toLocaleDateString()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Notifications</CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount}</Badge>
            )}
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                <Check className="h-4 w-4 mr-2" />
                Mark All Read
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px]">
          <div className="space-y-2">
            {notifications.map(notification => {
              const Icon = getIcon(notification.type)
              const iconColor = getIconColor(notification.type)
              
              return (
                <div
                  key={notification.id}
                  className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                    !notification.is_read ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex-shrink-0 mt-1">
                    <div className={`p-2 rounded-full bg-white ${iconColor}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{notification.title}</p>
                          {!notification.is_read && (
                            <Circle className="h-2 w-2 fill-blue-600 text-blue-600" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">
                            {formatTime(notification.created_at)}
                          </span>
                          {notification.action_url && (
                            <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                              {notification.action_label || 'View'}
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-1">
                        {!notification.is_read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
            
            {notifications.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>No notifications</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}