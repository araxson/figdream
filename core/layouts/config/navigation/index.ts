import { superAdminNavigation } from "./super-admin";
import { salonOwnerNavigation } from "./salon-owner";
import { salonManagerNavigation } from "./salon-manager";
import { staffNavigation } from "./staff";
import { customerNavigation } from "./customer";
import type { UserRole, NavigationItem } from "./types";

export function getNavigationByRole(role: UserRole): NavigationItem[] {
  switch (role) {
    case "super_admin":
      return superAdminNavigation;
    case "salon_owner":
      return salonOwnerNavigation;
    case "salon_manager":
      return salonManagerNavigation;
    case "staff":
      return staffNavigation;
    case "customer":
      return customerNavigation;
    default:
      return [];
  }
}

export function getDashboardPath(role: UserRole): string {
  switch (role) {
    case "super_admin":
      return "/admin";
    case "salon_owner":
    case "salon_manager":
      return "/dashboard";
    case "staff":
      return "/staff";
    case "customer":
      return "/customer";
    default:
      return "/";
  }
}

export * from "./types";
