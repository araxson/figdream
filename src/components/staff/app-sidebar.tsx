'use client'
import Link from 'next/link'
import { LogOut } from 'lucide-react'
import {
  Calendar,
  Clock,
  DollarSign,
  Home,
  Settings,
  TrendingUp,
  User,
  Users,
} from 'lucide-react'
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
  Button,
} from '@/components/ui'
import type { Database } from '@/types/database.types'
// Use proper database types
type Profile = Database['public']['Tables']['profiles']['Row']
type StaffProfile = Database['public']['Tables']['staff_profiles']['Row']
interface StaffSidebarProps {
  user: Profile
  staff: StaffProfile
}
const navigation = [
  { name: 'Dashboard', href: '/staff', icon: Home },
  { name: 'Schedule', href: '/staff/schedule', icon: Calendar },
  { name: 'Appointments', href: '/staff/appointments', icon: Users },
  { name: 'Time Off', href: '/staff/timeoff', icon: Clock },
  { name: 'Earnings', href: '/staff/earnings', icon: DollarSign },
  { name: 'Performance', href: '/staff/performance', icon: TrendingUp },
  { name: 'Profile', href: '/staff/profile', icon: User },
  { name: 'Settings', href: '/staff/settings', icon: Settings },
]
export function StaffSidebar({ user: _user, staff }: StaffSidebarProps) {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Users className="size-4" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none">
            <span className="font-semibold">Staff Portal</span>
            <span className="text-xs text-muted-foreground">{staff.salons?.name}</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild>
                    <Link href={item.href}>
                      <item.icon className="size-4" />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex flex-col gap-1 px-4 py-2">
              <p className="text-sm font-medium">
                {staff.display_name || staff.profiles?.full_name || 'Staff Member'}
              </p>
              <p className="text-xs text-muted-foreground">{staff.profiles?.email}</p>
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <form action="/logout" method="POST" className="w-full px-2">
              <Button type="submit" variant="outline" className="w-full justify-start">
                <LogOut className="size-4" />
                Sign Out
              </Button>
            </form>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}