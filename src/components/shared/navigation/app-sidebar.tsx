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
  SidebarSeparator
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
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
        <SidebarSeparator />
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="w-full">
                  <Avatar className="size-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>
                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-0.5 flex-1 text-left">
                    <span className="text-sm font-semibold truncate">{user.name}</span>
                    <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                  </div>
                  <ChevronRight className="size-4 opacity-50" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="w-56" 
                align="end" 
                alignOffset={11}
                forceMount
              >
                <div className="flex flex-col gap-1 px-2 py-1.5">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user.role.replace('_', ' ')}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/${user.role.replace('_', '-')}/profile`}>
                    Profile Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/${user.role.replace('_', '-')}/settings`}>
                    Account Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="size-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}