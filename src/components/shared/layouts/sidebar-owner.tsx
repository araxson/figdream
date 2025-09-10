'use client'

import React from 'react'
import { BaseSidebar } from '@/components/shared/layouts/sidebar-base'
import { ownerNavigation, managerNavigation } from './navigation-owner'
import { Scissors } from 'lucide-react'
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

interface OwnerSidebarProps {
  user?: {
    name: string
    email: string
    avatar?: string
    role: 'salon_owner' | 'salon_manager' | 'location_manager'
  }
  salon?: {
    name: string
    plan?: 'free' | 'basic' | 'premium'
  }
}

export function OwnerSidebar({ user, salon }: OwnerSidebarProps) {
  const isOwner = user?.role === 'salon_owner'
  const navigation = isOwner ? ownerNavigation : managerNavigation

  const logo = (
    <div className="flex items-center gap-2 px-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
        <Scissors className="h-4 w-4 text-primary-foreground" />
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-semibold">{salon?.name || 'Salon'}</span>
        {salon?.plan && (
          <Badge variant="secondary" className="w-fit text-[10px] px-1.5 py-0">
            {salon.plan}
          </Badge>
        )}
      </div>
    </div>
  )

  const footer = user && (
    <div className="p-2">
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
              <span className="text-muted-foreground">
                {user.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Salon Settings</DropdownMenuItem>
          <DropdownMenuItem>Billing</DropdownMenuItem>
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
      navigation={navigation}
      footer={footer}
      className="border-r"
    />
  )
}