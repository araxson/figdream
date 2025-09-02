"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui"
import {
  LayoutDashboard,
  Calendar,
  Users,
  Clock,
  Settings,
  FileText,
} from "lucide-react"
import Link from "next/link"
import { User } from "@supabase/supabase-js"
import type { Database } from "@/types/database.types"

type Profile = Database['public']['Tables']['profiles']['Row']

const menuItems = [
  { title: "Dashboard", url: "/role-location-manager", icon: LayoutDashboard },
  { title: "Appointments", url: "/role-location-manager/appointments", icon: Calendar },
  { title: "Staff", url: "/role-location-manager/staff", icon: Users },
  { title: "Schedule", url: "/role-location-manager/schedule", icon: Clock },
  { title: "Reports", url: "/role-location-manager/reports", icon: FileText },
  { title: "Settings", url: "/role-location-manager/settings", icon: Settings },
]

interface LocationManagerSidebarProps {
  user: User
  profile: Profile
}

export function LocationManagerSidebar({ user, profile }: LocationManagerSidebarProps) {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Location Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}