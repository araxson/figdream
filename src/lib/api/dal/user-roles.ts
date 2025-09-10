import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { Database, Json } from '@/types/database.types'
import { requireAuth } from './auth'

type Tables = Database['public']['Tables']
type UserRole = Tables['user_roles']['Row']
type UserRoleInsert = Tables['user_roles']['Insert']
type UserRoleUpdate = Tables['user_roles']['Update']

export interface UserRoleDTO {
  id: string
  user_id: string
  role: string
  permissions: Record<string, unknown>
  created_at: string
  updated_at: string
}

function toUserRoleDTO(userRole: UserRole): UserRoleDTO {
  return {
    id: userRole.id,
    user_id: userRole.user_id,
    role: userRole.role,
    permissions: userRole.permissions as Record<string, unknown> || {},
    created_at: userRole.created_at || new Date().toISOString(),
    updated_at: userRole.updated_at || new Date().toISOString()
  }
}

export const getUserRoles = cache(async (): Promise<UserRoleDTO[]> => {
  await requireAuth()
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('user_roles')
    .select('*')
    .order('role')
  
  if (error) {
    console.error('Error fetching user roles:', error)
    return []
  }
  
  return (data || []).map(toUserRoleDTO)
})

export const getUserRoleByUserId = cache(async (
  userId: string
): Promise<UserRoleDTO | null> => {
  await requireAuth()
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  if (error) {
    console.error('Error fetching user role:', error)
    return null
  }
  
  return data ? toUserRoleDTO(data) : null
})

export const getUserRolesByRole = cache(async (
  role: Database["public"]["Enums"]["user_role_type"]
): Promise<UserRoleDTO[]> => {
  await requireAuth()
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('user_roles')
    .select('*')
    .eq('role', role)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching users by role:', error)
    return []
  }
  
  return (data || []).map(toUserRoleDTO)
})

export async function createUserRole(
  userRole: UserRoleInsert
): Promise<UserRoleDTO | null> {
  await requireAuth()
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('user_roles')
    .insert(userRole)
    .select()
    .single()
  
  if (error) {
    console.error('Error creating user role:', error)
    throw new Error('Failed to create user role')
  }
  
  return data ? toUserRoleDTO(data) : null
}

export async function updateUserRole(
  id: string,
  updates: UserRoleUpdate
): Promise<UserRoleDTO | null> {
  await requireAuth()
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('user_roles')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating user role:', error)
    throw new Error('Failed to update user role')
  }
  
  return data ? toUserRoleDTO(data) : null
}

export async function deleteUserRole(id: string): Promise<boolean> {
  await requireAuth()
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('user_roles')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting user role:', error)
    throw new Error('Failed to delete user role')
  }
  
  return true
}

export async function assignUserRole(
  userId: string,
  salonId: string,
  role: Database["public"]["Enums"]["user_role_type"],
  permissions?: Record<string, unknown>
): Promise<UserRoleDTO | null> {
  await requireAuth()
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('user_roles')
    .upsert({
      user_id: userId,
      salon_id: salonId,
      role,
      permissions: permissions as Json || {},
      is_active: true,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id'
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error assigning user role:', error)
    throw new Error('Failed to assign user role')
  }
  
  return data ? toUserRoleDTO(data) : null
}