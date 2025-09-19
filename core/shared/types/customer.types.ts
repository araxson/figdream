import type { NavigationItem } from "./navigation.types";

export const customerNavigation: NavigationItem[] = [
  {
    id: "dashboard",
    label: "Home",
    href: "/customer",
    icon: "home",
  },
  {
    id: "book",
    label: "Book Appointment",
    href: "/customer/book",
    icon: "calendar",
  },
  {
    id: "appointments",
    label: "My Appointments",
    href: "/customer/appointments",
    icon: "clock",
  },
  {
    id: "favorites",
    label: "Favorites",
    href: "/customer/favorites",
    icon: "star",
  },
  {
    id: "profile",
    label: "Profile",
    href: "/customer/profile",
    icon: "userCheck",
  },
  {
    id: "preferences",
    label: "Preferences",
    href: "/customer/preferences",
    icon: "settings",
  },
];
