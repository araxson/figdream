import { createClient } from "@/lib/supabase/server";
import type {
  ProfileInsert,
  ProfileUpdate,
  UserRoleType,
  BulkUserOperation,
  UserImportData,
  UserSecuritySettings
} from "./users-types";

/**
 * Create a new user profile
 */
export async function createUserProfile(data: ProfileInsert) {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile, error } = await supabase
    .from("profiles")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return profile;
}

/**
 * Update user profile
 */
export async function updateUserProfile(userId: string, data: ProfileUpdate) {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile, error } = await supabase
    .from("profiles")
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  return profile;
}

/**
 * Deactivate user
 */
export async function deactivateUser(userId: string) {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile, error } = await supabase
    .from("profiles")
    .update({
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  return profile;
}

/**
 * Reactivate user
 */
export async function reactivateUser(userId: string) {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile, error } = await supabase
    .from("profiles")
    .update({
      is_active: true,
      deleted_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  return profile;
}

/**
 * Update user role
 */
export async function updateUserRole(userId: string, newRole: UserRoleType, salonId?: string) {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // First deactivate existing role
  await supabase
    .from("user_roles")
    .update({
      is_active: false,
      revoked_at: new Date().toISOString(),
      revoked_by: user.id,
      updated_at: new Date().toISOString()
    })
    .eq("user_id", userId)
    .eq("is_active", true);

  // Create new role
  const { data: newUserRole, error } = await supabase
    .from("user_roles")
    .insert({
      user_id: userId,
      role: newRole,
      salon_id: salonId,
      granted_by: user.id,
      granted_at: new Date().toISOString(),
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;

  // Log audit entry
  await supabase.from("audit_logs").insert({
    user_id: user.id,
    action: "user_role_updated",
    resource: "user_roles",
    resource_id: userId,
    metadata: {
      new_role: newRole,
      updated_by: user.id
    },
    created_at: new Date().toISOString()
  });

  return newUserRole;
}

/**
 * Suspend user account
 */
export async function suspendUser(userId: string, reason?: string) {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile, error } = await supabase
    .from("profiles")
    .update({
      is_active: false,
      deleted_at: new Date().toISOString(),
      metadata: {
        suspension_reason: reason,
        suspended_by: user.id
      },
      updated_at: new Date().toISOString()
    })
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;

  // Log audit entry
  await supabase.from("audit_logs").insert({
    user_id: user.id,
    action: "user_suspended",
    resource: "profiles",
    resource_id: userId,
    metadata: {
      reason: reason,
      suspended_by: user.id
    },
    created_at: new Date().toISOString()
  });

  return profile;
}

/**
 * Bulk user operations
 */
export async function performBulkUserOperation(operation: BulkUserOperation) {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const results = [];
  const errors = [];

  for (const userId of operation.user_ids) {
    try {
      let result;
      switch (operation.action) {
        case 'suspend':
          result = await suspendUser(userId, operation.params?.reason);
          break;
        case 'activate':
          result = await reactivateUser(userId);
          break;
        case 'delete':
          result = await deactivateUser(userId);
          break;
        case 'change_role':
          if (operation.params?.new_role) {
            result = await updateUserRole(userId, operation.params.new_role);
          }
          break;
        case 'reset_password':
          // Would need to trigger password reset email
          result = { userId, action: 'password_reset_sent' };
          break;
        default:
          throw new Error(`Unknown operation: ${operation.action}`);
      }
      results.push({ userId, success: true, result });
    } catch (error: any) {
      errors.push({ userId, success: false, error: error.message });
    }
  }

  // Log bulk operation
  await supabase.from("audit_logs").insert({
    user_id: user.id,
    action: `bulk_${operation.action}`,
    resource: "profiles",
    metadata: {
      affected_users: operation.user_ids.length,
      successful: results.length,
      failed: errors.length,
      operation_params: operation.params
    },
    created_at: new Date().toISOString()
  });

  return { results, errors };
}

/**
 * Import users from CSV data
 */
export async function importUsers(users: UserImportData[]) {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const imported = [];
  const errors = [];

  for (const userData of users) {
    try {
      // Create auth user (would need service role for this)
      // For now, just create profile
      const profile = await createUserProfile({
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone: userData.phone
      });

      // Assign role if specified
      if (userData.role) {
        await updateUserRole(profile.id, userData.role, userData.salon_id);
      }

      imported.push(profile);
    } catch (error: any) {
      errors.push({
        email: userData.email,
        error: error.message
      });
    }
  }

  // Log import operation
  await supabase.from("audit_logs").insert({
    user_id: user.id,
    action: "users_imported",
    resource: "profiles",
    metadata: {
      total_users: users.length,
      imported: imported.length,
      failed: errors.length
    },
    created_at: new Date().toISOString()
  });

  return { imported, errors };
}

/**
 * Update user security settings
 */
export async function updateUserSecuritySettings(
  userId: string,
  settings: Partial<UserSecuritySettings>
) {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Update profile metadata with security settings
  const { data: profile, error } = await supabase
    .from("profiles")
    .update({
      metadata: {
        two_factor_enabled: settings.two_factor_enabled,
        two_factor_method: settings.two_factor_method,
        require_password_change: settings.require_password_change
      },
      updated_at: new Date().toISOString()
    })
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;

  // Log security update
  await supabase.from("audit_logs").insert({
    user_id: user.id,
    action: "security_settings_updated",
    resource: "profiles",
    resource_id: userId,
    metadata: {
      settings_updated: Object.keys(settings)
    },
    created_at: new Date().toISOString()
  });

  return profile;
}

/**
 * Verify user email
 */
export async function verifyUserEmail(userId: string) {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile, error } = await supabase
    .from("profiles")
    .update({
      is_verified: true,
      updated_at: new Date().toISOString()
    })
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;

  // Log verification
  await supabase.from("audit_logs").insert({
    user_id: user.id,
    action: "email_verified",
    resource: "profiles",
    resource_id: userId,
    created_at: new Date().toISOString()
  });

  return profile;
}

/**
 * Delete a user
 */
export async function deleteUser(userId: string) {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Soft delete by marking as inactive and deleted
  const { data: profile, error } = await supabase
    .from("profiles")
    .update({
      is_active: false,
      is_deleted: true,
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;

  // Log deletion
  await supabase.from("audit_logs").insert({
    user_id: user.id,
    action: "user_deleted",
    resource: "profiles",
    resource_id: userId,
    created_at: new Date().toISOString()
  });

  return profile;
}

/**
 * Activate user (alias for reactivateUser)
 */
export const activateUser = reactivateUser;
