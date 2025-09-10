'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'

type Salon = Database['public']['Tables']['salons']['Row']

export function useSalon(salonId?: string) {
  const [salon, setSalon] = useState<Salon | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!salonId) {
      setLoading(false)
      return
    }

    const fetchSalon = async () => {
      try {
        const { data, error } = await supabase
          .from('salons')
          .select('*')
          .eq('id', salonId)
          .single()

        if (error) throw error
        setSalon(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch salon')
      } finally {
        setLoading(false)
      }
    }

    fetchSalon()
  }, [salonId, supabase])

  return { salon, loading, error }
}

export function useSalons() {
  const [salons, setSalons] = useState<Salon[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchSalons = async () => {
      try {
        const { data, error } = await supabase
          .from('salons')
          .select('*')
          .eq('is_active', true)
          .order('name')

        if (error) throw error
        setSalons(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch salons')
      } finally {
        setLoading(false)
      }
    }

    fetchSalons()
  }, [supabase])

  return { salons, loading, error }
}