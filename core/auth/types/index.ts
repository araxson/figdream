// Auth Module Types - Barrel Exports
// Re-exporting from database types as source of truth

import type { Database } from '@/types/database.types';

// Auth-specific type aliases for convenience
export type AuthUser = Database['public']['Views']['profiles']['Row'];
export type AuthUserInsert = Database['public']['Views']['profiles']['Insert'];
export type AuthUserUpdate = Database['public']['Views']['profiles']['Update'];