import type { Json, TableDefinition, Relationship } from '@/core/shared/types/base.types'
import type { RoleType } from '@/core/shared/types/enums.types'

// Auth Domain Types
export interface AuthTables {
  user_roles: TableDefinition<
    UserRoleRow,
    UserRoleInsert,
    UserRoleUpdate,
    UserRoleRelationships
  >
}

// User Roles Types
export interface UserRoleRow {
  created_at: string | null
  expires_at: string | null
  granted_at: string | null
  granted_by: string | null
  id: string | null
  is_active: boolean | null
  metadata: Json | null
  notes: string | null
  permissions: string[] | null
  restrictions: Json | null
  revoke_reason: string | null
  revoked_at: string | null
  revoked_by: string | null
  role: RoleType | null
  salon_id: string | null
  updated_at: string | null
  user_id: string | null
}

export interface UserRoleInsert {
  created_at?: string | null
  expires_at?: string | null
  granted_at?: string | null
  granted_by?: string | null
  id?: string | null
  is_active?: boolean | null
  metadata?: Json | null
  notes?: string | null
  permissions?: string[] | null
  restrictions?: Json | null
  revoke_reason?: string | null
  revoked_at?: string | null
  revoked_by?: string | null
  role?: RoleType | null
  salon_id?: string | null
  updated_at?: string | null
  user_id?: string | null
}

export interface UserRoleUpdate {
  created_at?: string | null
  expires_at?: string | null
  granted_at?: string | null
  granted_by?: string | null
  id?: string | null
  is_active?: boolean | null
  metadata?: Json | null
  notes?: string | null
  permissions?: string[] | null
  restrictions?: Json | null
  revoke_reason?: string | null
  revoked_at?: string | null
  revoked_by?: string | null
  role?: RoleType | null
  salon_id?: string | null
  updated_at?: string | null
  user_id?: string | null
}

export type UserRoleRelationships = []