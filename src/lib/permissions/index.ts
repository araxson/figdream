/**
 * Centralized Role-Based Permissions System
 * Single source of truth for all role-based access control
 */
import type { Database } from "@/types/database.types"
export type UserRole = Database["public"]["Enums"]["user_role_type"]
export type Permission = 
  | "appointments.view_all"
  | "appointments.view_own"
  | "appointments.create"
  | "appointments.edit_all"
  | "appointments.edit_own"
  | "appointments.delete_all"
  | "appointments.delete_own"
  | "appointments.cancel_all"
  | "appointments.cancel_own"
  | "appointments.reschedule_all"
  | "appointments.reschedule_own"
  | "customers.view_all"
  | "customers.view_own"
  | "customers.create"
  | "customers.edit_all"
  | "customers.edit_own"
  | "customers.delete"
  | "staff.view_all"
  | "staff.view_own"
  | "staff.create"
  | "staff.edit_all"
  | "staff.edit_own"
  | "staff.delete"
  | "staff.manage_schedule"
  | "services.view"
  | "services.create"
  | "services.edit"
  | "services.delete"
  | "analytics.view_all"
  | "analytics.view_own"
  | "analytics.export"
  | "settings.view_all"
  | "settings.view_own"
  | "settings.edit_all"
  | "settings.edit_own"
  | "billing.view"
  | "billing.manage"
  | "marketing.view"
  | "marketing.create"
  | "marketing.send"
  | "loyalty.view"
  | "loyalty.manage"
  | "loyalty.adjust_points"
/**
 * Role-Permission Matrix
 * Defines what each role can do in the system
 */
export const rolePermissions: Record<UserRole, Permission[]> = {
  super_admin: [
    // Super admin has ALL permissions
    "appointments.view_all",
    "appointments.create",
    "appointments.edit_all",
    "appointments.delete_all",
    "appointments.cancel_all",
    "appointments.reschedule_all",
    "customers.view_all",
    "customers.create",
    "customers.edit_all",
    "customers.delete",
    "staff.view_all",
    "staff.create",
    "staff.edit_all",
    "staff.delete",
    "staff.manage_schedule",
    "services.view",
    "services.create",
    "services.edit",
    "services.delete",
    "analytics.view_all",
    "analytics.export",
    "settings.view_all",
    "settings.edit_all",
    "billing.view",
    "billing.manage",
    "marketing.view",
    "marketing.create",
    "marketing.send",
    "loyalty.view",
    "loyalty.manage",
    "loyalty.adjust_points",
  ],
  salon_owner: [
    // Salon owner can manage their salon
    "appointments.view_all",
    "appointments.create",
    "appointments.edit_all",
    "appointments.delete_all",
    "appointments.cancel_all",
    "appointments.reschedule_all",
    "customers.view_all",
    "customers.create",
    "customers.edit_all",
    "staff.view_all",
    "staff.create",
    "staff.edit_all",
    "staff.delete",
    "staff.manage_schedule",
    "services.view",
    "services.create",
    "services.edit",
    "services.delete",
    "analytics.view_all",
    "analytics.export",
    "settings.view_own",
    "settings.edit_own",
    "billing.view",
    "billing.manage",
    "marketing.view",
    "marketing.create",
    "marketing.send",
    "loyalty.view",
    "loyalty.manage",
    "loyalty.adjust_points",
  ],
  location_manager: [
    // Location manager can manage their location
    "appointments.view_all",
    "appointments.create",
    "appointments.edit_all",
    "appointments.cancel_all",
    "appointments.reschedule_all",
    "customers.view_all",
    "customers.create",
    "customers.edit_all",
    "staff.view_all",
    "staff.edit_all",
    "staff.manage_schedule",
    "services.view",
    "analytics.view_own",
    "settings.view_own",
    "marketing.view",
    "loyalty.view",
  ],
  staff: [
    // Staff can manage their own work
    "appointments.view_own",
    "appointments.edit_own",
    "appointments.cancel_own",
    "appointments.reschedule_own",
    "customers.view_all",
    "services.view",
    "analytics.view_own",
    "settings.view_own",
    "settings.edit_own",
  ],
  customer: [
    // Customers can manage their own data
    "appointments.view_own",
    "appointments.create",
    "appointments.cancel_own",
    "appointments.reschedule_own",
    "customers.view_own",
    "customers.edit_own",
    "services.view",
    "settings.view_own",
    "settings.edit_own",
  ],
}
/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false
}
/**
 * Get all permissions for a role
 */
export function getPermissions(role: UserRole): Permission[] {
  return rolePermissions[role] ?? []
}
/**
 * Check if a role can perform an action on a resource
 */
export function canPerformAction(
  role: UserRole,
  action: string,
  resource: string,
  isOwn: boolean = false
): boolean {
  const permission = `${resource}.${action}${isOwn ? "_own" : "_all"}` as Permission
  const alternatePermission = `${resource}.${action}_all` as Permission
  return hasPermission(role, permission) || hasPermission(role, alternatePermission)
}
/**
 * Get display name for a role
 */
export function getRoleDisplayName(role: UserRole): string {
  const displayNames: Record<UserRole, string> = {
    super_admin: "Super Admin",
    salon_owner: "Salon Owner",
    location_manager: "Location Manager",
    staff: "Staff Member",
    customer: "Customer",
  }
  return displayNames[role] ?? role
}
/**
 * Get role badge variant for UI
 */
export function getRoleBadgeVariant(role: UserRole): "default" | "secondary" | "destructive" | "outline" {
  const variants: Record<UserRole, "default" | "secondary" | "destructive" | "outline"> = {
    super_admin: "destructive",
    salon_owner: "default",
    location_manager: "secondary",
    staff: "outline",
    customer: "outline",
  }
  return variants[role] ?? "outline"
}