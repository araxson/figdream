"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Users,
  Calendar,
  DollarSign,
  BarChart3,
  Settings,
  Briefcase,
  MapPin,
  Package,
  TrendingUp,
  FileText,
  ShoppingBag,
  UserPlus,
  ChevronRight,
  ChevronsUpDown,
  LogOut,
  User,
  HelpCircle,
  Scissors,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

const ownerNavItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Salon Management",
    icon: Scissors,
    items: [
      {
        title: "Salon Profile",
        url: "/dashboard/salon",
      },
      {
        title: "Locations",
        url: "/dashboard/locations",
        icon: MapPin,
      },
      {
        title: "Operating Hours",
        url: "/dashboard/hours",
      },
    ],
  },
  {
    title: "Staff",
    icon: Users,
    items: [
      {
        title: "All Staff",
        url: "/dashboard/staff",
      },
      {
        title: "Add Staff",
        url: "/dashboard/staff/add",
        icon: UserPlus,
      },
      {
        title: "Schedules",
        url: "/dashboard/staff/schedules",
        icon: Calendar,
      },
      {
        title: "Permissions",
        url: "/dashboard/staff/permissions",
      },
    ],
  },
  {
    title: "Services",
    icon: Briefcase,
    items: [
      {
        title: "Service Menu",
        url: "/dashboard/services",
      },
      {
        title: "Categories",
        url: "/dashboard/services/categories",
      },
      {
        title: "Pricing",
        url: "/dashboard/services/pricing",
        icon: DollarSign,
      },
      {
        title: "Add-ons",
        url: "/dashboard/services/addons",
      },
    ],
  },
  {
    title: "Bookings",
    icon: Calendar,
    items: [
      {
        title: "Calendar View",
        url: "/dashboard/bookings",
      },
      {
        title: "Upcoming",
        url: "/dashboard/bookings/upcoming",
      },
      {
        title: "Past",
        url: "/dashboard/bookings/past",
      },
    ],
  },
  {
    title: "Inventory",
    icon: Package,
    items: [
      {
        title: "Products",
        url: "/dashboard/inventory",
      },
      {
        title: "Stock Levels",
        url: "/dashboard/inventory/stock",
      },
      {
        title: "Suppliers",
        url: "/dashboard/inventory/suppliers",
      },
      {
        title: "Orders",
        url: "/dashboard/inventory/orders",
        icon: ShoppingBag,
      },
    ],
  },
  {
    title: "Analytics",
    icon: BarChart3,
    items: [
      {
        title: "Overview",
        url: "/dashboard/analytics",
      },
      {
        title: "Revenue",
        url: "/dashboard/analytics/revenue",
        icon: TrendingUp,
      },
      {
        title: "Customers",
        url: "/dashboard/analytics/customers",
      },
      {
        title: "Services",
        url: "/dashboard/analytics/services",
      },
    ],
  },
  {
    title: "Reports",
    url: "/dashboard/reports",
    icon: FileText,
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
  },
]

const managerNavItems = ownerNavItems.filter(item => 
  !["Reports", "Settings"].includes(item.title)
)

interface AppSidebarOwnerProps extends React.ComponentProps<typeof Sidebar> {
  user?: {
    name: string
    email: string
    avatar?: string
    role?: "salon_owner" | "salon_manager" | "location_manager"
  }
}

export function AppSidebarOwner({ user, ...props }: AppSidebarOwnerProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { isMobile } = useSidebar()
  
  const navItems = user?.role === "salon_owner" ? ownerNavItems : managerNavItems
  
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      toast.success("Signed out successfully")
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
      toast.error("Failed to sign out")
    }
  }

  const displayName = user?.name || user?.email?.split("@")[0] || "Owner"
  const initials = displayName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
  const roleLabel = user?.role?.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase()) || "Salon Owner"

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Scissors className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Salon Dashboard</span>
                  <span className="truncate text-xs text-muted-foreground">{roleLabel}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map((item) => {
              const isActive = pathname === item.url
              
              if (item.items) {
                const hasActiveChild = item.items.some(child => pathname === child.url)
                
                return (
                  <Collapsible
                    key={item.title}
                    asChild
                    defaultOpen={hasActiveChild}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton tooltip={item.title}>
                          {item.icon && <item.icon />}
                          <span>{item.title}</span>
                          <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items.map((subItem) => {
                            const isSubActive = pathname === subItem.url
                            return (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton asChild isActive={isSubActive}>
                                  <Link href={subItem.url}>
                                    {"icon" in subItem && subItem.icon && <subItem.icon className="size-3" />}
                                    <span>{subItem.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            )
                          })}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                )
              }
              
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                    <Link href={item.url}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user?.avatar} alt={displayName} />
                    <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{displayName}</span>
                    <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={user?.avatar} alt={displayName} />
                      <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">{displayName}</span>
                      <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/support">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Support
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  )
}