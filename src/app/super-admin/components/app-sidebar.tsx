'use client'

import Link from 'next/link'
import { LogOut, Shield } from 'lucide-react'
import {
  Activity,
  BarChart,
  Building,
  DollarSign,
  Home,
  Mail,
  Settings,
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
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'

interface SuperAdminSidebarProps {
  user: any
}

const navigation = [
  { name: 'Dashboard', href: '/super-admin', icon: Home },
  { name: 'Salons', href: '/super-admin/salons', icon: Building },
  { name: 'Users', href: '/super-admin/users', icon: Users },
  { name: 'Analytics', href: '/super-admin/analytics', icon: BarChart },
  { name: 'Billing', href: '/super-admin/billing', icon: DollarSign },
  { name: 'Email Templates', href: '/super-admin/email-templates', icon: Mail },
  { name: 'System Health', href: '/super-admin/system-health', icon: Activity },
  { name: 'Settings', href: '/super-admin/settings', icon: Settings },
]

export function SuperAdminSidebar({ user }: SuperAdminSidebarProps) {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-destructive text-destructive-foreground">
            <Shield className="size-4" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none">
            <span className="font-semibold">Super Admin</span>
            <span className="text-xs text-muted-foreground">Platform Management</span>
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
              <p className="text-sm font-medium">Super Administrator</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
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