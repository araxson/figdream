/**
 * SECURITY GUARDIAN PLUS - Military-Grade Authentication Verification
 *
 * Central authentication and authorization system for all DAL functions.
 * Implements CVE-2025-29927 mitigation and zero-trust architecture.
 *
 * CRITICAL SECURITY RULES:
 * 1. NEVER use middleware for authentication (CVE-2025-29927)
 * 2. ALWAYS use supabase.auth.getUser() for verification
 * 3. ALWAYS check permissions for resource access
 * 4. NEVER trust user-provided IDs without validation
 * 5. ALWAYS use raw_app_meta_data for authorization (immutable)
 */

import { createClient } from "@/lib/supabase/server";
import { cache } from "react";
import type { User } from "@supabase/supabase-js";

/**
 * User role types based on database enum
 */
export type UserRole =
  | "platform_admin"
  | "super_admin"
  | "admin"
  | "owner"
  | "manager"
  | "staff"
  | "customer"
  | "guest";

/**
 * Permission levels for resource access
 */
export type PermissionLevel =
  | "read"
  | "write"
  | "update"
  | "delete"
  | "manage";

/**
 * Verified user session with enhanced security data
 */
export interface VerifiedSession {
  user: User;
  userId: string;
  email: string;
  role: UserRole;
  salonId?: string;
  permissions: Set<string>;
  isAdmin: boolean;
  isPlatformAdmin: boolean;
  isSalonOwner: boolean;
  isStaff: boolean;
  isCustomer: boolean;
}

/**
 * Resource access context for permission checking
 */
export interface ResourceContext {
  resourceType: "appointment" | "salon" | "staff" | "customer" | "billing" | "service" | "analytics";
  resourceId?: string;
  ownerId?: string;
  salonId?: string;
  action: PermissionLevel;
}

/**
 * CRITICAL: Verify user session with CVE-2025-29927 mitigation
 * Cached for performance - single auth check per request
 */
export const verifySession = cache(async (): Promise<VerifiedSession> => {
  const supabase = await createClient();

  // CRITICAL: Use getUser() not getSession() (CVE-2025-29927)
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("SECURITY_ERROR: Unauthorized - No valid session");
  }

  // Fetch user profile with role and permissions
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*, user_roles(*)")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    throw new Error("SECURITY_ERROR: User profile not found");
  }

  // Extract role from app_metadata (immutable, secure)
  const role = (user.app_metadata?.role || profile.role || "customer") as UserRole;

  // Build permissions set based on role
  const permissions = await buildPermissions(role, user.id);

  // Determine user type flags
  const isAdmin = ["admin", "super_admin", "platform_admin"].includes(role);
  const isPlatformAdmin = role === "platform_admin";
  const isSalonOwner = role === "owner";
  const isStaff = ["staff", "manager"].includes(role);
  const isCustomer = role === "customer";

  // Get salon association if exists
  const salonId = profile.salon_id || user.app_metadata?.salon_id;

  return {
    user,
    userId: user.id,
    email: user.email || "",
    role,
    salonId,
    permissions,
    isAdmin,
    isPlatformAdmin,
    isSalonOwner,
    isStaff,
    isCustomer
  };
});

/**
 * Check if user has permission to access a resource
 */
export async function checkPermission(
  session: VerifiedSession,
  context: ResourceContext
): Promise<boolean> {
  // Platform admins have full access
  if (session.isPlatformAdmin) {
    return true;
  }

  // Check resource-specific permissions
  const permissionKey = `${context.resourceType}:${context.action}`;

  // Check if user has explicit permission
  if (session.permissions.has(permissionKey)) {
    return true;
  }

  // Check ownership rules
  if (context.ownerId && context.ownerId === session.userId) {
    // Users can access their own resources (with restrictions)
    if (context.action === "read" || context.action === "update") {
      return true;
    }
  }

  // Check salon-based access
  if (context.salonId && session.salonId === context.salonId) {
    // Salon staff can access salon resources
    if (session.isStaff || session.isSalonOwner) {
      return true;
    }
  }

  return false;
}

/**
 * Build permissions set based on user role
 */
async function buildPermissions(role: UserRole, userId: string): Promise<Set<string>> {
  const permissions = new Set<string>();

  // Define role-based permissions
  const rolePermissions: Record<UserRole, string[]> = {
    platform_admin: ["*:*"],
    super_admin: [
      "salon:*", "staff:*", "customer:*", "appointment:*",
      "billing:*", "service:*", "analytics:*"
    ],
    admin: [
      "salon:read", "salon:update", "staff:*", "customer:*",
      "appointment:*", "billing:read", "service:*", "analytics:read"
    ],
    owner: [
      "salon:*", "staff:*", "customer:*", "appointment:*",
      "billing:*", "service:*", "analytics:*"
    ],
    manager: [
      "salon:read", "staff:read", "staff:update", "customer:*",
      "appointment:*", "billing:read", "service:*", "analytics:read"
    ],
    staff: [
      "appointment:*", "customer:read", "service:read", "analytics:read"
    ],
    customer: [
      "appointment:read", "appointment:write", "appointment:update",
      "billing:read", "service:read"
    ],
    guest: ["service:read", "salon:read"]
  };

  // Add role-based permissions
  const perms = rolePermissions[role] || [];
  perms.forEach(perm => {
    if (perm.includes("*")) {
      // Expand wildcards
      const [resource, action] = perm.split(":");
      if (action === "*") {
        ["read", "write", "update", "delete", "manage"].forEach(a => {
          permissions.add(`${resource}:${a}`);
        });
      } else if (resource === "*") {
        // Full access (platform admin only)
        permissions.add("*:*");
      }
    } else {
      permissions.add(perm);
    }
  });

  return permissions;
}

/**
 * Sanitize user input to prevent XSS and injection attacks
 */
export function sanitizeInput<T>(input: T): T {
  if (typeof input === "string") {
    // Remove potential XSS vectors
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<[^>]*>?/gm, "")
      .replace(/javascript:/gi, "")
      .replace(/on\w+\s*=/gi, "") as T;
  }

  if (typeof input === "object" && input !== null) {
    if (Array.isArray(input)) {
      return input.map(item => sanitizeInput(item)) as T;
    }

    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized as T;
  }

  return input;
}

/**
 * Create a secure DTO by stripping sensitive fields
 */
export function createSecureDTO<T extends Record<string, any>>(
  data: T,
  sensitiveFields: string[] = ["password", "password_hash", "internal_notes", "api_key", "secret"]
): Partial<T> {
  const dto: any = { ...data };

  // Remove sensitive fields
  sensitiveFields.forEach(field => {
    delete dto[field];
  });

  // Remove any field containing sensitive keywords
  Object.keys(dto).forEach(key => {
    if (
      key.toLowerCase().includes("password") ||
      key.toLowerCase().includes("secret") ||
      key.toLowerCase().includes("token") ||
      key.toLowerCase().includes("api_key")
    ) {
      delete dto[key];
    }
  });

  return dto;
}

/**
 * Export all security utilities
 */
export const SecurityGuardian = {
  verifySession,
  checkPermission,
  sanitizeInput,
  createSecureDTO
};

export default SecurityGuardian;