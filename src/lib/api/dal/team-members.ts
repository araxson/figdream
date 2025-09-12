import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database.types'

type TeamMemberInsert = Database['public']['Tables']['team_members']['Insert']
type TeamMemberUpdate = Database['public']['Tables']['team_members']['Update']

export async function getTeamMembers() {
  const supabase = await createClient()
  
  // Verify authentication in DAL layer (CVE-2025-29927)
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Error fetching team members:', error)
    throw new Error('Failed to fetch team members')
  }

  return data || []
}

export async function getTeamMemberById(id: string) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching team member:', error)
    throw new Error('Failed to fetch team member')
  }

  return data
}

export async function createTeamMember(member: TeamMemberInsert) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  // Check if user has admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile?.role || profile.role !== 'super_admin') {
    throw new Error('Insufficient permissions')
  }

  const { data, error } = await supabase
    .from('team_members')
    .insert([member])
    .select()
    .single()

  if (error) {
    console.error('Error creating team member:', error)
    throw new Error('Failed to create team member')
  }

  return data
}

export async function updateTeamMember(id: string, updates: TeamMemberUpdate) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  // Check if user has admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile?.role || profile.role !== 'super_admin') {
    throw new Error('Insufficient permissions')
  }

  const { data, error } = await supabase
    .from('team_members')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating team member:', error)
    throw new Error('Failed to update team member')
  }

  return data
}

export async function deleteTeamMember(id: string) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  // Check if user has admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile?.role || profile.role !== 'super_admin') {
    throw new Error('Insufficient permissions')
  }

  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting team member:', error)
    throw new Error('Failed to delete team member')
  }

  return { success: true }
}

export async function getActiveTeamMembers() {
  const supabase = await createClient()
  
  // Public endpoint - no auth required for viewing active team
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Error fetching active team members:', error)
    throw new Error('Failed to fetch team members')
  }

  return data || []
}