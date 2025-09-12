'use client'

import { cn } from '@/lib/utils'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Scissors,
  DollarSign,
  BarChart3,
  Settings,
  Store,
  Shield,
  Star,
  Bell,
  CreditCard,
  FileText,
  MessageSquare
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export type UserRole = 'admin' | 'owner' | 'staff' | 'customer'

export interface NavigationItem {
  title: string
  href?: string
  icon?: React.ComponentType<{ className?: string }>
  badge?: string | number
  items?: NavigationItem[]
}

interface NavigationGroup {
  title: string
  items: NavigationItem[]
}

const navigationConfig: Record<UserRole, NavigationGroup[]> = {
  admin: [
    {
      title: 'Platform',
      items: [
        { title: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { title: 'Users', href: '/admin/users', icon: Users },
        { title: 'Salons', href: '/admin/salons', icon: Store },
        { title: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
        { title: 'Security', href: '/admin/security', icon: Shield },
        { title: 'Settings', href: '/admin/settings', icon: Settings },
      ]
    }
  ],
  owner: [
    {
      title: 'Management',
      items: [
        { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { title: 'Appointments', href: '/dashboard/appointments', icon: Calendar },
        { title: 'Customers', href: '/dashboard/customers', icon: Users },
        { title: 'Staff', href: '/dashboard/staff', icon: Users },
        { title: 'Services', href: '/dashboard/services', icon: Scissors },
      ]
    },
    {
      title: 'Business',
      items: [
        { title: 'Revenue', href: '/dashboard/revenue', icon: DollarSign },
        { title: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
        { title: 'Reviews', href: '/dashboard/reviews', icon: Star },
        { title: 'Reports', href: '/dashboard/reports', icon: FileText },
        { title: 'Settings', href: '/dashboard/settings', icon: Settings },
      ]
    }
  ],
  staff: [
    {
      title: 'Work',
      items: [
        { title: 'Dashboard', href: '/staff', icon: LayoutDashboard },
        { title: 'Schedule', href: '/staff/schedule', icon: Calendar },
        { title: 'Appointments', href: '/staff/appointments', icon: Calendar },
        { title: 'Customers', href: '/staff/customers', icon: Users },
      ]
    },
    {
      title: 'Personal',
      items: [
        { title: 'Tips', href: '/staff/tips', icon: DollarSign },
        { title: 'Reviews', href: '/staff/reviews', icon: Star },
        { title: 'Profile', href: '/staff/profile', icon: Settings },
      ]
    }
  ],
  customer: [
    {
      title: 'Bookings',
      items: [
        { title: 'Dashboard', href: '/customer', icon: LayoutDashboard },
        { title: 'Book Now', href: '/customer/book', icon: Calendar },
        { title: 'My Appointments', href: '/customer/appointments', icon: Calendar },
        { title: 'History', href: '/customer/history', icon: FileText },
      ]
    },
    {
      title: 'Account',
      items: [
        { title: 'Favorites', href: '/customer/favorites', icon: Star },
        { title: 'Reviews', href: '/customer/reviews', icon: MessageSquare },
        { title: 'Payment Methods', href: '/customer/payments', icon: CreditCard },
        { title: 'Notifications', href: '/customer/notifications', icon: Bell },
        { title: 'Profile', href: '/customer/profile', icon: Settings },
      ]
    }
  ]
}

interface RoleBasedSidebarProps {
  role: UserRole
  className?: string
}

export function RoleBasedSidebar({ role, className }: RoleBasedSidebarProps) {
  const pathname = usePathname()
  const navigation = navigationConfig[role]

  return (
    <Sidebar className={cn(className)}>
      <SidebarContent>
        {navigation.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  if (!item.href || !item.icon) return null
                  
                  const isActive = pathname === item.href || 
                    (item.href !== '/' && pathname.startsWith(item.href))
                  
                  const IconComponent = item.icon
                  
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className={cn(
                          "transition-colors",
                          isActive && "bg-accent text-accent-foreground"
                        )}
                      >
                        <Link href={item.href}>
                          <IconComponent className="h-4 w-4" />
                          <span>{item.title}</span>
                          {item.badge && (
                            <span className={cn(
                              "ml-auto rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground"
                            )}>
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  )
}