import { useState, useEffect } from 'react'
import { getSalonByIdAction, updateSalonAction, updateSalonSettingsAction, updateBusinessHoursAction } from '../actions/salons-actions'
import type { ActionResponse } from '../actions/salons-actions'

interface UseSalonDataOptions {
  salonId: string
  autoRefresh?: boolean
  refreshInterval?: number
}

export function useSalonData({ salonId, autoRefresh = false, refreshInterval = 60000 }: UseSalonDataOptions) {
  const [salon, setSalon] = useState<any>(null)
  const [metrics, setMetrics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  // Fetch salon data
  const fetchSalonData = async () => {
    try {
      setError(null)
      const response: ActionResponse = await getSalonByIdAction(salonId)

      if (response.success) {
        setSalon(response.data)
        setMetrics(response.data.metrics)
      } else {
        setError(response.error || 'Failed to load salon data')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load salon')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Refresh data
  const refresh = async () => {
    setRefreshing(true)
    await fetchSalonData()
  }

  // Update salon
  const updateSalon = async (data: any) => {
    try {
      const response = await updateSalonAction(salonId, data)

      if (response.success) {
        setSalon((prev: any) => ({ ...prev, ...data }))
        return { success: true }
      } else {
        return { success: false, error: response.error }
      }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to update salon'
      }
    }
  }

  // Update settings
  const updateSettings = async (settings: any) => {
    try {
      const response = await updateSalonSettingsAction(salonId, settings)

      if (response.success) {
        setSalon((prev: any) => ({
          ...prev,
          settings: { ...prev.settings, ...settings }
        }))
        return { success: true }
      } else {
        return { success: false, error: response.error }
      }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to update settings'
      }
    }
  }

  // Update business hours
  const updateHours = async (hours: any) => {
    try {
      const response = await updateBusinessHoursAction(salonId, hours)

      if (response.success) {
        setSalon((prev: any) => ({
          ...prev,
          settings: {
            ...prev.settings,
            business_hours: hours
          }
        }))
        return { success: true }
      } else {
        return { success: false, error: response.error }
      }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to update business hours'
      }
    }
  }

  // Initial fetch
  useEffect(() => {
    if (salonId) {
      fetchSalonData()
    }
  }, [salonId])

  // Auto refresh
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(refresh, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval])

  return {
    salon,
    metrics,
    loading,
    error,
    refreshing,
    refresh,
    updateSalon,
    updateSettings,
    updateHours
  }
}

// Hook for salon analytics
export function useSalonAnalytics(salonId: string, timeRange = 'month') {
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)

      // In a real implementation, this would call an analytics-specific endpoint
      // For now, we'll use the metrics from the salon data
      const response = await getSalonByIdAction(salonId)

      if (response.success) {
        setAnalytics(response.data.metrics)
      } else {
        setError(response.error || 'Failed to load analytics')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (salonId) {
      fetchAnalytics()
    }
  }, [salonId, timeRange])

  return { analytics, loading, error, refetch: fetchAnalytics }
}

// Hook for service catalog
export function useServiceCatalog(salonId: string) {
  const [services, setServices] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchServices = async () => {
    try {
      setLoading(true)
      setError(null)

      // This would call a service-specific endpoint
      const response = await getSalonByIdAction(salonId)

      if (response.success) {
        setServices(response.data.services || [])
        // Categories would come from a separate endpoint
        setCategories([])
      } else {
        setError(response.error || 'Failed to load services')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load services')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (salonId) {
      fetchServices()
    }
  }, [salonId])

  return {
    services,
    categories,
    loading,
    error,
    refetch: fetchServices
  }
}

// Hook for location management
export function useLocations(salonId: string) {
  const [locations, setLocations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLocations = async () => {
    try {
      setLoading(true)
      setError(null)

      // This would call a locations-specific endpoint
      // For now, return mock data or empty array
      setLocations([])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load locations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (salonId) {
      fetchLocations()
    }
  }, [salonId])

  return {
    locations,
    loading,
    error,
    refetch: fetchLocations
  }
}