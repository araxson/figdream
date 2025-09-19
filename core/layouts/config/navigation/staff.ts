import type { NavigationItem } from "./types";

export const staffNavigation: NavigationItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/staff",
    icon: "home",
  },
  {
    id: "separator-work",
    label: "My Work",
    href: "#",
    icon: "",
    type: "separator",
  },
  {
    id: "appointments",
    label: "My Appointments",
    href: "/staff/appointments",
    icon: "calendar",
  },
  {
    id: "schedule",
    label: "My Schedule",
    href: "/staff/schedule",
    icon: "clock",
  },
  {
    id: "customers",
    label: "My Customers",
    href: "/staff/customers",
    icon: "users",
  },
  {
    id: "separator-performance",
    label: "Performance",
    href: "#",
    icon: "",
    type: "separator",
  },
  {
    id: "tips",
    label: "Tips & Earnings",
    href: "/staff/tips",
    icon: "dollar",
  },
  {
    id: "profile",
    label: "My Profile",
    href: "/staff/profile",
    icon: "userCheck",
  },
];
