'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Bell,
  BellOff,
  Calendar,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Wifi,
  WifiOff,
  Activity,
  TrendingUp,
  Users,
  DollarSign,
  AlertTriangle,
  Info,
  ChevronRight,
  Zap,
  Volume2,
  VolumeX,
  Settings
} from 'lucide-react'
import type { BookingUpdate, BookingConflict, CapacityInfo } from '../types'

interface BookingLiveFeedProps {
  salonId: string
  onUpdateClick?: (update: BookingUpdate) => void
  onConflictResolve?: (conflict: BookingConflict) => void
  enableNotifications?: boolean
  enableSound?: boolean
}

interface FeedItem extends BookingUpdate {
  id: string
  read: boolean
  priority: 'high' | 'medium' | 'low'
}

export function BookingLiveFeed({
  salonId,
  onUpdateClick,
  onConflictResolve,
  enableNotifications = true,
  enableSound = true
}: BookingLiveFeedProps) {
  // State
  const [connected, setConnected] = useState(false)
  const [reconnecting, setReconnecting] = useState(false)
  const [feedItems, setFeedItems] = useState<FeedItem[]>([])
  const [conflicts, setConflicts] = useState<BookingConflict[]>([])
  const [capacity, setCapacity] = useState<CapacityInfo | null>(null)
  const [autoScroll, setAutoScroll] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(enableSound)
  const [notificationsEnabled, setNotificationsEnabled] = useState(enableNotifications)
  const [filterTypes, setFilterTypes] = useState<Set<string>>(new Set(['new', 'updated', 'cancelled', 'rescheduled']))
  const [stats, setStats] = useState({
    totalToday: 0,
    newBookings: 0,
    cancellations: 0,
    modifications: 0
  })

  // Refs
  const wsRef = useRef<WebSocket | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()
  const reconnectAttemptsRef = useRef(0)

  // Initialize WebSocket connection
  useEffect(() => {
    connectWebSocket()

    return () => {
      disconnectWebSocket()
    }
  }, [salonId])

  // Auto-scroll to bottom when new items arrive
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [feedItems, autoScroll])

  // Request notification permission
  useEffect(() => {
    if (notificationsEnabled && 'Notification' in window) {
      Notification.requestPermission()
    }
  }, [notificationsEnabled])

  // WebSocket connection management
  const connectWebSocket = () => {
    try {
      // Use actual WebSocket URL in production
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'
      wsRef.current = new WebSocket(`${wsUrl}/booking-feed/${salonId}`)

      wsRef.current.onopen = () => {
        setConnected(true)
        setReconnecting(false)
        reconnectAttemptsRef.current = 0

        // Send authentication if needed
        wsRef.current?.send(JSON.stringify({
          type: 'auth',
          salonId
        }))
      }

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          handleWebSocketMessage(data)
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error)
      }

      wsRef.current.onclose = () => {
        setConnected(false)
        scheduleReconnect()
      }
    } catch (error) {
      console.error('Error creating WebSocket:', error)
      setConnected(false)
      // Mock real-time updates for demo
      startMockUpdates()
    }
  }

  const disconnectWebSocket = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
  }

  const scheduleReconnect = () => {
    if (reconnectAttemptsRef.current < 5) {
      setReconnecting(true)
      const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000)
      reconnectTimeoutRef.current = setTimeout(() => {
        reconnectAttemptsRef.current++
        connectWebSocket()
      }, delay)
    }
  }

  // Handle incoming WebSocket messages
  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case 'booking_update':
        handleBookingUpdate(data.payload)
        break
      case 'conflict':
        handleConflict(data.payload)
        break
      case 'capacity':
        setCapacity(data.payload)
        break
      case 'stats':
        setStats(data.payload)
        break
      default:
        // Unknown message type
    }
  }

  // Handle booking update
  const handleBookingUpdate = (update: BookingUpdate) => {
    const priority = getPriority(update)
    const feedItem: FeedItem = {
      ...update,
      id: `${update.appointmentId}-${Date.now()}`,
      read: false,
      priority
    }

    setFeedItems(prev => [feedItem, ...prev].slice(0, 100)) // Keep last 100 items

    // Update stats
    setStats(prev => {
      const updated = { ...prev }
      updated.totalToday++
      switch (update.type) {
        case 'new':
          updated.newBookings++
          break
        case 'cancelled':
          updated.cancellations++
          break
        case 'updated':
        case 'rescheduled':
          updated.modifications++
          break
      }
      return updated
    })

    // Play sound
    if (soundEnabled && priority === 'high') {
      playNotificationSound()
    }

    // Show browser notification
    if (notificationsEnabled && priority !== 'low') {
      showBrowserNotification(update)
    }
  }

  // Handle conflict
  const handleConflict = (conflict: BookingConflict) => {
    setConflicts(prev => [conflict, ...prev])

    // High priority notification for conflicts
    if (notificationsEnabled) {
      new Notification('Booking Conflict Detected', {
        body: conflict.description,
        icon: '/icon-conflict.png',
        requireInteraction: true
      })
    }
  }

  // Get update priority
  const getPriority = (update: BookingUpdate): 'high' | 'medium' | 'low' => {
    switch (update.type) {
      case 'new':
        return 'high'
      case 'cancelled':
        return 'high'
      case 'rescheduled':
        return 'medium'
      case 'updated':
        return 'low'
      default:
        return 'low'
    }
  }

  // Play notification sound
  const playNotificationSound = () => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio('/notification.mp3')
      }
      audioRef.current.play()
    } catch (error) {
      console.error('Error playing sound:', error)
    }
  }

  // Show browser notification
  const showBrowserNotification = (update: BookingUpdate) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const title = getNotificationTitle(update)
      const body = getNotificationBody(update)

      new Notification(title, {
        body,
        icon: '/icon.png',
        badge: '/badge.png',
        tag: update.appointmentId,
        renotify: true
      })
    }
  }

  const getNotificationTitle = (update: BookingUpdate) => {
    switch (update.type) {
      case 'new':
        return 'New Booking Received'
      case 'cancelled':
        return 'Booking Cancelled'
      case 'rescheduled':
        return 'Booking Rescheduled'
      case 'updated':
        return 'Booking Updated'
      default:
        return 'Booking Update'
    }
  }

  const getNotificationBody = (update: BookingUpdate) => {
    return `Appointment ${update.appointmentId} has been ${update.type}`
  }

  // Mock updates for demo
  const startMockUpdates = () => {
    // Store interval references for cleanup
    const intervals: NodeJS.Timeout[] = []

    // Generate random updates every few seconds
    const updateInterval = setInterval(() => {
      const types: BookingUpdate['type'][] = ['new', 'updated', 'cancelled', 'rescheduled']
      const randomType = types[Math.floor(Math.random() * types.length)]

      handleBookingUpdate({
        type: randomType,
        appointmentId: `APT${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        timestamp: new Date()
      })
    }, 5000 + Math.random() * 10000)
    intervals.push(updateInterval)

    // Generate occasional conflicts
    const conflictInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        handleConflict({
          type: 'double_booking',
          description: 'Time slot 14:00-15:00 is already booked for Sarah Johnson'
        })
      }
    }, 30000)
    intervals.push(conflictInterval)

    // Update capacity
    setCapacity({
      date: new Date(),
      totalSlots: 40,
      bookedSlots: Math.floor(Math.random() * 40),
      availableSlots: 0,
      utilizationPercentage: 0
    })

    // Update capacity calculation
    if (capacity) {
      capacity.availableSlots = capacity.totalSlots - capacity.bookedSlots
      capacity.utilizationPercentage = (capacity.bookedSlots / capacity.totalSlots) * 100
    }

    return () => {
      // Clear all intervals
      intervals.forEach(interval => clearInterval(interval))
    }
  }

  // Mark item as read
  const markAsRead = (itemId: string) => {
    setFeedItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, read: true } : item
      )
    )
  }

  // Clear all feed items
  const clearFeed = () => {
    setFeedItems([])
    setConflicts([])
  }

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
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Live Booking Feed
                  {connected ? (
                    <Badge variant="outline" className="gap-1">
                      <Wifi className="h-3 w-3" />
                      Connected
                    </Badge>
                  ) : reconnecting ? (
                    <Badge variant="secondary" className="gap-1">
                      <RefreshCw className="h-3 w-3 animate-spin" />
                      Reconnecting
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="gap-1">
                      <WifiOff className="h-3 w-3" />
                      Offline
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Real-time booking updates and notifications
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSoundEnabled(!soundEnabled)}
                    >
                      {soundEnabled ? (
                        <Volume2 className="h-4 w-4" />
                      ) : (
                        <VolumeX className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {soundEnabled ? 'Mute sounds' : 'Enable sounds'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                    >
                      {notificationsEnabled ? (
                        <Bell className="h-4 w-4" />
                      ) : (
                        <BellOff className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {notificationsEnabled ? 'Disable notifications' : 'Enable notifications'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Button
                variant="outline"
                size="sm"
                onClick={clearFeed}
                disabled={feedItems.length === 0}
              >
                Clear
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.totalToday}</p>
              <p className="text-xs text-muted-foreground">Today's Activity</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.newBookings}</p>
              <p className="text-xs text-muted-foreground">New Bookings</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{stats.cancellations}</p>
              <p className="text-xs text-muted-foreground">Cancellations</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.modifications}</p>
              <p className="text-xs text-muted-foreground">Modifications</p>
            </div>
          </div>

          {/* Capacity Bar */}
          {capacity && (
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span>Today's Capacity</span>
                <span className="font-medium">
                  {capacity.bookedSlots}/{capacity.totalSlots} slots
                </span>
              </div>
              <Progress value={capacity.utilizationPercentage} />
              {capacity.utilizationPercentage > 80 && (
                <Alert className="py-2">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    High utilization! Only {capacity.availableSlots} slots remaining.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-4">
            {(['new', 'updated', 'cancelled', 'rescheduled'] as const).map(type => (
              <Button
                key={type}
                variant={filterTypes.has(type) ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setFilterTypes(prev => {
                    const updated = new Set(prev)
                    if (updated.has(type)) {
                      updated.delete(type)
                    } else {
                      updated.add(type)
                    }
                    return updated
                  })
                }}
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
                  onCheckedChange={setAutoScroll}
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
                        markAsRead(item.id)
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
        </CardContent>
      </Card>
    </div>
  )
}