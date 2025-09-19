'use client'

import { useRef, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertCircle,
  Info,
  Activity,
} from 'lucide-react'
import type { BookingUpdate, BookingConflict } from '../types'

interface FeedItem extends BookingUpdate {
  id: string
  read: boolean
  priority: 'high' | 'medium' | 'low'
}

interface BookingFeedDisplayProps {
  feedItems: FeedItem[]
  conflicts: BookingConflict[]
  filterTypes: Set<string>
  autoScroll: boolean
  onFilterTypeToggle: (type: string) => void
  onAutoScrollToggle: (enabled: boolean) => void
  onMarkAsRead: (itemId: string) => void
  onUpdateClick?: (update: BookingUpdate) => void
  onConflictResolve?: (conflict: BookingConflict) => void
  getNotificationTitle: (update: BookingUpdate) => string
}

export function BookingFeedDisplay({
  feedItems,
  conflicts,
  filterTypes,
  autoScroll,
  onFilterTypeToggle,
  onAutoScrollToggle,
  onMarkAsRead,
  onUpdateClick,
  onConflictResolve,
  getNotificationTitle
}: BookingFeedDisplayProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new items arrive
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [feedItems, autoScroll])

  // Get icon for update type
  const getUpdateIcon = (type: BookingUpdate['type']) => {
    switch (type) {
      case 'new':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'rescheduled':
        return <RefreshCw className="h-4 w-4 text-blue-500" />
      case 'updated':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  // Filter feed items
  const filteredItems = feedItems.filter(item =>
    filterTypes.has(item.type)
  )

  // Unread count
  const unreadCount = filteredItems.filter(item => !item.read).length

  return (
    <>
      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4">
        {(['new', 'updated', 'cancelled', 'rescheduled'] as const).map(type => (
          <Button
            key={type}
            variant={filterTypes.has(type) ? 'default' : 'outline'}
            size="sm"
            onClick={() => onFilterTypeToggle(type)}
          >
            {type}
          </Button>
        ))}
      </div>

      {/* Conflicts */}
      {conflicts.length > 0 && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-sm">Conflicts Detected</AlertTitle>
          <AlertDescription>
            <div className="space-y-2 mt-2">
              {conflicts.slice(0, 3).map((conflict, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-xs">{conflict.description}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 text-xs"
                    onClick={() => onConflictResolve?.(conflict)}
                  >
                    Resolve
                  </Button>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Feed Items */}
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm">Activity Feed</Label>
          <div className="flex items-center gap-2">
            <Label htmlFor="auto-scroll" className="text-xs">Auto-scroll</Label>
            <Switch
              id="auto-scroll"
              checked={autoScroll}
              onCheckedChange={onAutoScrollToggle}
            />
          </div>
        </div>

        <ScrollArea ref={scrollRef} className="h-[400px] rounded-md border p-3">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32">
              <Activity className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No activity yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredItems.map(item => (
                <Card
                  key={item.id}
                  className={`p-3 cursor-pointer transition-colors ${
                    item.read ? 'opacity-60' : ''
                  } ${
                    item.priority === 'high' ? 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950' :
                    item.priority === 'medium' ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950' :
                    ''
                  }`}
                  onClick={() => {
                    onMarkAsRead(item.id)
                    onUpdateClick?.(item)
                  }}
                >
                  <div className="flex items-start gap-3">
                    {getUpdateIcon(item.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">
                          {getNotificationTitle(item)}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {item.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {item.appointmentId}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    {!item.read && (
                      <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Unread indicator */}
      {unreadCount > 0 && (
        <div className="flex items-center justify-center mt-2">
          <Badge variant="secondary">
            {unreadCount} unread update{unreadCount !== 1 ? 's' : ''}
          </Badge>
        </div>
      )}
    </>
  )
}