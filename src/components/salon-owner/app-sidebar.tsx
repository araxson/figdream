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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { User } from "@supabase/supabase-js"
import type { Database } from "@/types/database.types"

type Profile = Database['public']['Tables']['profiles']['Row']

const menuItems = [
  {
    title: "Dashboard",
    icon: Home,
    href: "/role-salon-owner/dashboard",
  },
  {
    title: "Appointments",
    icon: Calendar,
    href: "/role-salon-owner/appointments",
    subItems: [
      { title: "All Appointments", href: "/role-salon-owner/appointments" },
      { title: "Calendar View", href: "/role-salon-owner/appointments/calendar" },
      { title: "Appointment Notes", href: "/role-salon-owner/appointments/notes" },
    ],
  },
  {
    title: "Customers",
    icon: Users,
    href: "/role-salon-owner/customers",
  },
  {
    title: "Services",
    icon: Package,
    href: "/role-salon-owner/services",
    subItems: [
      { title: "All Services", href: "/role-salon-owner/services" },
      { title: "Categories", href: "/role-salon-owner/categories" },
      { title: "Pricing", href: "/role-salon-owner/services/pricing" },
    ],
  },
  {
    title: "Staff",
    icon: UserCheck,
    href: "/role-salon-owner/staff",
    subItems: [
      { title: "Team Members", href: "/role-salon-owner/staff" },
      { title: "Schedules", href: "/role-salon-owner/staff/schedule" },
      { title: "Performance", href: "/role-salon-owner/staff/performance" },
      { title: "Specialties", href: "/role-salon-owner/staff/specialties" },
    ],
  },
  {
    title: "Time Off",
    icon: CalendarOff,
    href: "/role-salon-owner/timeoff",
  },
  {
    title: "Locations",
    icon: MapPin,
    href: "/role-salon-owner/locations",
  },
  {
    title: "Loyalty Program",
    icon: Trophy,
    href: "/role-salon-owner/loyalty",
    subItems: [
      { title: "Program Settings", href: "/role-salon-owner/loyalty" },
      { title: "Points Ledger", href: "/role-salon-owner/loyalty/ledger" },
      { title: "Transactions", href: "/role-salon-owner/loyalty/transactions" },
    ],
  },
  {
    title: "Marketing",
    icon: Megaphone,
    href: "/role-salon-owner/marketing",
    subItems: [
      { title: "Campaigns", href: "/role-salon-owner/marketing" },
      { title: "SMS Opt-outs", href: "/role-salon-owner/marketing/sms" },
      { title: "Analytics", href: "/role-salon-owner/marketing/analytics" },
    ],
  },
  {
    title: "Analytics",
    icon: BarChart3,
    href: "/role-salon-owner/analytics",
  },
  {
    title: "Salon Settings",
    icon: Store,
    href: "/role-salon-owner/salon",
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/role-salon-owner/settings",
    subItems: [
      { title: "General", href: "/role-salon-owner/settings" },
      { title: "Notifications", href: "/role-salon-owner/settings/notifications" },
      { title: "Export Data", href: "/role-salon-owner/settings/export" },
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
    <TooltipProvider>
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
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton asChild>
                            <Link href={item.href}>
                              <item.icon className="h-4 w-4" />
                              <span>{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <p>{item.title}</p>
                        </TooltipContent>
                      </Tooltip>
                      <SidebarMenuSub>
                        {item.subItems.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.href}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={pathname === subItem.href}
                                >
                                  <Link href={subItem.href}>
                                    <span>{subItem.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </TooltipTrigger>
                              <TooltipContent side="right">
                                <p>{subItem.title}</p>
                              </TooltipContent>
                            </Tooltip>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </>
                  ) : (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === item.href}
                        >
                          <Link href={item.href}>
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>{item.title}</p>
                      </TooltipContent>
                    </Tooltip>
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
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton asChild>
                    <Link href="/role-salon-owner/profile">
                      <UserCircle className="h-4 w-4" />
                      <span>{profile?.full_name || user.email}</span>
                    </Link>
                  </SidebarMenuButton>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>View and edit your profile</p>
                </TooltipContent>
              </Tooltip>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </TooltipProvider>
  )
}