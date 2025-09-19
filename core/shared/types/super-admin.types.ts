import type { NavigationItem } from "./navigation.types";

export const superAdminNavigation: NavigationItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/admin",
    icon: "home",
  },
  {
    id: "separator-platform",
    label: "Platform Management",
    href: "#",
    icon: "",
    type: "separator",
  },
  {
    id: "users",
    label: "Users",
    href: "/admin/users",
    icon: "users",
  },
  {
    id: "salons",
    label: "Salons",
    href: "/admin/salons",
    icon: "scissors",
  },
  {
    id: "subscriptions",
    label: "Subscriptions",
    href: "/admin/subscriptions",
    icon: "creditCard",
  },
  {
    id: "pricing",
    label: "Pricing Plans",
    href: "/admin/pricing",
    icon: "package",
  },
  {
    id: "separator-analytics",
    label: "Analytics & Reports",
    href: "#",
    icon: "",
    type: "separator",
  },
  {
    id: "analytics",
    label: "Platform Analytics",
    href: "/admin/analytics",
    icon: "chart",
  },
  {
    id: "system-health",
    label: "System Health",
    href: "/admin/system-health",
    icon: "shield",
  },
  {
    id: "audit-logs",
    label: "Audit Logs",
    href: "/admin/audit-logs",
    icon: "file",
  },
  {
    id: "separator-system",
    label: "System",
    href: "#",
    icon: "",
    type: "separator",
  },
  {
    id: "settings",
    label: "Platform Settings",
    href: "/admin/settings",
    icon: "settings",
  },
  {
    id: "team",
    label: "Admin Team",
    href: "/admin/team",
    icon: "userCheck",
  },
];
