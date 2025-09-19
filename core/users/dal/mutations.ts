import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database.types'

type UserInsert = Database['public']['Tables']['users']['Insert']
type UserUpdate = Database['public']['Tables']['users']['Update']

export async function updateUser(id: string, updates: UserUpdate) {
  const supabase = createClient()

  const { data: user } = await supabase.auth.getUser()
  if (!user.user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteUser(id: string) {
  const supabase = createClient()

  const { data: user } = await supabase.auth.getUser()
  if (!user.user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id)

  if (error) throw error
}