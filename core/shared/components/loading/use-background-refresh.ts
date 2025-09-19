import { useEffect, useState } from 'react'

export function useBackgroundRefresh<T>(
  fetcher: () => Promise<T>,
  options: {
    interval?: number
    enabled?: boolean
    onSuccess?: (data: T) => void
    onError?: (error: Error) => void
  } = {}
) {
  const {
    interval = 30000,
    enabled = true,
    onSuccess,
    onError
  } = options

  const [data, setData] = useState<T | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    if (!enabled) return

    const refresh = async () => {
      setIsRefreshing(true)
      try {
        const newData = await fetcher()
        setData(newData)
        onSuccess?.(newData)
      } catch (error) {
        onError?.(error instanceof Error ? error : new Error('Refresh failed'))
      } finally {
        setIsRefreshing(false)
      }
    }

    // Initial fetch
    refresh()

    // Set up interval
    const intervalId = setInterval(refresh, interval)

    // Refresh on focus
    const handleFocus = () => {
      if (document.visibilityState === 'visible') {
        refresh()
      }
    }

    document.addEventListener('visibilitychange', handleFocus)

    return () => {
      clearInterval(intervalId)
      document.removeEventListener('visibilitychange', handleFocus)
    }
  }, [fetcher, interval, enabled, onSuccess, onError])

  return { data, isRefreshing }
}