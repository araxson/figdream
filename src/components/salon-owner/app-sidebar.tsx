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
    href: "/salon/dashboard",
  },
  {
    title: "Appointments",
    icon: Calendar,
    href: "/salon/appointments",
    subItems: [
      { title: "All Appointments", href: "/salon/appointments" },
      { title: "Calendar View", href: "/salon/appointments/calendar" },
      { title: "Appointment Notes", href: "/salon/appointments/notes" },
    ],
  },
  {
    title: "Customers",
    icon: Users,
    href: "/salon/customers",
  },
  {
    title: "Services",
    icon: Package,
    href: "/salon/services",
    subItems: [
      { title: "All Services", href: "/salon/services" },
      { title: "Categories", href: "/salon/categories" },
      { title: "Pricing", href: "/salon/services/pricing" },
    ],
  },
  {
    title: "Staff",
    icon: UserCheck,
    href: "/salon/staff",
    subItems: [
      { title: "Team Members", href: "/salon/staff" },
      { title: "Schedules", href: "/salon/staff/schedule" },
      { title: "Performance", href: "/salon/staff/performance" },
      { title: "Specialties", href: "/salon/staff/specialties" },
    ],
  },
  {
    title: "Time Off",
    icon: CalendarOff,
    href: "/salon/timeoff",
  },
  {
    title: "Locations",
    icon: MapPin,
    href: "/salon/locations",
  },
  {
    title: "Loyalty Program",
    icon: Trophy,
    href: "/salon/loyalty",
    subItems: [
      { title: "Program Settings", href: "/salon/loyalty" },
      { title: "Points Ledger", href: "/salon/loyalty/ledger" },
      { title: "Transactions", href: "/salon/loyalty/transactions" },
    ],
  },
  {
    title: "Marketing",
    icon: Megaphone,
    href: "/salon/marketing",
    subItems: [
      { title: "Campaigns", href: "/salon/marketing" },
      { title: "SMS Opt-outs", href: "/salon/marketing/sms" },
      { title: "Analytics", href: "/salon/marketing/analytics" },
    ],
  },
  {
    title: "Analytics",
    icon: BarChart3,
    href: "/salon/analytics",
  },
  {
    title: "Salon Settings",
    icon: Store,
    href: "/salon/salon",
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/salon/settings",
    subItems: [
      { title: "General", href: "/salon/settings" },
      { title: "Notifications", href: "/salon/settings/notifications" },
      { title: "Export Data", href: "/salon/settings/export" },
    ],
  },
]
interface AppSidebarProps {
  user?: User
  profile?: Profile
}
export function AppSidebar({ user, profile }: AppSidebarProps = {}) {
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
                    <Link href="/salon/profile">
                      <UserCircle className="h-4 w-4" />
                      <span>{profile?.full_name || user?.email || 'Salon Owner'}</span>
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