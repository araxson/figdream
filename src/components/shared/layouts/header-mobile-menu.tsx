'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Menu, LogOut } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

interface MobileMenuProps {
  navigationItems: Array<{
    title: string
    href: string
    icon: React.ComponentType<{ className?: string }>
  }>
  user?: {
    id: string
    role: string
  }
  onSignOut: () => void
}

export function HeaderMobileMenu({ navigationItems, user, onSignOut }: MobileMenuProps) {
  const pathname = usePathname()

  return (
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
                className={cn(`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-accent'
                }`)}
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
                onClick={onSignOut}
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
  )
}