'use client'

import * as React from 'react'
import { Card, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, Phone } from 'lucide-react'
import { StaffCardHeader } from './staff-card-header'
import { StaffCardStats } from './staff-card-stats'
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

export function StaffCard({ staff, onEdit, onDelete, onViewDetails }: StaffCardProps) {
  const [editOpen, setEditOpen] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)

  const handleEdit = () => {
    setEditOpen(true)
  }

  const handleDelete = () => {
    setDeleteOpen(true)
  }

  const handleToggleActive = () => {
    if (onEdit) {
      onEdit({ ...staff, isActive: !staff.isActive })
    }
  }

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
        <StaffCardHeader
          staff={staff}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onViewDetails={() => onViewDetails?.(staff)}
          onToggleActive={handleToggleActive}
        />
        
        <StaffCardStats
          rating={staff.rating}
          totalBookings={staff.totalBookings}
          revenue={staff.revenue}
          performance={staff.performance}
          schedule={staff.schedule}
          services={staff.services}
        />

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