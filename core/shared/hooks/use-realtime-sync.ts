'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'

// Define payload types
export interface RealtimePayload<T = unknown> {
  eventType?: 'INSERT' | 'UPDATE' | 'DELETE'
  new?: T
  old?: T
  [key: string]: unknown
}

export interface ConflictData<T = unknown> {
  id: string
  local: T
  remote: T
  timestamp: Date
}

export interface PendingChange<T = unknown> {
  id: string
  data: T
  timestamp: Date
  type?: 'INSERT' | 'UPDATE' | 'DELETE'
}

export interface RealtimeSyncConfig<T = unknown> {
  channel: string
  event?: string
  table?: string
  schema?: string
  filter?: string
  onInsert?: (payload: T) => void
  onUpdate?: (payload: T) => void
  onDelete?: (payload: T) => void
  onChange?: (payload: T | T[]) => void
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: Error) => void
  fallbackToPolling?: boolean
  pollingInterval?: number
  reconnectDelay?: number
  maxReconnectAttempts?: number
}

export interface SyncState<T = unknown> {
  isConnected: boolean
  isReconnecting: boolean
  lastSync: Date | null
  pendingChanges: PendingChange<T>[]
  conflicts: ConflictData<T>[]
}

export function useRealtimeSync<T = unknown>(config: RealtimeSyncConfig<T>) {
  const [state, setState] = useState<SyncState<T>>({
    isConnected: false,
    isReconnecting: false,
    lastSync: null,
    pendingChanges: [],
    conflicts: []
  })

  const channelRef = useRef<RealtimeChannel | null>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout>()
  const reconnectAttemptsRef = useRef(0)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()
  const optimisticUpdatesRef = useRef<Map<string, T>>(new Map())

  const supabase = createClient()

  // Handle connection state
  const updateConnectionState = useCallback(
    (isConnected: boolean, isReconnecting = false) => {
      setState(prev => ({
        ...prev,
        isConnected,
        isReconnecting,
        lastSync: isConnected ? new Date() : prev.lastSync
      }))

      if (isConnected) {
        config.onConnect?.()
        reconnectAttemptsRef.current = 0
      } else if (!isReconnecting) {
        config.onDisconnect?.()
      }
    },
    [config]
  )

  // Handle realtime events
  const handleRealtimeEvent = useCallback(
    (payload: RealtimePayload<T>) => {
      const { eventType, new: newRecord, old: oldRecord } = payload

      // Check for conflicts with optimistic updates
      const optimisticUpdate = optimisticUpdatesRef.current.get(
        newRecord?.id || oldRecord?.id
      )

      if (optimisticUpdate && optimisticUpdate !== newRecord) {
        setState(prev => ({
          ...prev,
          conflicts: [...prev.conflicts, {
            id: newRecord?.id,
            local: optimisticUpdate,
            remote: newRecord,
            timestamp: new Date()
          }]
        }))
      }

      // Process event
      switch (eventType) {
        case 'INSERT':
          config.onInsert?.(newRecord)
          config.onChange?.(newRecord)
          break

        case 'UPDATE':
          config.onUpdate?.(newRecord)
          config.onChange?.(newRecord)
          break

        case 'DELETE':
          config.onDelete?.(oldRecord)
          config.onChange?.(oldRecord)
          break
      }

      setState(prev => ({
        ...prev,
        lastSync: new Date()
      }))
    },
    [config]
  )

  // Polling fallback
  const startPolling = useCallback(
    async (fetcher: () => Promise<T[]>) => {
      const poll = async () => {
        try {
          const data = await fetcher()
          config.onChange?.(data)
          setState(prev => ({
            ...prev,
            lastSync: new Date()
          }))
        } catch (error) {
          console.error('Polling error:', error)
        }
      }

      // Initial poll
      await poll()

      // Set up interval
      pollingIntervalRef.current = setInterval(
        poll,
        config.pollingInterval || 5000
      )
    },
    [config]
  )

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = undefined
    }
  }, [])

  // Reconnection logic
  const reconnect = useCallback(() => {
    if (reconnectAttemptsRef.current >= (config.maxReconnectAttempts || 5)) {
      toast.error('Failed to establish realtime connection')

      if (config.fallbackToPolling) {
        toast.info('Falling back to polling mode')
        // Start polling as fallback
      }
      return
    }

    updateConnectionState(false, true)
    reconnectAttemptsRef.current++

    const delay = Math.min(
      1000 * Math.pow(2, reconnectAttemptsRef.current),
      config.reconnectDelay || 10000
    )

    reconnectTimeoutRef.current = setTimeout(() => {
      if (channelRef.current) {
        channelRef.current.subscribe()
      }
    }, delay)
  }, [config, updateConnectionState])

  // Set up realtime subscription
  useEffect(() => {
    const setupChannel = () => {
      // Create channel
      const channelName = `${config.channel}-${Date.now()}`
      const channel = supabase.channel(channelName)

      // Set up presence tracking
      channel.on('presence', { event: 'sync' }, () => {
        updateConnectionState(true)
      })

      // Set up database changes listener if table is specified
      if (config.table) {
        const eventConfig: Record<string, unknown> = {
          event: config.event || '*',
          schema: config.schema || 'public',
          table: config.table
        }

        if (config.filter) {
          eventConfig.filter = config.filter
        }

        channel.on(
          'postgres_changes' as const,
          eventConfig as any,
          handleRealtimeEvent as any
        )
      }

      // Custom event listener
      if (config.event && !config.table) {
        channel.on('broadcast', { event: config.event }, (payload) => {
          config.onChange?.(payload)
          setState(prev => ({
            ...prev,
            lastSync: new Date()
          }))
        })
      }

      // Handle connection events
      channel
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            updateConnectionState(true)
          } else if (status === 'CHANNEL_ERROR') {
            updateConnectionState(false)
            reconnect()
          } else if (status === 'TIMED_OUT') {
            updateConnectionState(false)
            reconnect()
          }
        })

      channelRef.current = channel
    }

    setupChannel()

    // Cleanup
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
      stopPolling()
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [
    config.channel,
    config.event,
    config.table,
    config.schema,
    config.filter,
    supabase,
    handleRealtimeEvent,
    reconnect,
    stopPolling,
    updateConnectionState
  ])

  // Optimistic update tracking
  const trackOptimisticUpdate = useCallback((id: string, data: T) => {
    optimisticUpdatesRef.current.set(id, data)

    // Clear after 5 seconds
    setTimeout(() => {
      optimisticUpdatesRef.current.delete(id)
    }, 5000)
  }, [])

  // Conflict resolution
  const resolveConflict = useCallback(
    (conflictId: string, resolution: 'local' | 'remote' | 'merge', mergedData?: T) => {
      setState(prev => ({
        ...prev,
        conflicts: prev.conflicts.filter(c => c.id !== conflictId)
      }))

      // Apply resolution
      if (resolution === 'local') {
        const localData = optimisticUpdatesRef.current.get(conflictId)
        if (localData) {
          config.onChange?.(localData)
        }
      } else if (resolution === 'merge' && mergedData) {
        config.onChange?.(mergedData)
      }
      // 'remote' resolution doesn't need action as remote data is already applied
    },
    [config]
  )

  // Queue pending changes when offline
  const queueChange = useCallback((change: Partial<PendingChange<T>>) => {
    setState(prev => ({
      ...prev,
      pendingChanges: [...prev.pendingChanges, {
        ...change,
        timestamp: new Date(),
        id: `pending-${Date.now()}`
      }]
    }))
  }, [])

  // Sync pending changes
  const syncPendingChanges = useCallback(
    async (syncFn: (changes: PendingChange<T>[]) => Promise<void>) => {
      if (state.pendingChanges.length === 0) return

      try {
        await syncFn(state.pendingChanges)

        setState(prev => ({
          ...prev,
          pendingChanges: [],
          lastSync: new Date()
        }))

        toast.success('Pending changes synced')
      } catch (error) {
        toast.error('Failed to sync pending changes')
        config.onError?.(
          error instanceof Error ? error : new Error('Sync failed')
        )
      }
    },
    [state.pendingChanges, config]
  )

  // Manual sync trigger
  const forceSync = useCallback(async () => {
    if (channelRef.current) {
      try {
        await channelRef.current.track({ sync_request: Date.now() })
        setState(prev => ({
          ...prev,
          lastSync: new Date()
        }))
      } catch (error) {
        config.onError?.(
          error instanceof Error ? error : new Error('Force sync failed')
        )
      }
    }
  }, [config])

  return {
    state,
    isConnected: state.isConnected,
    isReconnecting: state.isReconnecting,
    lastSync: state.lastSync,
    pendingChanges: state.pendingChanges,
    conflicts: state.conflicts,
    actions: {
      trackOptimisticUpdate,
      resolveConflict,
      queueChange,
      syncPendingChanges,
      forceSync,
      startPolling,
      stopPolling
    }
  }
}

// Selective subscription manager
export class SubscriptionManager {
  private subscriptions = new Map<string, RealtimeChannel>()
  private supabase = createClient()

  subscribe<T = unknown>(
    key: string,
    config: Omit<RealtimeSyncConfig<T>, 'channel'>
  ): () => void {
    if (this.subscriptions.has(key)) {
      return () => this.unsubscribe(key)
    }

    const channel = this.supabase.channel(key)

    if (config.table) {
      channel.on(
        'postgres_changes' as const,
        {
          event: config.event || '*',
          schema: config.schema || 'public',
          table: config.table,
          filter: config.filter
        } as any,
        (payload: RealtimePayload<T>) => {
          const { eventType, new: newRecord, old: oldRecord } = payload

          switch (eventType) {
            case 'INSERT':
              config.onInsert?.(newRecord)
              break
            case 'UPDATE':
              config.onUpdate?.(newRecord)
              break
            case 'DELETE':
              config.onDelete?.(oldRecord)
              break
          }

          config.onChange?.(payload)
        }
      )
    }

    channel.subscribe()
    this.subscriptions.set(key, channel)

    return () => this.unsubscribe(key)
  }

  unsubscribe(key: string): void {
    const channel = this.subscriptions.get(key)
    if (channel) {
      this.supabase.removeChannel(channel)
      this.subscriptions.delete(key)
    }
  }

  unsubscribeAll(): void {
    this.subscriptions.forEach((channel, key) => {
      this.supabase.removeChannel(channel)
    })
    this.subscriptions.clear()
  }

  isSubscribed(key: string): boolean {
    return this.subscriptions.has(key)
  }

  getActiveSubscriptions(): string[] {
    return Array.from(this.subscriptions.keys())
  }
}

// Global subscription manager instance
export const subscriptionManager = new SubscriptionManager()

// Optimistic reconciliation helper
export function reconcileOptimisticUpdate<T extends { id: string }>(
  optimistic: T,
  remote: T,
  conflictFields?: (keyof T)[]
): { hasConflict: boolean; conflicts: string[]; merged: T } {
  const conflicts: string[] = []
  const merged = { ...optimistic }

  const fieldsToCheck = conflictFields || (Object.keys(optimistic) as (keyof T)[])

  fieldsToCheck.forEach(field => {
    if (field !== 'id' && optimistic[field] !== remote[field]) {
      conflicts.push(String(field))
      // By default, prefer remote value
      merged[field] = remote[field]
    }
  })

  return {
    hasConflict: conflicts.length > 0,
    conflicts,
    merged
  }
}