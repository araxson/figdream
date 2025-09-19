/**
 * Navigation Types for shared layout components
 */

import type { Database } from "@/types/database.types";

// Use database role type as source of truth
export type UserRole = Database["public"]["Enums"]["role_type"];

// Navigation item structure
export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  type?: "separator" | "link";
  children?: NavigationItem[];
  badge?: string | number;
  disabled?: boolean;
}

// Navigation configuration type
export interface NavigationConfig {
  main: NavigationItem[];
  mobile?: NavigationItem[];
  footer?: NavigationItem[];
}