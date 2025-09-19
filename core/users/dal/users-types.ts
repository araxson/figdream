/**
 * Users Module Types
 *
 * Uses unified type system to prevent type mismatches
 */

import type { RoleType } from "@/core/shared/types/enums.types";

import type { Database } from "@/types/database.types";
import type { Json } from "@/types/database.types";

// Re-export database types for backward compatibility
export type Profile = Database['public']['Views']['profiles']['Row'];
export type UserRoleType = RoleType;

// Audit log from database
export type AuditLog = Database["public"]["Tables"]["audit_logs"]["Row"];

// Extended types specific to users module
export interface ProfileWithRelations extends Profile {
  role?: string;
  user_roles?: UserRole[];
  salon_memberships?: unknown[];
  total_appointments?: number;
  total_spent?: number;
  last_activity?: string;
  session_count?: number;
}

// Security settings
export interface UserSecuritySettings {
  user_id: string;
  two_factor_enabled: boolean;
  two_factor_method?: 'sms' | 'email' | 'app';
  password_last_changed?: string;
  require_password_change: boolean;
  active_sessions?: UserSession[];
  api_keys?: ApiKey[];
  login_history?: LoginRecord[];
}

// Session information
export interface UserSession {
  id: string;
  user_id: string;
  created_at: string;
  last_active: string;
  ip_address: string;
  user_agent: string;
  location?: string;
  is_current?: boolean;
}

// Login record
export interface LoginRecord {
  id: string;
  timestamp: string;
  ip_address: string;
  user_agent: string;
  location?: string;
  status: 'success' | 'failed';
  failure_reason?: string;
}

// API Key
export interface ApiKey {
  id: string;
  name: string;
  key_preview: string;
  created_at: string;
  last_used?: string;
  expires_at?: string;
  permissions: string[];
  is_active: boolean;
}

// Permission structure
export interface Permission {
  resource: string;
  actions: string[];
  conditions?: Record<string, any>;
}

// Role with permissions
export interface RoleWithPermissions {
  id: string;
  name: UserRoleType;
  display_name: string;
  description?: string;
  permissions: Permission[];
  parent_role?: string;
  hierarchy_level: number;
  is_system: boolean;
  is_custom: boolean;
  created_at: string;
  updated_at: string;
}

// Bulk operation types
export interface BulkUserOperation {
  action: 'suspend' | 'activate' | 'delete' | 'change_role' | 'export' | 'reset_password';
  user_ids: string[];
  params?: {
    new_role?: UserRoleType;
    reason?: string;
    notify_users?: boolean;
  };
}

// User activity
export interface UserActivity {
  user_id: string;
  action: string;
  resource?: string;
  timestamp: string;
  ip_address?: string;
  user_agent?: string;
  details?: Record<string, any>;
}

// Onboarding
export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  required: boolean;
  order: number;
  component?: string;
}

export interface UserOnboardingProgress {
  user_id: string;
  steps: OnboardingStep[];
  current_step: number;
  completed_steps: string[];
  started_at: string;
  completed_at?: string;
}

// Import/Export
export interface UserImportData {
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role?: UserRoleType;
  salon_id?: string;
  send_invite?: boolean;
}

export interface UserExportData extends UserImportData {
  id: string;
  created_at: string;
  status: string;
  verified: boolean;
  last_login?: string;
}

// Dashboard stats
export interface UserManagementStats {
  total_users: number;
  active_users: number;
  new_users_today: number;
  new_users_week: number;
  suspended_users: number;
  pending_verifications: number;
  users_by_role: Record<UserRoleType, number>;
  active_sessions: number;
}