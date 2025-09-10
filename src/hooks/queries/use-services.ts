'use client'

import { useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useServices() {
  const supabase = useMemo(() => {
    return createClient()
  }, [])

  return {
    supabase,
    // Services can be added here as needed
    // e.g., appointments: new AppointmentService(supabase)
  }
}

export function useAppointmentService() {
  const { supabase } = useServices()
  return {
    supabase,
    // Appointment-specific methods can be added here
  }
}

export function useCustomerService() {
  const { supabase } = useServices()
  return {
    supabase,
    // Customer-specific methods can be added here
  }
}

export function useSalonService() {
  const { supabase } = useServices()
  return {
    supabase,
    // Salon-specific methods can be added here
  }
}

export function useServiceCatalogService() {
  const { supabase } = useServices()
  return {
    supabase,
    // Service catalog-specific methods can be added here
  }
}

export function useStaffService() {
  const { supabase } = useServices()
  return {
    supabase,
    // Staff-specific methods can be added here
  }
}

export function useReviewService() {
  const { supabase } = useServices()
  return {
    supabase,
    // Review-specific methods can be added here
  }
}

export function useAnalyticsService() {
  const { supabase } = useServices()
  return {
    supabase,
    // Analytics-specific methods can be added here
  }
}

export function useNotificationService() {
  const { supabase } = useServices()
  return {
    supabase,
    // Notification-specific methods can be added here
  }
}