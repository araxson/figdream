'use client'

import React from 'react'
import { BaseSidebar } from '@/components/shared/layouts/sidebar-base'
import { staffNavigation } from './navigation-staff'
import { UserCircle } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'

interface StaffSidebarProps {
  user?: {
    name: string
    email: string
    avatar?: string
    role?: string
  }
  salon?: {
    name: string
  }
}

export function StaffSidebar({ user, salon }: StaffSidebarProps) {
  const logo = (
    <div className="flex items-center gap-2 px-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
        <UserCircle className="h-4 w-4 text-primary-foreground" />
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-semibold">Staff Portal</span>
        <span className="text-xs text-muted-foreground">{salon?.name || 'Salon'}</span>
      </div>
    </div>
  )

  const footer = user && (
    <div className="p-2">
      <div className="mb-2 px-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Today&apos;s Earnings</span>
          <span className="font-semibold">$245</span>
        </div>
        <div className="flex items-center justify-between text-xs mt-1">
          <span className="text-muted-foreground">Appointments</span>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            5 today
          </Badge>
        </div>
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="w-full justify-start gap-2 px-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>
                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start text-xs">
              <span className="font-medium">{user.name}</span>
              <span className="text-muted-foreground">{user.role || 'Staff Member'}</span>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Availability</DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive">
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )

  return (
    <BaseSidebar
      logo={logo}
      navigation={staffNavigation}
      footer={footer}
      className="border-r"
    />
  )
}