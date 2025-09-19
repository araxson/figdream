import { createClient } from '@/lib/supabase/server'
import type {
  Product,
  ProductCategory,
  ProductFormData,
  CategoryFormData
} from './types'

// ============= PRODUCTS =============

export async function createProduct(salonId: string, data: ProductFormData): Promise<Product> {
  const supabase = await createClient()

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Unauthorized')

  const { data: product, error } = await supabase
    .from('products')
    .insert({
      salon_id: salonId,
      ...data
    })
    .select()
    .single()

  if (error) throw error
  return product
}

export async function updateProduct(id: string, data: Partial<ProductFormData>): Promise<Product> {
  const supabase = await createClient()

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Unauthorized')

  const { data: product, error } = await supabase
    .from('products')
    .update({
      ...data,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return product
}

export async function deleteProduct(id: string): Promise<void> {
  const supabase = await createClient()

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ============= CATEGORIES =============

export async function createCategory(salonId: string, data: CategoryFormData): Promise<ProductCategory> {
  const supabase = await createClient()

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Unauthorized')

  const { data: category, error } = await supabase
    .from('product_categories')
    .insert({
      salon_id: salonId,
      ...data
    })
    .select()
    .single()

  if (error) throw error
  return category
}

export async function updateCategory(id: string, data: Partial<CategoryFormData>): Promise<ProductCategory> {
  const supabase = await createClient()

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Unauthorized')

  const { data: category, error } = await supabase
    .from('product_categories')
    .update({
      ...data,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return category
}

export async function deleteCategory(id: string): Promise<void> {
  const supabase = await createClient()

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('product_categories')
    .delete()
    .eq('id', id)

  if (error) throw error
}