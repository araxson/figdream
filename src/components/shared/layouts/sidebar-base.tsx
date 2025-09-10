'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
} from '@/components/ui/sidebar'
import { ChevronRight, type LucideIcon } from 'lucide-react'

export interface NavigationItem {
  title: string
  href?: string
  icon?: LucideIcon
  items?: NavigationItem[]
  badge?: string | number
  disabled?: boolean
}

interface BaseSidebarProps {
  logo?: React.ReactNode
  navigation: NavigationItem[]
  footer?: React.ReactNode
  className?: string
}

export function BaseSidebar({ 
  logo, 
  navigation, 
  footer,
  className 
}: BaseSidebarProps) {
  const pathname = usePathname()

  const isActive = (href?: string) => {
    if (!href) return false
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  const renderNavItem = (item: NavigationItem) => {
    const Icon = item.icon
    const active = isActive(item.href)

    if (item.items && item.items.length > 0) {
      return (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton>
            {Icon && <Icon className="h-4 w-4" />}
            <span>{item.title}</span>
            <ChevronRight className="ml-auto h-4 w-4" />
          </SidebarMenuButton>
          <SidebarMenuSub>
            {item.items.map((subItem) => (
              <SidebarMenuSubItem key={subItem.title}>
                <SidebarMenuSubButton
                  asChild
                  isActive={isActive(subItem.href)}
                >
                  <Link href={subItem.href || '#'}>
                    {subItem.icon && <subItem.icon className="h-3 w-3" />}
                    <span>{subItem.title}</span>
                    {subItem.badge && (
                      <span className="ml-auto text-xs">{subItem.badge}</span>
                    )}
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </SidebarMenuItem>
      )
    }

    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton
          asChild
          isActive={active}
          disabled={item.disabled}
        >
          <Link href={item.href || '#'}>
            {Icon && <Icon className="h-4 w-4" />}
            <span>{item.title}</span>
            {item.badge && (
              <span className="ml-auto text-xs">{item.badge}</span>
            )}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  return (
    <Sidebar className={className}>
      {logo && (
        <SidebarHeader>
          {logo}
        </SidebarHeader>
      )}
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map(renderNavItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {footer && (
        <SidebarFooter>
          {footer}
        </SidebarFooter>
      )}
    </Sidebar>
  )
}