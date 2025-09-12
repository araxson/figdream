import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database.types'

type RolePermissionTemplate = Database['public']['Tables']['role_permission_templates']['Row']

export async function getRolePermissions() {
  const supabase = await createClient()
  
  // Verify authentication in DAL layer (CVE-2025-29927)
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  // Check if user has admin privileges
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile?.role || profile.role !== 'super_admin') {
    throw new Error('Insufficient permissions')
  }

  // Fetch role permission templates from database
  const { data, error } = await supabase
    .from('role_permission_templates')
    .select('*')
    .order('role_name')

  if (error) {
    console.error('Error fetching role permissions:', error)
    throw new Error('Failed to fetch role permissions')
  }

  return data || []
}

export async function updateRolePermission(
  id: string,
  updates: Partial<RolePermissionTemplate>
) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  // Check admin privileges
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile?.role || profile.role !== 'super_admin') {
    throw new Error('Insufficient permissions')
  }

  const { data, error } = await supabase
    .from('role_permission_templates')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating role permission:', error)
    throw new Error('Failed to update role permission')
  }

  return data
}

export async function createRolePermission(
  permission: {
    role_type: Database['public']['Enums']['user_role_type']
    permission_category: string
    permission_name: string
    can_read?: boolean | null
    can_create?: boolean | null
    can_update?: boolean | null
    can_delete?: boolean | null
    scope?: string | null
    description?: string | null
  }
) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  // Check admin privileges
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile?.role || profile.role !== 'super_admin') {
    throw new Error('Insufficient permissions')
  }

  const { data, error } = await supabase
    .from('role_permission_templates')
    .insert([{
      ...permission,
      description: permission.description ?? null
    }])
    .select()
    .single()

  if (error) {
    console.error('Error creating role permission:', error)
    throw new Error('Failed to create role permission')
  }

  return data
}

export async function deleteRolePermission(id: string) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  // Check admin privileges
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile?.role || profile.role !== 'super_admin') {
    throw new Error('Insufficient permissions')
  }

  const { error } = await supabase
    .from('role_permission_templates')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting role permission:', error)
    throw new Error('Failed to delete role permission')
  }

  return { success: true }
}