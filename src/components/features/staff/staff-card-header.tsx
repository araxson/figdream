'use client'

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
import { 
  MoreVertical, 
  Edit,
  Trash,
  Eye,
  UserCheck,
  UserX
} from 'lucide-react'
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface StaffMember {
  id: string
  name: string
  email: string
  phone: string
  role: string
  avatar?: string
  rating: number
  totalBookings: number
  revenue: number
  availability: 'available' | 'busy' | 'off'
  schedule: {
    today: string
    tomorrow: string
  }
  services: string[]
  performance: {
    bookingRate: number
    customerSatisfaction: number
    revenue: number
  }
  isActive: boolean
}

interface StaffCardHeaderProps {
  staff: StaffMember
  onEdit?: () => void
  onDelete?: () => void
  onViewDetails?: () => void
  onToggleActive?: () => void
}

export function StaffCardHeader({ 
  staff, 
  onEdit, 
  onDelete, 
  onViewDetails,
  onToggleActive 
}: StaffCardHeaderProps) {
  const getAvailabilityBadge = (availability: string) => {
    switch (availability) {
      case 'available':
        return <Badge variant="default" className="bg-green-600">Available</Badge>
      case 'busy':
        return <Badge variant="secondary" className="bg-yellow-600">Busy</Badge>
      case 'off':
        return <Badge variant="outline">Day Off</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <CardHeader>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={staff.avatar} alt={staff.name} />
            <AvatarFallback>{staff.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{staff.name}</CardTitle>
              {!staff.isActive && (
                <Badge variant="secondary">Inactive</Badge>
              )}
            </div>
            <CardDescription>{staff.role}</CardDescription>
            <div className="flex items-center gap-2">
              {getAvailabilityBadge(staff.availability)}
            </div>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {onViewDetails && (
              <DropdownMenuItem onClick={onViewDetails}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
            )}
            {onEdit && (
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
            )}
            {onToggleActive && (
              <DropdownMenuItem onClick={onToggleActive}>
                {staff.isActive ? (
                  <>
                    <UserX className="mr-2 h-4 w-4" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <UserCheck className="mr-2 h-4 w-4" />
                    Activate
                  </>
                )}
              </DropdownMenuItem>
            )}
            {onDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </CardHeader>
  )
}