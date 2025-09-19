'use client'

import { useState, useEffect, useCallback, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, WifiOff, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { toast } from 'sonner'

export interface RetryConfig {
  maxAttempts?: number
  initialDelay?: number
  maxDelay?: number
  backoffFactor?: number
  onRetry?: (attempt: number, error: Error) => void
}

export interface OfflineQueueItem<T = any> {
  id: string
  action: () => Promise<T>
  timestamp: number
  attempts: number
  lastError?: Error
}

export interface ErrorRecoveryProps {
  error?: Error | null
  onRetry?: () => Promise<void>
  onDismiss?: () => void
  retryConfig?: RetryConfig
  children?: ReactNode
  showOfflineIndicator?: boolean
}

// Exponential backoff retry function
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    onRetry
  } = config

  let lastError: Error

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error')

      if (attempt === maxAttempts) {
        throw lastError
      }

      onRetry?.(attempt, lastError)

      const delay = Math.min(
        initialDelay * Math.pow(backoffFactor, attempt - 1),
        maxDelay
      )

      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError!
}

// Offline queue manager
class OfflineQueue {
  private queue: OfflineQueueItem[] = []
  private processing = false

  add<T>(action: () => Promise<T>): string {
    const id = `queue-${Date.now()}-${Math.random()}`
    this.queue.push({
      id,
      action,
      timestamp: Date.now(),
      attempts: 0
    })

    if (!this.processing) {
      this.process()
    }

    return id
  }

  remove(id: string): void {
    this.queue = this.queue.filter(item => item.id !== id)
  }

  async process(): Promise<void> {
    if (this.processing || this.queue.length === 0) return

    this.processing = true

    while (this.queue.length > 0 && navigator.onLine) {
      const item = this.queue[0]

      try {
        item.attempts++
        await item.action()
        this.queue.shift()
        toast.success('Offline action synced')
      } catch (error) {
        item.lastError = error instanceof Error ? error : new Error('Sync failed')

        if (item.attempts >= 3) {
          this.queue.shift()
          toast.error('Failed to sync offline action')
        } else {
          // Move to back of queue
          this.queue.push(this.queue.shift()!)
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
      }
    }

    this.processing = false
  }

  getQueue(): OfflineQueueItem[] {
    return [...this.queue]
  }

  clear(): void {
    this.queue = []
  }
}

// Global offline queue instance
const offlineQueue = new OfflineQueue()

// Network status hook
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof window !== 'undefined' ? navigator.onLine : true
  )

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      toast.success('Connection restored')
      offlineQueue.process()
    }

    const handleOffline = () => {
      setIsOnline(false)
      toast.error('Connection lost - working offline')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}

// Error recovery component
export function ErrorRecovery({
  error,
  onRetry,
  onDismiss,
  retryConfig,
  children,
  showOfflineIndicator = true
}: ErrorRecoveryProps) {
  const [isRetrying, setIsRetrying] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const isOnline = useNetworkStatus()

  const handleRetry = useCallback(async () => {
    if (!onRetry) return

    setIsRetrying(true)
    setRetryCount(prev => prev + 1)

    try {
      await retryWithBackoff(onRetry, {
        ...retryConfig,
        onRetry: (attempt) => {
          toast.loading(`Retrying... (attempt ${attempt})`)
        }
      })

      toast.success('Operation successful')
      onDismiss?.()
    } catch (error) {
      toast.error('Retry failed - please try again later')
    } finally {
      setIsRetrying(false)
    }
  }, [onRetry, onDismiss, retryConfig])

  if (!isOnline && showOfflineIndicator) {
    return (
      <Alert className="mb-4">
        <WifiOff className="h-4 w-4" />
        <AlertTitle>Working Offline</AlertTitle>
        <AlertDescription>
          Your changes will be synced when connection is restored
        </AlertDescription>
      </Alert>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Operation Failed</AlertTitle>
        <AlertDescription className="space-y-2">
          <p>{error.message}</p>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleRetry}
              disabled={isRetrying}
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-3 w-3" />
                  Retry
                </>
              )}
            </Button>
            {onDismiss && (
              <Button
                size="sm"
                variant="outline"
                onClick={onDismiss}
              >
                Dismiss
              </Button>
            )}
          </div>
          {retryCount > 0 && (
            <p className="text-xs text-muted-foreground">
              Retry attempts: {retryCount}
            </p>
          )}
        </AlertDescription>
      </Alert>
    )
  }

  return <>{children}</>
}

// Conflict resolution dialog
export interface ConflictData<T> {
  local: T
  remote: T
  field: string
}

export interface ConflictResolutionProps<T> {
  conflicts: ConflictData<T>[]
  onResolve: (resolution: 'local' | 'remote' | 'merge', data?: T) => void
  onCancel: () => void
}

export function ConflictResolution<T extends Record<string, any>>({
  conflicts,
  onResolve,
  onCancel
}: ConflictResolutionProps<T>) {
  const [selectedResolutions, setSelectedResolutions] = useState<
    Record<string, 'local' | 'remote'>
  >({})

  const handleResolve = () => {
    const hasCustomResolutions = Object.keys(selectedResolutions).length > 0

    if (hasCustomResolutions) {
      // Merge based on field-level selections
      const mergedData = conflicts.reduce((acc, conflict) => {
        const resolution = selectedResolutions[conflict.field] || 'remote'
        acc[conflict.field as keyof T] =
          resolution === 'local' ? conflict.local : conflict.remote
        return acc
      }, {} as T)

      onResolve('merge', mergedData)
    } else {
      onResolve('remote')
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Resolve Conflicts</CardTitle>
        <CardDescription>
          The data has been modified elsewhere. Choose which version to keep.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {conflicts.map((conflict, index) => (
          <div key={index} className="space-y-2 p-4 border rounded">
            <h4 className="font-medium">{conflict.field}</h4>
            <div className="grid grid-cols-2 gap-4">
              <div
                className={`p-2 border rounded cursor-pointer ${
                  selectedResolutions[conflict.field] === 'local'
                    ? 'border-primary bg-primary/10'
                    : ''
                }`}
                onClick={() =>
                  setSelectedResolutions(prev => ({
                    ...prev,
                    [conflict.field]: 'local'
                  }))
                }
              >
                <p className="text-sm font-medium">Your Version</p>
                <p className="text-sm text-muted-foreground">
                  {JSON.stringify(conflict.local)}
                </p>
              </div>
              <div
                className={`p-2 border rounded cursor-pointer ${
                  selectedResolutions[conflict.field] === 'remote' ||
                  !selectedResolutions[conflict.field]
                    ? 'border-primary bg-primary/10'
                    : ''
                }`}
                onClick={() =>
                  setSelectedResolutions(prev => ({
                    ...prev,
                    [conflict.field]: 'remote'
                  }))
                }
              >
                <p className="text-sm font-medium">Server Version</p>
                <p className="text-sm text-muted-foreground">
                  {JSON.stringify(conflict.remote)}
                </p>
              </div>
            </div>
          </div>
        ))}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={() => onResolve('local')}>
            Keep All Mine
          </Button>
          <Button onClick={() => onResolve('remote')}>
            Keep All Theirs
          </Button>
          <Button onClick={handleResolve}>
            Apply Selected
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Sync status indicator
export interface SyncStatusProps {
  isSyncing: boolean
  lastSyncTime?: Date
  pendingChanges?: number
  onSync?: () => void
}

export function SyncStatus({
  isSyncing,
  lastSyncTime,
  pendingChanges = 0,
  onSync
}: SyncStatusProps) {
  const isOnline = useNetworkStatus()

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      {!isOnline ? (
        <>
          <WifiOff className="h-4 w-4" />
          <span>Offline</span>
        </>
      ) : isSyncing ? (
        <>
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Syncing...</span>
        </>
      ) : pendingChanges > 0 ? (
        <>
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          <span>{pendingChanges} pending changes</span>
          {onSync && (
            <Button size="sm" variant="ghost" onClick={onSync}>
              Sync now
            </Button>
          )}
        </>
      ) : (
        <>
          <Check className="h-4 w-4 text-green-500" />
          <span>
            Synced {lastSyncTime ?
              `${new Date(lastSyncTime).toLocaleTimeString()}` :
              'up to date'
            }
          </span>
        </>
      )}
    </div>
  )
}

// Export utilities
export { offlineQueue, OfflineQueue }