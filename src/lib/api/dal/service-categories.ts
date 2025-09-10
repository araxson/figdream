import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database.types'
import { requireAuth } from './auth'

type Tables = Database['public']['Tables']
type ServiceCategory = Tables['service_categories']['Row']
type ServiceCategoryInsert = Tables['service_categories']['Insert']
type ServiceCategoryUpdate = Tables['service_categories']['Update']

export interface ServiceCategoryDTO {
  id: string
  salon_id: string
  name: string
  description: string | null
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string | null
}

function toServiceCategoryDTO(category: ServiceCategory): ServiceCategoryDTO {
  return {
    id: category.id,
    salon_id: category.salon_id,
    name: category.name,
    description: category.description,
    display_order: category.display_order ?? 0,
    is_active: category.is_active ?? true,
    created_at: category.created_at || new Date().toISOString(),
    updated_at: category.updated_at
  }
}

export const getServiceCategories = cache(async (
  salonId: string
): Promise<ServiceCategoryDTO[]> => {
  await requireAuth()
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('service_categories')
    .select('*')
    .eq('salon_id', salonId)
    .order('display_order')
    .order('name')
  
  if (error) {
    console.error('Error fetching service categories:', error)
    return []
  }
  
  return (data || []).map(toServiceCategoryDTO)
})

export const getActiveServiceCategories = cache(async (
  salonId: string
): Promise<ServiceCategoryDTO[]> => {
  await requireAuth()
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('service_categories')
    .select('*')
    .eq('salon_id', salonId)
    .eq('is_active', true)
    .order('display_order')
    .order('name')
  
  if (error) {
    console.error('Error fetching active service categories:', error)
    return []
  }
  
  return (data || []).map(toServiceCategoryDTO)
})

export const getServiceCategoryById = cache(async (
  id: string
): Promise<ServiceCategoryDTO | null> => {
  await requireAuth()
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('service_categories')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Error fetching service category:', error)
    return null
  }
  
  return data ? toServiceCategoryDTO(data) : null
})

export async function createServiceCategory(
  category: ServiceCategoryInsert
): Promise<ServiceCategoryDTO | null> {
  await requireAuth()
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('service_categories')
    .insert(category)
    .select()
    .single()
  
  if (error) {
    console.error('Error creating service category:', error)
    throw new Error('Failed to create service category')
  }
  
  return data ? toServiceCategoryDTO(data) : null
}

export async function updateServiceCategory(
  id: string,
  updates: ServiceCategoryUpdate
): Promise<ServiceCategoryDTO | null> {
  await requireAuth()
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('service_categories')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating service category:', error)
    throw new Error('Failed to update service category')
  }
  
  return data ? toServiceCategoryDTO(data) : null
}

export async function deleteServiceCategory(id: string): Promise<boolean> {
  await requireAuth()
  const supabase = await createClient()
  
  // Check if category has services
  const { data: services } = await supabase
    .from('services')
    .select('id')
    .eq('category_id', id)
    .limit(1)
  
  if (services && services.length > 0) {
    throw new Error('Cannot delete category with existing services')
  }
  
  const { error } = await supabase
    .from('service_categories')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting service category:', error)
    throw new Error('Failed to delete service category')
  }
  
  return true
}

export async function reorderServiceCategories(
  salonId: string,
  categoryOrders: Array<{ id: string; display_order: number }>
): Promise<boolean> {
  await requireAuth()
  const supabase = await createClient()
  
  // Update all categories in a transaction
  const updates = categoryOrders.map(({ id, display_order }) =>
    supabase
      .from('service_categories')
      .update({ 
        display_order,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('salon_id', salonId)
  )
  
  const results = await Promise.all(updates)
  const hasErrors = results.some(result => result.error)
  
  if (hasErrors) {
    console.error('Error reordering service categories')
    throw new Error('Failed to reorder service categories')
  }
  
  return true
}