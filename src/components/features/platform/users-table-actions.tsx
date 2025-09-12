'use client'

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
  MoreHorizontal, 
  Edit, 
  Shield, 
  Ban, 
  Mail 
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface UsersTableActionsProps {
  onEdit: () => void
  onChangeRole: () => void
  onSuspend: () => void
  onMessage: () => void
}

export function UsersTableActions({
  onEdit,
  onChangeRole,
  onSuspend,
  onMessage
}: UsersTableActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={cn("h-8 w-8 p-0")}>
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className={cn("h-4 w-4")} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={onEdit}>
          <Edit className={cn("mr-2 h-4 w-4")} />
          Edit Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onChangeRole}>
          <Shield className={cn("mr-2 h-4 w-4")} />
          Change Role
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onMessage}>
          <Mail className={cn("mr-2 h-4 w-4")} />
          Send Message
        </DropdownMenuItem>
        <DropdownMenuItem className="text-destructive" onClick={onSuspend}>
          <Ban className={cn("mr-2 h-4 w-4")} />
          Suspend Account
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}