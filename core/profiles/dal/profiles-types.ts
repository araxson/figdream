/**
 * Profile Types
 *
 * Uses unified type system to prevent type mismatches
 */

import type { Database } from "@/types/database.types";

// Re-export database types for backward compatibility
export type Profile = Database['public']['Views']['profiles']['Row'];
export type StaffProfile = Database['public']['Views']['staff_profiles']['Row'];

// For backward compatibility - map to actual database types
export interface User {
  id: string;
  email: string;
  full_name?: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type Salon = Database['public']['Views']['salons']['Row'];

// Extended types with relations
export type ProfileWithDetails = Profile & { role?: string };
export type StaffProfileWithDetails = StaffProfile & { user?: User };