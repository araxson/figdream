/**
 * Admin Data Access Layer - Mutation Operations
 * Secure write operations with super admin authentication
 */

import { createClient } from '@/lib/supabase/server';
import { verifySuperAdmin, logAdminAction } from './queries';
import type { Database } from '@/types/database.types';

type RoleType = Database['public']['Enums']['role_type'];

/**
 * Update user status (activate/deactivate)
 */
export async function updateUserStatus(
  userId: string,
  isActive: boolean,
  reason?: string
): Promise<boolean> {
  const adminUser = await verifySuperAdmin();
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user status:', error);
      throw new Error('Failed to update user status');
    }

    await logAdminAction(
      adminUser.id,
      isActive ? 'activate_user' : 'deactivate_user',
      'user',
      userId,
      { reason }
    );

    return true;

  } catch (error) {
    console.error('Error updating user status:', error);
    throw new Error('Failed to update user status');
  }
}

/**
 * Update salon status and subscription
 */
export async function updateSalonStatus(
  salonId: string,
  isActive: boolean,
  subscriptionStatus?: string,
  reason?: string
): Promise<boolean> {
  const adminUser = await verifySuperAdmin();
  const supabase = await createClient();

  try {
    const updateData: any = {
      is_active: isActive,
      updated_at: new Date().toISOString()
    };

    if (subscriptionStatus) {
      updateData.subscription_status = subscriptionStatus;
    }

    const { error } = await supabase
      .from('salons')
      .update(updateData)
      .eq('id', salonId);

    if (error) {
      console.error('Error updating salon status:', error);
      throw new Error('Failed to update salon status');
    }

    await logAdminAction(
      adminUser.id,
      isActive ? 'activate_salon' : 'deactivate_salon',
      'salon',
      salonId,
      { subscriptionStatus, reason }
    );

    return true;

  } catch (error) {
    console.error('Error updating salon status:', error);
    throw new Error('Failed to update salon status');
  }
}

/**
 * Update user role
 */
export async function updateUserRole(
  userId: string,
  newRole: RoleType,
  reason?: string
): Promise<boolean> {
  const adminUser = await verifySuperAdmin();
  const supabase = await createClient();

  try {
    // Check if user role exists
    const { data: existingRole } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (existingRole) {
      // Update existing role
      const { error } = await supabase
        .from('user_roles')
        .update({
          role: newRole,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating user role:', error);
        throw new Error('Failed to update user role');
      }
    } else {
      // Create new role
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: newRole,
          assigned_by: adminUser.id
        });

      if (error) {
        console.error('Error creating user role:', error);
        throw new Error('Failed to create user role');
      }
    }

    await logAdminAction(
      adminUser.id,
      'update_user_role',
      'user_role',
      userId,
      { newRole, reason }
    );

    return true;

  } catch (error) {
    console.error('Error updating user role:', error);
    throw new Error('Failed to update user role');
  }
}

/**
 * Delete user (soft delete by deactivating)
 */
export async function deleteUser(
  userId: string,
  reason?: string
): Promise<boolean> {
  const adminUser = await verifySuperAdmin();
  const supabase = await createClient();

  try {
    // Soft delete by deactivating
    const { error } = await supabase
      .from('profiles')
      .update({
        is_active: false,
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error('Error deleting user:', error);
      throw new Error('Failed to delete user');
    }

    await logAdminAction(
      adminUser.id,
      'delete_user',
      'user',
      userId,
      { reason }
    );

    return true;

  } catch (error) {
    console.error('Error deleting user:', error);
    throw new Error('Failed to delete user');
  }
}

/**
 * Delete salon (soft delete by deactivating)
 */
export async function deleteSalon(
  salonId: string,
  reason?: string
): Promise<boolean> {
  const adminUser = await verifySuperAdmin();
  const supabase = await createClient();

  try {
    // Soft delete by deactivating
    const { error } = await supabase
      .from('salons')
      .update({
        is_active: false,
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', salonId);

    if (error) {
      console.error('Error deleting salon:', error);
      throw new Error('Failed to delete salon');
    }

    await logAdminAction(
      adminUser.id,
      'delete_salon',
      'salon',
      salonId,
      { reason }
    );

    return true;

  } catch (error) {
    console.error('Error deleting salon:', error);
    throw new Error('Failed to delete salon');
  }
}

/**
 * Bulk update user statuses
 */
export async function bulkUpdateUserStatus(
  userIds: string[],
  isActive: boolean,
  reason?: string
): Promise<{ success: string[]; failed: string[] }> {
  const adminUser = await verifySuperAdmin();
  const supabase = await createClient();

  const results: { success: string[]; failed: string[] } = { success: [], failed: [] };

  for (const userId of userIds) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        results.failed.push(userId);
        console.error(`Error updating user ${userId}:`, error);
      } else {
        results.success.push(userId);
        await logAdminAction(
          adminUser.id,
          isActive ? 'bulk_activate_users' : 'bulk_deactivate_users',
          'user',
          userId,
          { reason }
        );
      }
    } catch (error) {
      results.failed.push(userId);
      console.error(`Error updating user ${userId}:`, error);
    }
  }

  return results;
}

/**
 * Bulk update salon statuses
 */
export async function bulkUpdateSalonStatus(
  salonIds: string[],
  isActive: boolean,
  subscriptionStatus?: string,
  reason?: string
): Promise<{ success: string[]; failed: string[] }> {
  const adminUser = await verifySuperAdmin();
  const supabase = await createClient();

  const results: { success: string[]; failed: string[] } = { success: [], failed: [] };

  for (const salonId of salonIds) {
    try {
      const updateData: any = {
        is_active: isActive,
        updated_at: new Date().toISOString()
      };

      if (subscriptionStatus) {
        updateData.subscription_status = subscriptionStatus;
      }

      const { error } = await supabase
        .from('salons')
        .update(updateData)
        .eq('id', salonId);

      if (error) {
        results.failed.push(salonId);
        console.error(`Error updating salon ${salonId}:`, error);
      } else {
        results.success.push(salonId);
        await logAdminAction(
          adminUser.id,
          isActive ? 'bulk_activate_salons' : 'bulk_deactivate_salons',
          'salon',
          salonId,
          { subscriptionStatus, reason }
        );
      }
    } catch (error) {
      results.failed.push(salonId);
      console.error(`Error updating salon ${salonId}:`, error);
    }
  }

  return results;
}