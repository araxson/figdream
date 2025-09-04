'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { StaffMember } from './booking-types'

interface StaffSelectorProps {
  locationId: string
  serviceId?: string
  selectedStaff: StaffMember | null
  onStaffSelect: (staff: StaffMember | null) => void
  showAll?: boolean
  disabled?: boolean
}

export function StaffSelector({
  selectedStaff,
  onStaffSelect: _onStaffSelect,
  disabled: _disabled = false
}: StaffSelectorProps) {
  // This is a stub implementation
  // The actual staff selector should be implemented with database queries
  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Staff Member</CardTitle>
        <CardDescription>
          Choose your preferred staff member or select &quot;Any Available&quot;
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-muted-foreground">
          Staff selection component to be implemented.
          Currently selected: {selectedStaff ? `${selectedStaff.first_name} ${selectedStaff.last_name}` : 'None'}
        </div>
      </CardContent>
    </Card>
  )
}