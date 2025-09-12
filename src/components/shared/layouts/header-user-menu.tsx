'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import { ROLE_ROUTES } from '@/lib/auth/constants'

interface HeaderUserMenuProps {
  user: {
    id: string
    email: string
    role: 'customer' | 'staff' | 'admin' | 'super_admin'
    name?: string
    avatar?: string
  }
}

export function HeaderUserMenu({ user }: HeaderUserMenuProps) {
  const router = useRouter()
  
  const handleSignOut = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error('Failed to sign out')
      }
      
      toast({ title: 'Signed out successfully' })
      router.push('/')
      router.refresh()
    } catch {
      // Error handled by toast notification below
      toast({ title: 'Failed to sign out', variant: "destructive" })
    }
  }
  
  const displayName = user.name || user.email?.split('@')[0] || 'User'
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  
  return (
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
          <Link href={user.role && user.role in ROLE_ROUTES ? ROLE_ROUTES[user.role as keyof typeof ROLE_ROUTES] : '/customer'}>Dashboard</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={user.role === 'customer' ? '/customer/preferences' : user.role === 'staff' ? '/staff/profile' : `${user.role && user.role in ROLE_ROUTES ? ROLE_ROUTES[user.role as keyof typeof ROLE_ROUTES] : '/customer'}/settings`}>Settings</Link>
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
  )
}