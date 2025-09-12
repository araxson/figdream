'use client'

import { TableCell, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { UserCheck, MoreHorizontal, Edit, Shield, Ban, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getRoleBadgeVariant, getRoleLabel } from './users-table-utils'
import type { Database } from '@/types/database.types'

type User = Database['public']['Tables']['profiles']['Row']

interface UsersTableRowProps {
  user: User
  onEdit?: (user: User) => void
  onChangeRole?: (user: User) => void
  onSendEmail?: (user: User) => void
  onSuspend?: (user: User) => void
}

export function UsersTableRow({ 
  user, 
  onEdit,
  onChangeRole,
  onSendEmail,
  onSuspend
}: UsersTableRowProps) {
  return (
    <TableRow>
      <TableCell>
        <div className={cn("flex items-center gap-3")}>
          <Avatar className={cn("h-10 w-10")}>
            <AvatarImage src={user.avatar_url || ''} />
            <AvatarFallback>
              {user.full_name?.split(' ').map(n => n[0]).join('') || user.email?.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className={cn("font-medium")}>
              {user.full_name || 'Unnamed User'}
            </div>
            <div className={cn("text-sm text-muted-foreground")}>
              ID: {user.id.substring(0, 8)}...
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className={cn("flex items-center gap-2")}>
          <Mail className={cn("h-4 w-4 text-muted-foreground")} />
          {user.email}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={getRoleBadgeVariant(user.role || 'customer')}>
          {getRoleLabel(user.role || 'customer')}
        </Badge>
      </TableCell>
      <TableCell>
        <div className={cn("text-sm")}>
          {new Date(user.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className={cn("gap-1")}>
          <UserCheck className={cn("h-3 w-3")} />
          Active
        </Badge>
      </TableCell>
      <TableCell className={cn("text-right")}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className={cn("h-8 w-8")}>
              <MoreHorizontal className={cn("h-4 w-4")} />
              <span className={cn("sr-only")}>Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className={cn("w-48")}>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEdit?.(user)}>
              <Edit className={cn("mr-2 h-4 w-4")} />
              Edit User
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onChangeRole?.(user)}>
              <Shield className={cn("mr-2 h-4 w-4")} />
              Change Role
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSendEmail?.(user)}>
              <Mail className={cn("mr-2 h-4 w-4")} />
              Send Email
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className={cn("text-destructive")}
              onClick={() => onSuspend?.(user)}
            >
              <Ban className={cn("mr-2 h-4 w-4")} />
              Suspend User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}