'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogOut, LucideIcon } from 'lucide-react'
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
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui'
import { ChevronRight } from 'lucide-react'
export interface SidebarNavItem {
  title: string
  href: string
  icon: LucideIcon
  subItems?: {
    title: string
    href: string
  }[]
}
export interface SidebarUserInfo {
  name: string
  email: string
  role: string
  avatar?: string
}
export interface AppSidebarConfig {
  title: string
  subtitle: string
  icon: LucideIcon
  navigation: SidebarNavItem[]
}
interface AppSidebarProps {
  config: AppSidebarConfig
  user: SidebarUserInfo
  onSignOut?: () => void
}
export function AppSidebar({ config, user, onSignOut }: AppSidebarProps) {
  const pathname = usePathname()
  const isActiveItem = (href: string, subItems?: { href: string }[]) => {
    if (pathname === href) return true
    if (subItems) {
      return subItems.some(subItem => pathname === subItem.href)
    }
    return false
  }
  const isActiveSubItem = (href: string) => {
    return pathname === href
  }
  const handleSignOut = () => {
    if (onSignOut) {
      onSignOut()
    } else {
      // Default form-based logout
      const form = document.createElement('form')
      form.action = '/logout'
      form.method = 'POST'
      document.body.appendChild(form)
      form.submit()
      document.body.removeChild(form)
    }
  }
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <config.icon className="size-4" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none">
            <span className="font-semibold">{config.title}</span>
            <span className="text-xs text-muted-foreground">{config.subtitle}</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {config.navigation.map((item) => (
                <SidebarMenuItem key={item.href}>
                  {item.subItems ? (
                    <Collapsible
                      defaultOpen={isActiveItem(item.href, item.subItems)}
                    >
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          className="w-full justify-between"
                          isActive={isActiveItem(item.href, item.subItems)}
                        >
                          <div className="flex items-center gap-2">
                            <item.icon className="size-4" />
                            <span>{item.title}</span>
                          </div>
                          <ChevronRight className="size-4 ui-open:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.subItems.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.href}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={isActiveSubItem(subItem.href)}
                              >
                                <Link href={subItem.href}>
                                  {subItem.title}
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    <SidebarMenuButton
                      asChild
                      isActive={isActiveItem(item.href)}
                    >
                      <Link href={item.href}>
                        <item.icon className="size-4" />
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
            <div className="flex flex-col gap-1 px-4 py-2">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
              <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <div className="px-2">
              <Button 
                onClick={handleSignOut}
                variant="outline" 
                className="w-full justify-start"
              >
                <LogOut className="size-4" />
                Sign Out
              </Button>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}