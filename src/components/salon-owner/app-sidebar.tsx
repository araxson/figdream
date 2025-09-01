"use client"

import {
  Calendar,
  Users,
  Home,
  Settings,
  Store,
  MapPin,
  Trophy,
  Megaphone,
  UserCircle,
  Clock,
  BarChart3,
  Package,
  UserCheck,
  CalendarOff,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { User } from "@supabase/supabase-js"
import type { Database } from "@/types/database.types"

type Profile = Database['public']['Tables']['profiles']['Row']

const menuItems = [
  {
    title: "Dashboard",
    icon: Home,
    href: "/salon-admin/dashboard",
  },
  {
    title: "Appointments",
    icon: Calendar,
    href: "/salon-admin/appointments",
    subItems: [
      { title: "All Appointments", href: "/salon-admin/appointments" },
      { title: "Calendar View", href: "/salon-admin/appointments/calendar" },
      { title: "Appointment Notes", href: "/salon-admin/appointments/notes" },
    ],
  },
  {
    title: "Customers",
    icon: Users,
    href: "/salon-admin/customers",
  },
  {
    title: "Services",
    icon: Package,
    href: "/salon-admin/services",
    subItems: [
      { title: "All Services", href: "/salon-admin/services" },
      { title: "Categories", href: "/salon-admin/services/categories" },
      { title: "Pricing", href: "/salon-admin/services/pricing" },
    ],
  },
  {
    title: "Staff",
    icon: UserCheck,
    href: "/salon-admin/staff",
    subItems: [
      { title: "Team Members", href: "/salon-admin/staff" },
      { title: "Schedules", href: "/salon-admin/staff/schedules" },
      { title: "Performance", href: "/salon-admin/staff/performance" },
      { title: "Specialties", href: "/salon-admin/staff/specialties" },
    ],
  },
  {
    title: "Time Off",
    icon: CalendarOff,
    href: "/salon-admin/time-off",
  },
  {
    title: "Locations",
    icon: MapPin,
    href: "/salon-admin/locations",
  },
  {
    title: "Loyalty Program",
    icon: Trophy,
    href: "/salon-admin/loyalty",
    subItems: [
      { title: "Program Settings", href: "/salon-admin/loyalty" },
      { title: "Points Ledger", href: "/salon-admin/loyalty/ledger" },
      { title: "Transactions", href: "/salon-admin/loyalty/transactions" },
    ],
  },
  {
    title: "Marketing",
    icon: Megaphone,
    href: "/salon-admin/marketing",
    subItems: [
      { title: "Campaigns", href: "/salon-admin/marketing" },
      { title: "SMS Opt-outs", href: "/salon-admin/marketing/sms-opt-outs" },
      { title: "Analytics", href: "/salon-admin/marketing/analytics" },
    ],
  },
  {
    title: "Analytics",
    icon: BarChart3,
    href: "/salon-admin/analytics",
  },
  {
    title: "Salon Settings",
    icon: Store,
    href: "/salon-admin/salon",
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/salon-admin/settings",
    subItems: [
      { title: "General", href: "/salon-admin/settings" },
      { title: "Notifications", href: "/salon-admin/settings/notifications" },
      { title: "Export Data", href: "/salon-admin/settings/export" },
    ],
  },
]

interface AppSidebarProps {
  user: User
  profile: Profile
}

export function AppSidebar({ user, profile }: AppSidebarProps) {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-4">
          <Store className="h-6 w-6" />
          <div className="flex flex-col">
            <span className="font-semibold">Salon Manager</span>
            <span className="text-xs text-muted-foreground">
              {profile?.salon_name || "Your Salon"}
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  {item.subItems ? (
                    <>
                      <SidebarMenuButton asChild>
                        <Link href={item.href}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                      <SidebarMenuSub>
                        {item.subItems.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.href}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={pathname === subItem.href}
                            >
                              <Link href={subItem.href}>
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </>
                  ) : (
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                    >
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/salon-admin/profile">
                <UserCircle className="h-4 w-4" />
                <span>{profile?.full_name || user.email}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}