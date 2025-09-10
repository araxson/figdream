'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'

type Appointment = Database['public']['Tables']['appointments']['Row']

export function useAppointments(userId?: string) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        let query = supabase.from('appointments').select('*')
        
        if (userId) {
          // This would need to be adjusted based on your actual schema
          query = query.eq('customer_id', userId)
        }
        
        const { data, error } = await query.order('start_time', { ascending: false })

        if (error) throw error
        setAppointments(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch appointments')
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()

    // Subscribe to real-time changes
    const channel = supabase
      .channel('appointments_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: userId ? `customer_id=eq.${userId}` : undefined
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setAppointments(prev => [payload.new as Appointment, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setAppointments(prev =>
              prev.map(apt => apt.id === payload.new.id ? payload.new as Appointment : apt)
            )
          } else if (payload.eventType === 'DELETE') {
            setAppointments(prev => prev.filter(apt => apt.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, supabase])

  return { appointments, loading, error }
}