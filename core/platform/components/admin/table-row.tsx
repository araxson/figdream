import { TableCell, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
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
  Key,
  Trash2,
  Edit,
  Eye,
  Ban,
  CheckCircle,
  XCircle
} from 'lucide-react'
import type { ProfileWithRelations } from '../dal/users-types'

interface UserTableRowProps {
  user: ProfileWithRelations
  isSelected: boolean
  onSelect: () => void
  onAction: (action: string) => void
}

export function UserTableRow({ user, isSelected, onSelect, onAction }: UserTableRowProps) {
  const getStatusBadge = (user: ProfileWithRelations) => {
    if (user.deleted_at) {
      return <Badge variant="destructive">Deleted</Badge>
    }
    if (user.suspended_at) {
      return <Badge variant="secondary">Suspended</Badge>
    }
    if (user.is_active) {
      return <Badge variant="default">Active</Badge>
    }
    return <Badge variant="outline">Inactive</Badge>
  }

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      platform_admin: { label: 'Platform Admin', variant: 'destructive' as const },
      salon_owner: { label: 'Salon Owner', variant: 'default' as const },
      salon_staff: { label: 'Salon Staff', variant: 'secondary' as const },
      customer: { label: 'Customer', variant: 'outline' as const },
    }

    const config = roleConfig[role as keyof typeof roleConfig] || { label: role, variant: 'outline' as const }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const formatDate = (date: string | null) => {
    if (!date) return 'Never'
    return new Date(date).toLocaleDateString()
  }

  return (
    <TableRow>
      <TableCell>
        <Checkbox
          checked={isSelected}
          onCheckedChange={onSelect}
        />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={user.avatar_url || ''} />
            <AvatarFallback>
              {user.first_name?.[0]}{user.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">
              {user.first_name} {user.last_name}
            </div>
            <div className="text-sm text-muted-foreground">
              {user.email}
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        {getRoleBadge(user.role)}
      </TableCell>
      <TableCell>
        {getStatusBadge(user)}
      </TableCell>
      <TableCell>
        {formatDate(user.created_at)}
      </TableCell>
      <TableCell>
        {formatDate(user.last_active_at)}
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onAction('view')}>
              <Eye className="h-4 w-4 mr-2" />
              View Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAction('edit')}>
              <Edit className="h-4 w-4 mr-2" />
              Edit User
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onAction('reset_password')}>
              <Key className="h-4 w-4 mr-2" />
              Reset Password
            </DropdownMenuItem>
            {!user.deleted_at && (
              <DropdownMenuItem
                onClick={() => onAction(user.is_active ? 'deactivate' : 'activate')}
              >
                {user.is_active ? (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Activate
                  </>
                )}
              </DropdownMenuItem>
            )}
            {!user.deleted_at && (
              <DropdownMenuItem
                onClick={() => onAction('suspend')}
                className="text-destructive"
              >
                <Ban className="h-4 w-4 mr-2" />
                Suspend User
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}