import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { verifySession } from '@/lib/api/dal/auth'
import { Database } from '@/types/database.types'

export type AlertConfigurationDTO = Database['public']['Tables']['alert_configuration']['Row']
export type AlertHistoryDTO = Database['public']['Tables']['alert_history']['Row']

export const getAlertConfigurations = cache(async (): Promise<AlertConfigurationDTO[]> => {
  const session = await verifySession()
  if (!session) return []
  
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('alert_configuration')
    .select('*')
    .order('alert_name')
  
  if (error) {
    console.error('Error fetching alert configurations:', error)
    return []
  }
  
  return data || []
})

export const getAlertHistory = cache(async (limit = 100): Promise<AlertHistoryDTO[]> => {
  const session = await verifySession()
  if (!session) return []
  
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('alert_history')
    .select('*')
    .order('triggered_at', { ascending: false })
    .limit(limit)
  
  if (error) {
    console.error('Error fetching alert history:', error)
    return []
  }
  
  return data || []
})

export async function toggleAlertConfiguration(
  id: string,
  enabled: boolean
): Promise<boolean> {
  const session = await verifySession()
  if (!session) return false
  
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('alert_configuration')
    .update({ is_enabled: enabled })
    .eq('id', id)
  
  if (error) {
    console.error('Error toggling alert configuration:', error)
    return false
  }
  
  return true
}

export async function createAlertConfiguration(
  data: Database['public']['Tables']['alert_configuration']['Insert']
): Promise<boolean> {
  const session = await verifySession()
  if (!session) return false
  
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('alert_configuration')
    .insert(data)
  
  if (error) {
    console.error('Error creating alert configuration:', error)
    return false
  }
  
  return true
}

export async function updateAlertConfiguration(
  id: string,
  data: Database['public']['Tables']['alert_configuration']['Update']
): Promise<boolean> {
  const session = await verifySession()
  if (!session) return false
  
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('alert_configuration')
    .update(data)
    .eq('id', id)
  
  if (error) {
    console.error('Error updating alert configuration:', error)
    return false
  }
  
  return true
}

export async function deleteAlertConfiguration(
  id: string
): Promise<boolean> {
  const session = await verifySession()
  if (!session) return false
  
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('alert_configuration')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting alert configuration:', error)
    return false
  }
  
  return true
}