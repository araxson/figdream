'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from '@/components/ui/navigation-menu'
import { Separator } from '@/components/ui/separator'
import { 
  Building, Users, Calendar, DollarSign, BarChart, Settings,
  Menu, X, Home, MapPin, Clock, Star, Package, Bell,
  ChevronRight, LogOut, HelpCircle, CreditCard, FileText, Image
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SalonOwnerLayoutProps {
  children: React.ReactNode
}

export default function SalonOwnerLayout({ children }: SalonOwnerLayoutProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/owner', icon: Home },
    { name: 'Locations', href: '/owner/locations', icon: MapPin },
    { name: 'Staff', href: '/owner/staff', icon: Users },
    { name: 'Services', href: '/owner/services', icon: Package },
    { name: 'Appointments', href: '/owner/appointments', icon: Calendar },
    { name: 'Customers', href: '/owner/customers', icon: Users },
    { name: 'Analytics', href: '/owner/analytics', icon: BarChart },
    { name: 'Revenue', href: '/owner/revenue', icon: DollarSign },
    { name: 'Reviews', href: '/owner/reviews', icon: Star },
    { name: 'Marketing', href: '/owner/marketing', icon: Bell },
    { name: 'Gallery', href: '/owner/gallery', icon: Image },
    { name: 'Reports', href: '/owner/reports', icon: FileText },
    { name: 'Billing', href: '/owner/billing', icon: CreditCard },
    { name: 'Settings', href: '/owner/settings', icon: Settings }
  ]

  const secondaryNavigation = [
    { name: 'Help Center', href: '/owner/help', icon: HelpCircle },
    { name: 'Sign Out', href: '/auth/logout', icon: LogOut }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent 
            navigation={navigation}
            secondaryNavigation={secondaryNavigation}
            pathname={pathname}
            onNavigate={() => setSidebarOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <SidebarContent 
          navigation={navigation}
          secondaryNavigation={secondaryNavigation}
          pathname={pathname}
        />
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <div className="sticky top-0 z-40 flex h-16 items-center gap-x-4 border-b bg-background px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1 items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold">Glamour Beauty Salon</h2>
              </div>

              <div className="flex items-center gap-x-4 lg:gap-x-6">
                <Button variant="ghost" size="icon">
                  <Bell className="h-5 w-5" />
                </Button>
                
                <Separator orientation="vertical" className="hidden lg:block h-6" />
                
                <div className="flex items-center gap-3">
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-medium">John Smith</p>
                    <p className="text-xs text-muted-foreground">Salon Owner</p>
                  </div>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder-avatar.jpg" alt="John Smith" />
                    <AvatarFallback>JS</AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="py-6">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

interface SidebarContentProps {
  navigation: Array<{ name: string; href: string; icon: React.ComponentType<{ className?: string }> }>
  secondaryNavigation: Array<{ name: string; href: string; icon: React.ComponentType<{ className?: string }> }>
  pathname: string
  onNavigate?: () => void
}

function SidebarContent({ navigation, secondaryNavigation, pathname, onNavigate }: SidebarContentProps) {
  return (
    <ScrollArea className="flex grow flex-col gap-y-5 border-r bg-background px-6 pb-4">
      <div className="flex h-16 shrink-0 items-center">
        <Link href="/owner" className="flex items-center gap-2" onClick={onNavigate}>
          <Building className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold">FigDream</span>
        </Link>
      </div>
      
      <NavigationMenu orientation="vertical" className="flex flex-1 flex-col">
        <NavigationMenuList className="flex flex-1 flex-col gap-y-7">
          <NavigationMenuItem className="flex flex-1 flex-col">
            <ul className="-mx-2 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <li key={item.name}>
                    <NavigationMenuLink asChild>
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        className={cn(
                          'group flex gap-x-3 rounded-md p-2 text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        )}
                      >
                        <item.icon
                          className={cn(
                            'h-5 w-5 shrink-0',
                            isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'
                          )}
                        />
                        {item.name}
                        {isActive && (
                          <ChevronRight className="ml-auto h-4 w-4" />
                        )}
                      </Link>
                    </NavigationMenuLink>
                  </li>
                )
              })}
            </ul>
          </NavigationMenuItem>
          
          <NavigationMenuItem className="mt-auto">
            <ul className="-mx-2 space-y-1">
              {secondaryNavigation.map((item) => (
                <li key={item.name}>
                  <NavigationMenuLink asChild>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      className="group flex gap-x-3 rounded-md p-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                      <item.icon className="h-5 w-5 shrink-0 text-muted-foreground group-hover:text-foreground" />
                      {item.name}
                    </Link>
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </ScrollArea>
  )
}