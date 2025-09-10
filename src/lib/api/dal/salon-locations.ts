import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database.types'
import { requireAuth } from './auth'

type Tables = Database['public']['Tables']
type SalonLocation = Tables['salon_locations']['Row']
type SalonLocationInsert = Tables['salon_locations']['Insert']
type SalonLocationUpdate = Tables['salon_locations']['Update']

export interface SalonLocationDTO {
  id: string
  salon_id: string
  name: string
  address_line_1: string
  address_line_2: string | null
  city: string
  state_province: string
  postal_code: string
  country: string
  phone: string | null
  email: string | null
  operating_hours: Record<string, unknown> | null
  is_active: boolean
  latitude: number | null
  longitude: number | null
  created_at: string
  updated_at: string
}

function toSalonLocationDTO(location: SalonLocation): SalonLocationDTO {
  return {
    id: location.id,
    salon_id: location.salon_id,
    name: location.name || 'Main Location',
    address_line_1: location.address_line_1,
    address_line_2: location.address_line_2,
    city: location.city,
    state_province: location.state_province,
    postal_code: location.postal_code,
    country: location.country || 'USA',
    phone: location.phone,
    email: location.email,
    operating_hours: location.operating_hours as Record<string, unknown> | null,
    is_active: location.is_active ?? true,
    latitude: location.latitude,
    longitude: location.longitude,
    created_at: location.created_at || new Date().toISOString(),
    updated_at: location.updated_at || new Date().toISOString()
  }
}

export const getSalonLocations = cache(async (
  salonId: string
): Promise<SalonLocationDTO[]> => {
  await requireAuth()
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('salon_locations')
    .select('*')
    .eq('salon_id', salonId)
    .order('created_at', { ascending: true })
  
  if (error) {
    console.error('Error fetching salon locations:', error)
    return []
  }
  
  return (data || []).map(toSalonLocationDTO)
})

export const getSalonLocationById = cache(async (
  id: string
): Promise<SalonLocationDTO | null> => {
  await requireAuth()
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('salon_locations')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Error fetching salon location:', error)
    return null
  }
  
  return data ? toSalonLocationDTO(data) : null
})

export const getPrimarySalonLocation = cache(async (
  salonId: string
): Promise<SalonLocationDTO | null> => {
  await requireAuth()
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('salon_locations')
    .select('*')
    .eq('salon_id', salonId)
    .single()
  
  if (error) {
    console.error('Error fetching primary salon location:', error)
    return null
  }
  
  return data ? toSalonLocationDTO(data) : null
})

export const getActiveSalonLocations = cache(async (
  salonId: string
): Promise<SalonLocationDTO[]> => {
  await requireAuth()
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('salon_locations')
    .select('*')
    .eq('salon_id', salonId)
    .eq('is_active', true)
    .order('created_at', { ascending: true })
  
  if (error) {
    console.error('Error fetching active salon locations:', error)
    return []
  }
  
  return (data || []).map(toSalonLocationDTO)
})

export async function createSalonLocation(
  location: SalonLocationInsert
): Promise<SalonLocationDTO | null> {
  await requireAuth()
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('salon_locations')
    .insert(location)
    .select()
    .single()
  
  if (error) {
    console.error('Error creating salon location:', error)
    throw new Error('Failed to create salon location')
  }
  
  return data ? toSalonLocationDTO(data) : null
}

export async function updateSalonLocation(
  id: string,
  updates: SalonLocationUpdate
): Promise<SalonLocationDTO | null> {
  await requireAuth()
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('salon_locations')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating salon location:', error)
    throw new Error('Failed to update salon location')
  }
  
  return data ? toSalonLocationDTO(data) : null
}

export async function deleteSalonLocation(id: string): Promise<boolean> {
  await requireAuth()
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('salon_locations')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting salon location:', error)
    throw new Error('Failed to delete salon location')
  }
  
  return true
}

export async function activateSalonLocation(id: string): Promise<boolean> {
  await requireAuth()
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('salon_locations')
    .update({ is_active: true })
    .eq('id', id)
  
  if (error) {
    console.error('Error activating salon location:', error)
    throw new Error('Failed to activate salon location')
  }
  
  return true
}

export async function deactivateSalonLocation(id: string): Promise<boolean> {
  await requireAuth()
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('salon_locations')
    .update({ is_active: false })
    .eq('id', id)
  
  if (error) {
    console.error('Error deactivating salon location:', error)
    throw new Error('Failed to deactivate salon location')
  }
  
  return true
}