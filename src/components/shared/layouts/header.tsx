'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Menu, Bell, User, Search, Calendar, LogOut, Settings, Home, BookOpen, Users, BarChart3, Shield } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface HeaderProps {
  user?: {
    id: string
    email: string
    role: 'customer' | 'staff' | 'admin' | 'super_admin'
    name?: string
    avatar?: string
  }
}

// Navigation items based on role
const getNavigationItems = (role?: string) => {
  if (!role) {
    return [
      { title: 'Home', href: '/', icon: Home },
      { title: 'Browse Salons', href: '/browse', icon: Search },
      { title: 'Services', href: '/services', icon: BookOpen },
      { title: 'About', href: '/about', icon: Users },
    ]
  }

  switch (role) {
    case 'customer':
      return [
        { title: 'Dashboard', href: '/customer', icon: Home },
        { title: 'Book Appointment', href: '/customer/book', icon: Calendar },
        { title: 'My Appointments', href: '/customer/appointments', icon: BookOpen },
        { title: 'Favorites', href: '/customer/favorites', icon: Users },
        { title: 'Preferences', href: '/customer/preferences', icon: Settings },
      ]
    case 'staff':
      return [
        { title: 'Dashboard', href: '/staff', icon: Home },
        { title: 'Schedule', href: '/staff/schedule', icon: Calendar },
        { title: 'Appointments', href: '/staff/appointments', icon: BookOpen },
        { title: 'Clients', href: '/staff/clients', icon: Users },
        { title: 'Analytics', href: '/staff/analytics', icon: BarChart3 },
      ]
    case 'admin':
      return [
        { title: 'Dashboard', href: '/admin', icon: Home },
        { title: 'Salon Management', href: '/admin/salon', icon: Settings },
        { title: 'Staff', href: '/admin/staff', icon: Users },
        { title: 'Services', href: '/admin/services', icon: BookOpen },
        { title: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
      ]
    case 'super_admin':
      return [
        { title: 'Dashboard', href: '/admin', icon: Home },
        { title: 'Platform Overview', href: '/admin/platform', icon: Shield },
        { title: 'Salons', href: '/admin/salons', icon: Settings },
        { title: 'Users', href: '/admin/users', icon: Users },
        { title: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
      ]
    default:
      return []
  }
}

// Quick actions based on role
const getQuickActions = (role?: string) => {
  if (!role) {
    return [
      { title: 'Sign In', href: '/login', icon: User, variant: 'ghost' as const },
      { title: 'Sign Up', href: '/register', icon: User, variant: 'default' as const },
    ]
  }

  switch (role) {
    case 'customer':
      return [
        { title: 'Book Now', href: '/customer/book', icon: Calendar, variant: 'default' as const },
      ]
    case 'staff':
      return [
        { title: 'View Schedule', href: '/staff/schedule', icon: Calendar, variant: 'default' as const },
      ]
    case 'admin':
    case 'super_admin':
      return [
        { title: 'Manage', href: '/admin', icon: Settings, variant: 'default' as const },
      ]
    default:
      return []
  }
}

export function Header({ user }: HeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  
  const navigationItems = getNavigationItems(user?.role)
  const quickActions = getQuickActions(user?.role)
  
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      toast.success('Signed out successfully')
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
      toast.error('Failed to sign out')
    }
  }

  // Determine if search should be shown
  const showSearch = !user || user.role === 'customer'
  
  // Get display name
  const displayName = user?.name || user?.email?.split('@')[0] || 'User'
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Mobile Menu */}
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <nav className="mt-6 space-y-1">
                  {navigationItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.title}
                        href={item.href}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          isActive 
                            ? 'bg-primary text-primary-foreground' 
                            : 'hover:bg-accent'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {item.title}
                      </Link>
                    )
                  })}
                  {user && (
                    <>
                      <div className="my-2 border-t" />
                      <button
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive hover:bg-accent"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>

            <Link href={user ? `/${user.role}` : '/'} className="flex items-center gap-2">
              <Calendar className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl hidden sm:inline">FigDream</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {navigationItems.slice(0, 5).map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className={`text-sm font-medium transition-colors ${
                    isActive 
                      ? 'text-primary' 
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  {item.title}
                </Link>
              )
            })}
          </nav>

          {/* Search Bar */}
          {showSearch && (
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search salons, services..."
                  className="pl-10"
                />
              </div>
            </div>
          )}

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Quick Actions */}
            {!user && quickActions.length > 0 && (
              <div className="hidden sm:flex gap-2">
                {quickActions.map((action) => {
                  const Icon = action.icon
                  return (
                    <Button
                      key={action.title}
                      variant={action.variant}
                      size="sm"
                      asChild
                    >
                      <Link href={action.href}>
                        <Icon className="h-4 w-4 mr-2" />
                        {action.title}
                      </Link>
                    </Button>
                  )
                })}
              </div>
            )}

            {/* Notifications (for authenticated users) */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-[10px]">
                      3
                    </Badge>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium">Welcome to FigDream!</span>
                      <span className="text-xs text-muted-foreground">
                        Complete your profile to get started
                      </span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>{displayName}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                      <Badge variant="outline" className="mt-1 w-fit text-xs">
                        {user.role.replace('_', ' ')}
                      </Badge>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={`/${user.role}`}>Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/${user.role}/settings`}>Settings</Link>
                  </DropdownMenuItem>
                  {user.role === 'customer' && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/customer/appointments">My Appointments</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/customer/favorites">Favorites</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-destructive cursor-pointer"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="icon" asChild>
                <Link href="/login">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}