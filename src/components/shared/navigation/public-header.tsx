"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Menu, Sparkles } from "lucide-react"

const services = [
  {
    title: "Hair Services",
    href: "/services/hair",
    description: "Professional hair cuts, styling, coloring and treatments",
  },
  {
    title: "Beauty Services",
    href: "/services/beauty",
    description: "Makeup, skincare, and beauty treatments",
  },
  {
    title: "Nail Services",
    href: "/services/nails",
    description: "Manicures, pedicures, and nail art",
  },
  {
    title: "Spa Services",
    href: "/services/spa",
    description: "Relaxing massages and spa treatments",
  },
]

const solutions = [
  {
    title: "For Salon Owners",
    href: "/features#salon-owners",
    description: "Complete salon management solution",
  },
  {
    title: "For Staff",
    href: "/features#staff",
    description: "Tools to manage your schedule and clients",
  },
  {
    title: "For Customers",
    href: "/features#customers",
    description: "Easy booking and loyalty rewards",
  },
]

export function PublicHeader() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = React.useState(false)

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(path)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-8 flex">
          <Link href="/" className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">FigDream</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden lg:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link href="/" className={navigationMenuTriggerStyle()}>
                  Home
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger>Services</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
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
              <NavigationMenuTrigger>Solutions</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4">
                  {solutions.map((solution) => (
                    <ListItem
                      key={solution.title}
                      title={solution.title}
                      href={solution.href}
                    >
                      {solution.description}
                    </ListItem>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link href="/pricing" className={navigationMenuTriggerStyle()}>
                  Pricing
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link href="/about" className={navigationMenuTriggerStyle()}>
                  About
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link href="/contact" className={navigationMenuTriggerStyle()}>
                  Contact
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="ml-auto flex items-center space-x-4">
          <Button variant="ghost" asChild className="hidden sm:inline-flex">
            <Link href="/login">Sign In</Link>
          </Button>
          <Button asChild className="hidden sm:inline-flex">
            <Link href="/register">Get Started</Link>
          </Button>

          {/* Mobile menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col space-y-4 mt-8">
                <Link
                  href="/"
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    isActive("/") ? "text-primary" : "text-muted-foreground"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="/features"
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    isActive("/features") ? "text-primary" : "text-muted-foreground"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  Features
                </Link>
                <Link
                  href="/pricing"
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    isActive("/pricing") ? "text-primary" : "text-muted-foreground"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  Pricing
                </Link>
                <Link
                  href="/about"
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    isActive("/about") ? "text-primary" : "text-muted-foreground"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  About
                </Link>
                <Link
                  href="/contact"
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    isActive("/contact") ? "text-primary" : "text-muted-foreground"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  Contact
                </Link>
                <div className="pt-4 space-y-2">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/login" onClick={() => setIsOpen(false)}>
                      Sign In
                    </Link>
                  </Button>
                  <Button className="w-full" asChild>
                    <Link href="/register" onClick={() => setIsOpen(false)}>
                      Get Started
                    </Link>
                  </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

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