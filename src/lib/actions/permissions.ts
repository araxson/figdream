'use server'

import { revalidatePath } from 'next/cache'
import { Database } from '@/types/database.types'
import {
  getRolePermissions as getRolePermissionsDAL,
  updateRolePermission as updateRolePermissionDAL,
  createRolePermission as createRolePermissionDAL,
  deleteRolePermission as deleteRolePermissionDAL
} from '@/lib/api/dal/permissions'

export async function getRolePermissionsAction() {
  try {
    const permissions = await getRolePermissionsDAL()
    return { success: true, data: permissions }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch permissions' 
    }
  }
}

export async function updateRolePermissionAction(
  id: string, 
  updates: Partial<{
    can_read: boolean | null
    can_create: boolean | null
    can_update: boolean | null
    can_delete: boolean | null
    description: string | null
  }>
) {
  try {
    const result = await updateRolePermissionDAL(id, updates)
    revalidatePath('/admin/permissions')
    return { success: true, data: result }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update permission' 
    }
  }
}

export async function createRolePermissionAction(
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
  try {
    const result = await createRolePermissionDAL(permission)
    revalidatePath('/admin/permissions')
    return { success: true, data: result }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create permission' 
    }
  }
}

export async function deleteRolePermissionAction(id: string) {
  try {
    await deleteRolePermissionDAL(id)
    revalidatePath('/admin/permissions')
    return { success: true }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete permission' 
    }
  }
}