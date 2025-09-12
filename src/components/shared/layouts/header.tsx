'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ROLE_ROUTES } from '@/lib/auth/constants'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import { Button } from '@/components/ui/button'
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
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Menu, LogOut, Settings, Calendar } from 'lucide-react'
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

const services: { title: string; href: string; description: string }[] = [
  {
    title: "Hair Services",
    href: "/services/hair",
    description: "Professional haircuts, coloring, and styling services.",
  },
  {
    title: "Nail Services",
    href: "/services/nails",
    description: "Manicures, pedicures, and nail art by expert technicians.",
  },
  {
    title: "Spa & Wellness",
    href: "/services/spa",
    description: "Relaxing massages, facials, and body treatments.",
  },
  {
    title: "Beauty Treatments",
    href: "/services/beauty",
    description: "Makeup, eyebrows, lashes, and skincare services.",
  },
]

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
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
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"

export function Header({ user }: HeaderProps) {
  const router = useRouter()
  const supabase = createClient()
  
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

  const displayName = user?.name || user?.email?.split('@')[0] || 'User'
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center">
        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
              <SheetDescription>
                Navigate our platform
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              <Link href="/" className="text-sm font-medium">
                Home
              </Link>
              <Link href="/services" className="text-sm font-medium">
                Services
              </Link>
              <Link href="/customer/book" className="text-sm font-medium">
                Browse Salons
              </Link>
              <Link href="/about" className="text-sm font-medium">
                About
              </Link>
              {!user ? (
                <>
                  <Link href="/login">
                    <Button className="w-full" variant="outline">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button className="w-full">
                      Sign Up
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href={user.role && user.role in ROLE_ROUTES ? ROLE_ROUTES[user.role as keyof typeof ROLE_ROUTES] : '/customer'} className="text-sm font-medium">
                    Dashboard
                  </Link>
                  <Button onClick={handleSignOut} variant="outline" className="w-full">
                    Sign Out
                  </Button>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Calendar className="h-6 w-6" />
          <span className="hidden font-bold sm:inline-block">
            Book Now
          </span>
        </Link>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link href="/" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Home
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger>Services</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                  {services.map((service) => (
                    <ListItem
                      key={service.title}
                      title={service.title}
                      href={service.href}
                    >
                      {service.description}
                    </ListItem>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger>Browse</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                  <li className="row-span-3">
                    <NavigationMenuLink asChild>
                      <Link
                        className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                        href="/customer/book"
                      >
                        <Calendar className="h-6 w-6" />
                        <div className="mb-2 mt-4 text-lg font-medium">
                          Find Salons
                        </div>
                        <p className="text-sm leading-tight text-muted-foreground">
                          Discover top-rated beauty salons in your area
                        </p>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  <ListItem href="/customer/book?filter=near-me" title="Near Me">
                    Find salons based on your current location
                  </ListItem>
                  <ListItem href="/customer/book?filter=top-rated" title="Top Rated">
                    Browse highest-rated salons and services
                  </ListItem>
                  <ListItem href="/customer/book?filter=categories" title="By Category">
                    Search by service type and specialization
                  </ListItem>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link href="/about" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  About
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

            {user && (
              <NavigationMenuItem>
                <Link href={user.role && user.role in ROLE_ROUTES ? ROLE_ROUTES[user.role as keyof typeof ROLE_ROUTES] : '/customer'} legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Dashboard
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            )}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Right Side Actions */}
        <div className="ml-auto flex items-center space-x-4">
          {!user ? (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">
                  Sign Up
                </Button>
              </Link>
            </>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={displayName} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{displayName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={user.role && user.role in ROLE_ROUTES ? ROLE_ROUTES[user.role as keyof typeof ROLE_ROUTES] : '/customer'}>
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={user.role === 'customer' ? '/customer/preferences' : user.role === 'staff' ? '/staff/profile' : `${user.role && user.role in ROLE_ROUTES ? ROLE_ROUTES[user.role as keyof typeof ROLE_ROUTES] : '/customer'}/settings`}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  )
}