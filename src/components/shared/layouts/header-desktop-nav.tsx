'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import { cn } from '@/lib/utils'
import { isRoleAllowed, STAFF_ROLES, ADMIN_ROLES } from '@/lib/auth/constants'

type NavigationItem = {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

type GroupedNavItems = NavigationItem[] | {
  main: NavigationItem[]
  preferences?: NavigationItem[]
  management?: NavigationItem[]
  analytics?: NavigationItem[]
}

interface DesktopNavProps {
  user?: {
    id: string
    role: 'customer' | 'staff' | 'admin' | 'super_admin'
  }
  navigationItems: NavigationItem[]
  groupedNavItems: GroupedNavItems
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & { title: string; icon?: React.ComponentType<{ className?: string }> }
>(({ className, title, children, icon: Icon, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="flex items-center gap-2">
            {Icon && <Icon className="h-4 w-4" />}
            <div className="text-sm font-medium leading-none">{title}</div>
          </div>
          {children && (
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
              {children}
            </p>
          )}
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"

export function HeaderDesktopNav({ user, navigationItems, groupedNavItems }: DesktopNavProps) {
  const pathname = usePathname()

  return (
    <NavigationMenu className="hidden lg:block">
      <NavigationMenuList>
        {!user ? (
          navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <NavigationMenuItem key={item.title}>
                <Link href={item.href} legacyBehavior passHref>
                  <NavigationMenuLink 
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "gap-2",
                      isActive && "bg-accent text-accent-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.title}
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            )
          })
        ) : (
          <>
            {user.role === 'customer' && (
              <>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>My Account</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                      {'main' in groupedNavItems && groupedNavItems.main?.map((item) => (
                        <ListItem
                          key={item.title}
                          title={item.title}
                          href={item.href}
                          icon={item.icon}
                        />
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Settings</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4">
                      {'preferences' in groupedNavItems && groupedNavItems.preferences?.map((item) => (
                        <ListItem
                          key={item.title}
                          title={item.title}
                          href={item.href}
                          icon={item.icon}
                        />
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </>
            )}
            
            {isRoleAllowed(user.role, STAFF_ROLES) && (
              <>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Work</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                      {'main' in groupedNavItems && groupedNavItems.main?.map((item) => (
                        <ListItem
                          key={item.title}
                          title={item.title}
                          href={item.href}
                          icon={item.icon}
                        />
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Management</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4">
                      {'management' in groupedNavItems && groupedNavItems.management?.map((item) => (
                        <ListItem
                          key={item.title}
                          title={item.title}
                          href={item.href}
                          icon={item.icon}
                        />
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </>
            )}
            
            {isRoleAllowed(user.role, ADMIN_ROLES) && (
              <>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Platform</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                      {'main' in groupedNavItems && groupedNavItems.main?.map((item) => (
                        <ListItem
                          key={item.title}
                          title={item.title}
                          href={item.href}
                          icon={item.icon}
                        />
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Analytics</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4">
                      {'analytics' in groupedNavItems && groupedNavItems.analytics?.map((item) => (
                        <ListItem
                          key={item.title}
                          title={item.title}
                          href={item.href}
                          icon={item.icon}
                        />
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </>
            )}
          </>
        )}
      </NavigationMenuList>
    </NavigationMenu>
  )
}