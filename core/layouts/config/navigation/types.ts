export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  badge?: string | number;
  type?: "link" | "separator";
  permissions?: string[];
  children?: NavigationItem[];
}

export interface NavigationGroup {
  label?: string;
  items: NavigationItem[];
}

export interface NavigationConfig {
  main: NavigationItem[];
  secondary?: NavigationItem[];
}

export type UserRole =
  | "super_admin"
  | "salon_owner"
  | "salon_manager"
  | "location_manager"
  | "staff"
  | "customer";
