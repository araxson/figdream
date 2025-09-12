'use client'

import * as React from 'react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Mail, Phone, Star, Calendar, Clock, DollarSign } from 'lucide-react'
import { StaffEditDialog } from './staff-edit-dialog'
import { StaffDeleteDialog } from './staff-delete-dialog'

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

interface StaffCardProps {
  staff: StaffMember
  onEdit?: (staff: StaffMember) => void
  onDelete?: (id: string) => void
  onViewDetails?: (staff: StaffMember) => void
}

export function StaffCard({ staff, onEdit, onDelete }: StaffCardProps) {
  const [editOpen, setEditOpen] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)


  const handleSaveEdit = (updatedStaff: StaffMember) => {
    if (onEdit) {
      onEdit(updatedStaff)
    }
    setEditOpen(false)
  }

  const handleConfirmDelete = () => {
    if (onDelete) {
      onDelete(staff.id)
    }
    setDeleteOpen(false)
  }

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={staff.avatar} alt={staff.name} />
                <AvatarFallback>{staff.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{staff.name}</h3>
                <p className="text-sm text-muted-foreground">{staff.role}</p>
                <Badge variant={staff.isActive ? "default" : "secondary"}>
                  {staff.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-sm">
                {staff.rating.toFixed(1)} Rating
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {staff.totalBookings} Bookings
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Today: {staff.schedule.today}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                ${staff.revenue.toLocaleString()}
              </span>
            </div>
          </div>
          
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">
              Services: {staff.services.join(', ')}
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button variant="outline" size="sm" asChild>
            <a href={`mailto:${staff.email}`}>
              <Mail className="mr-2 h-4 w-4" />
              Email
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href={`tel:${staff.phone}`}>
              <Phone className="mr-2 h-4 w-4" />
              Call
            </a>
          </Button>
        </CardFooter>
      </Card>

      {onEdit && (
        <StaffEditDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          staff={staff}
          onSave={handleSaveEdit}
        />
      )}

      {onDelete && (
        <StaffDeleteDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          staffName={staff.name}
          onConfirm={handleConfirmDelete}
        />
      )}
    </>
  )
}