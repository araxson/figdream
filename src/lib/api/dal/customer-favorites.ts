import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database.types'
import { requireAuth } from './auth'

type Tables = Database['public']['Tables']
type CustomerFavorite = Tables['customer_favorites']['Row']
type CustomerFavoriteInsert = Tables['customer_favorites']['Insert']

export interface CustomerFavoriteDTO {
  id: string
  customer_id: string
  salon_id: string | null
  staff_id: string | null
  service_id: string | null
  created_at: string
}

function toCustomerFavoriteDTO(favorite: CustomerFavorite): CustomerFavoriteDTO {
  return {
    id: favorite.id,
    customer_id: favorite.customer_id,
    salon_id: favorite.salon_id,
    staff_id: favorite.staff_id,
    service_id: favorite.service_id,
    created_at: favorite.created_at || new Date().toISOString()
  }
}

export const getCustomerFavorites = cache(async (
  customerId: string
): Promise<CustomerFavoriteDTO[]> => {
  await requireAuth()
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('customer_favorites')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching customer favorites:', error)
    return []
  }
  
  return (data || []).map(toCustomerFavoriteDTO)
})

export const getFavoriteSalons = cache(async (
  customerId: string
): Promise<CustomerFavoriteDTO[]> => {
  await requireAuth()
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('customer_favorites')
    .select('*')
    .eq('customer_id', customerId)
    .not('salon_id', 'is', null)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching favorite salons:', error)
    return []
  }
  
  return (data || []).map(toCustomerFavoriteDTO)
})

export const getFavoriteStaff = cache(async (
  customerId: string
): Promise<CustomerFavoriteDTO[]> => {
  await requireAuth()
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('customer_favorites')
    .select('*')
    .eq('customer_id', customerId)
    .not('staff_id', 'is', null)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching favorite staff:', error)
    return []
  }
  
  return (data || []).map(toCustomerFavoriteDTO)
})

export const getFavoriteServices = cache(async (
  customerId: string
): Promise<CustomerFavoriteDTO[]> => {
  await requireAuth()
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('customer_favorites')
    .select('*')
    .eq('customer_id', customerId)
    .not('service_id', 'is', null)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching favorite services:', error)
    return []
  }
  
  return (data || []).map(toCustomerFavoriteDTO)
})

export async function addFavorite(
  favorite: CustomerFavoriteInsert
): Promise<CustomerFavoriteDTO | null> {
  await requireAuth()
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('customer_favorites')
    .insert(favorite)
    .select()
    .single()
  
  if (error) {
    console.error('Error adding favorite:', error)
    throw new Error('Failed to add favorite')
  }
  
  return data ? toCustomerFavoriteDTO(data) : null
}

export async function removeFavorite(id: string): Promise<boolean> {
  await requireAuth()
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('customer_favorites')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error removing favorite:', error)
    throw new Error('Failed to remove favorite')
  }
  
  return true
}

export async function checkFavorite(
  customerId: string,
  salonId?: string,
  staffId?: string,
  serviceId?: string
): Promise<boolean> {
  await requireAuth()
  const supabase = await createClient()
  
  let query = supabase
    .from('customer_favorites')
    .select('id')
    .eq('customer_id', customerId)
  
  if (salonId) query = query.eq('salon_id', salonId)
  if (staffId) query = query.eq('staff_id', staffId)
  if (serviceId) query = query.eq('service_id', serviceId)
  
  const { data, error } = await query.single()
  
  if (error) {
    return false
  }
  
  return !!data
}