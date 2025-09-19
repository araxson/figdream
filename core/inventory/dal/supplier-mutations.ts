import { createClient } from '@/lib/supabase/server'
import type {
  Supplier,
  SupplierFormData
} from './types'

// ============= SUPPLIERS =============

export async function createSupplier(salonId: string, data: SupplierFormData): Promise<Supplier> {
  const supabase = await createClient()

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Unauthorized')

  const { data: supplier, error } = await supabase
    .from('suppliers')
    .insert({
      salon_id: salonId,
      ...data
    })
    .select()
    .single()

  if (error) throw error
  return supplier
}

export async function updateSupplier(id: string, data: Partial<SupplierFormData>): Promise<Supplier> {
  const supabase = await createClient()

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Unauthorized')

  const { data: supplier, error } = await supabase
    .from('suppliers')
    .update({
      ...data,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return supplier
}

export async function deleteSupplier(id: string): Promise<void> {
  const supabase = await createClient()

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('suppliers')
    .delete()
    .eq('id', id)

  if (error) throw error
}