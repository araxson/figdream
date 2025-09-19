/**
 * Layouts Module Types
 */

export type UserRole =
  | "super_admin"
  | "admin"
  | "owner"
  | "manager"
  | "staff"
  | "customer";

export interface LayoutProps {
  children: React.ReactNode;
  userRole?: UserRole;
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
}

export interface NavItem {
  title: string;
  href: string;
  icon?: React.ComponentType;
  badge?: string | number;
  children?: NavItem[];
}
