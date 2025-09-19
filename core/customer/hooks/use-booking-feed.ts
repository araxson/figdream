'use client'

import { useState, useCallback } from 'react'
import type { BookingUpdate, BookingConflict, CapacityInfo } from '../types'

interface FeedItem extends BookingUpdate {
  id: string
  read: boolean
  priority: 'high' | 'medium' | 'low'
}

interface FeedStats {
  totalToday: number
  newBookings: number
  cancellations: number
  modifications: number
}

export function useBookingFeed() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([])
  const [conflicts, setConflicts] = useState<BookingConflict[]>([])
  const [capacity, setCapacity] = useState<CapacityInfo | null>(null)
  const [stats, setStats] = useState<FeedStats>({
    totalToday: 0,
    newBookings: 0,
    cancellations: 0,
    modifications: 0
  })
  const [filterTypes, setFilterTypes] = useState<Set<string>>(
    new Set(['new', 'updated', 'cancelled', 'rescheduled'])
  )

  const handleBookingUpdate = useCallback((update: BookingUpdate) => {
    const newItem: FeedItem = {
      ...update,
      id: `${update.appointmentId}-${Date.now()}`,
      read: false,
      priority: update.type === 'cancelled' ? 'high' :
                update.type === 'new' ? 'medium' : 'low'
    }

    setFeedItems(prev => [newItem, ...prev].slice(0, 50)) // Keep last 50 items

    // Update stats
    setStats(prev => ({
      ...prev,
      totalToday: prev.totalToday + (update.type === 'new' ? 1 : 0),
      newBookings: prev.newBookings + (update.type === 'new' ? 1 : 0),
      cancellations: prev.cancellations + (update.type === 'cancelled' ? 1 : 0),
      modifications: prev.modifications +
        (update.type === 'updated' || update.type === 'rescheduled' ? 1 : 0)
    }))
  }, [])

  const handleConflict = useCallback((conflict: BookingConflict) => {
    setConflicts(prev => [conflict, ...prev].slice(0, 10)) // Keep last 10 conflicts
  }, [])

  const markAsRead = useCallback((itemId: string) => {
    setFeedItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, read: true } : item
      )
    )
  }, [])

  const clearFeed = useCallback(() => {
    setFeedItems([])
    setConflicts([])
  }, [])

  const removeConflict = useCallback((index: number) => {
    setConflicts(prev => prev.filter((_, i) => i !== index))
  }, [])

  // Filtered items based on selected types
  const filteredItems = feedItems.filter(item => filterTypes.has(item.type))

  // Unread count
  const unreadCount = feedItems.filter(item => !item.read).length

  return {
    feedItems,
    filteredItems,
    conflicts,
    capacity,
    stats,
    filterTypes,
    unreadCount,
    handleBookingUpdate,
    handleConflict,
    markAsRead,
    clearFeed,
    removeConflict,
    setCapacity,
    setFilterTypes
  }
}