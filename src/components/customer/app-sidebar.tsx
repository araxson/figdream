'use client'

import Link from 'next/link'
import { LogOut } from 'lucide-react'
import {
  Calendar,
  CreditCard,
  Gift,
  Heart,
  Home,
  MessageSquare,
  Settings,
  Star,
  User,
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
import type { User as SupabaseUser } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']
type Customer = Database['public']['Tables']['customers']['Row']

interface CustomerSidebarProps {
  user: SupabaseUser
  customer: Customer
}

const navigation = [
  { name: 'Dashboard', href: '/customer', icon: Home },
  { name: 'Appointments', href: '/customer/appointments', icon: Calendar },
  { name: 'Loyalty', href: '/customer/loyalty', icon: Star },
  { name: 'Gift Cards', href: '/customer/gift-cards', icon: Gift },
  { name: 'Favorites', href: '/customer/favorites', icon: Heart },
  { name: 'Reviews', href: '/customer/reviews', icon: MessageSquare },
  { name: 'Payment Methods', href: '/customer/payment-methods', icon: CreditCard },
  { name: 'Profile', href: '/customer/profile', icon: User },
  { name: 'Settings', href: '/customer/settings', icon: Settings },
]

export function CustomerSidebar({ user, customer }: CustomerSidebarProps) {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <User className="size-4" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none">
            <span className="font-semibold">Customer Portal</span>
            <span className="text-xs text-muted-foreground">Manage your bookings</span>
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
                {customer.profiles?.full_name || 'Customer'}
              </p>
              <p className="text-xs text-muted-foreground">{customer.profiles?.email}</p>
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