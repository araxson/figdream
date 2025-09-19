'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import type { BookingUpdate, BookingConflict, CapacityInfo } from '../types'
import { useBookingWebSocket } from './booking-feed-websocket'
import { useBookingNotifications } from './booking-feed-notifications'
import { BookingFeedHeader } from './booking-feed-header'
import { BookingFeedStats } from './booking-feed-stats'
import { BookingFeedDisplay } from './booking-feed-display'

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

  // WebSocket connection
  const { connected, reconnecting } = useBookingWebSocket(salonId, {
    onBookingUpdate: handleBookingUpdate,
    onConflict: handleConflict,
    onCapacity: setCapacity,
    onStats: setStats
  })

  // Notifications
  const {
    handleBookingNotification,
    showConflictNotification,
    getNotificationTitle
  } = useBookingNotifications(soundEnabled, notificationsEnabled)

  // Handle booking update
  function handleBookingUpdate(update: BookingUpdate) {
    const priority = handleBookingNotification(update)
    const feedItem: FeedItem = {
      ...update,
      id: `${update.appointmentId}-${Date.now()}`,
      read: false,
      priority
    }

    setFeedItems(prev => [feedItem, ...prev].slice(0, 100))

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
  }

  // Handle conflict
  function handleConflict(conflict: BookingConflict) {
    setConflicts(prev => [conflict, ...prev])
    showConflictNotification(conflict)
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

  // Handle filter type toggle
  const handleFilterTypeToggle = (type: string) => {
    setFilterTypes(prev => {
      const updated = new Set(prev)
      if (updated.has(type)) {
        updated.delete(type)
      } else {
        updated.add(type)
      }
      return updated
    })
  }

  return (
    <div className="space-y-4">
      <Card>
        <BookingFeedHeader
          connected={connected}
          reconnecting={reconnecting}
          soundEnabled={soundEnabled}
          notificationsEnabled={notificationsEnabled}
          feedItemsLength={feedItems.length}
          onSoundToggle={() => setSoundEnabled(!soundEnabled)}
          onNotificationsToggle={() => setNotificationsEnabled(!notificationsEnabled)}
          onClearFeed={clearFeed}
        />
        <CardContent>
          <BookingFeedStats
            stats={stats}
            capacity={capacity}
          />
          <BookingFeedDisplay
            feedItems={feedItems}
            conflicts={conflicts}
            filterTypes={filterTypes}
            autoScroll={autoScroll}
            onFilterTypeToggle={handleFilterTypeToggle}
            onAutoScrollToggle={setAutoScroll}
            onMarkAsRead={markAsRead}
            onUpdateClick={onUpdateClick}
            onConflictResolve={onConflictResolve}
            getNotificationTitle={getNotificationTitle}
          />
        </CardContent>
      </Card>
    </div>
  )
}