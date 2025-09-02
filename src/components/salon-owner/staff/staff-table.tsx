'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger
} from '@/components/ui'
import { Edit2, Trash2, Mail, Phone, Star } from 'lucide-react'
import type { Database } from '@/types/database.types'

type StaffProfile = Database['public']['Tables']['staff_profiles']['Row']
type Service = Database['public']['Tables']['services']['Row']
type StaffService = Database['public']['Tables']['staff_services']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']

type StaffMember = StaffProfile & {
  profiles?: Profile | null
  staff_services?: (StaffService & {
    services?: Service | null
  })[] | null
  appointments_count?: number
  revenue_generated?: number
  average_rating?: number
}

interface StaffTableProps {
  staff: StaffMember[]
  onEditStaff: (staffMember: StaffMember) => void
  onDeleteStaff: (staffId: string) => void
}

export function StaffTable({ staff, onEditStaff, onDeleteStaff }: StaffTableProps) {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Staff Member</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Services</TableHead>
          <TableHead>Performance</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {staff.map((member) => (
          <TableRow key={member.id}>
            <TableCell>
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={member.profiles?.avatar_url || undefined} />
                  <AvatarFallback>
                    {getInitials(member.first_name, member.last_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {member.first_name} {member.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {member.display_name}
                  </p>
                </div>
              </div>
            </TableCell>

            <TableCell>
              <div className="space-y-1">
                <div className="flex items-center text-sm">
                  <Mail className="mr-2 h-3 w-3" />
                  {member.profiles?.email}
                </div>
                {member.phone && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Phone className="mr-2 h-3 w-3" />
                    {member.phone}
                  </div>
                )}
              </div>
            </TableCell>

            <TableCell>
              <div className="space-y-2">
                <Badge variant={member.is_active ? 'default' : 'secondary'}>
                  {member.is_active ? 'Active' : 'Inactive'}
                </Badge>
                {member.can_book_online && (
                  <Badge variant="outline">Online Booking</Badge>
                )}
              </div>
            </TableCell>

            <TableCell>
              <div className="max-w-48">
                {member.staff_services && member.staff_services.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {member.staff_services.slice(0, 3).map((staffService) => (
                      <Badge key={staffService.id} variant="outline" className="text-xs">
                        {staffService.services?.name}
                      </Badge>
                    ))}
                    {member.staff_services.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{member.staff_services.length - 3} more
                      </Badge>
                    )}
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">No services assigned</span>
                )}
              </div>
            </TableCell>

            <TableCell>
              <div className="space-y-1 text-sm">
                <div className="flex items-center">
                  <Star className="mr-1 h-3 w-3 text-yellow-400" />
                  {member.average_rating ? member.average_rating.toFixed(1) : 'N/A'}
                </div>
                <div className="text-muted-foreground">
                  {member.appointments_count || 0} appointments
                </div>
                <div className="font-medium">
                  {formatCurrency(member.revenue_generated || 0)}
                </div>
              </div>
            </TableCell>

            <TableCell>
              <ContextMenu>
                <ContextMenuTrigger>
                  <Button variant="ghost" size="sm">
                    Actions
                  </Button>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem onClick={() => onEditStaff(member)}>
                    <Edit2 className="mr-2 h-4 w-4" />
                    Edit Staff
                  </ContextMenuItem>
                  <ContextMenuItem 
                    onClick={() => onDeleteStaff(member.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Staff
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}