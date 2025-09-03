'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import type { SelectedService } from './booking-types'

interface ServiceSelectorProps {
  locationId: string
  staffId?: string
  selectedServices: SelectedService[]
  onServiceSelect: (services: SelectedService[]) => void
  allowMultiple?: boolean
  showCategories?: boolean
  showSearch?: boolean
  disabled?: boolean
}

export function ServiceSelector({
  selectedServices,
  _onServiceSelect,
  _disabled = false
}: ServiceSelectorProps) {
  // This is a stub implementation
  // The actual service selector should be implemented with database queries
  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Services</CardTitle>
        <CardDescription>
          Choose the services you would like to book
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-muted-foreground">
          Service selection component to be implemented.
          Currently selected: {selectedServices.length} service(s)
        </div>
      </CardContent>
    </Card>
  )
}