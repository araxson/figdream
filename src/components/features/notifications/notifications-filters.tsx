'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface NotificationFilters {
  types: string[]
  priority: string
  status: string
}

interface NotificationFiltersProps {
  onFiltersChange?: (filters: NotificationFilters) => void
  className?: string
}

export function NotificationFilters({ onFiltersChange, className }: NotificationFiltersProps) {
  const [filters, setFilters] = useState<NotificationFilters>({
    types: [],
    priority: 'all',
    status: 'all'
  })

  const notificationTypes = [
    { value: 'appointment_confirmation', label: 'Appointment Confirmations' },
    { value: 'appointment_reminder', label: 'Appointment Reminders' },
    { value: 'appointment_cancellation', label: 'Cancellations' },
    { value: 'review_request', label: 'Review Requests' },
    { value: 'staff_update', label: 'Staff Updates' },
    { value: 'promotion', label: 'Promotions' },
    { value: 'general', label: 'General' }
  ]

  function updateFilters(newFilters: Partial<NotificationFilters>) {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    onFiltersChange?.(updatedFilters)
  }

  function toggleType(type: string) {
    const newTypes = filters.types.includes(type)
      ? filters.types.filter(t => t !== type)
      : [...filters.types, type]
    
    updateFilters({ types: newTypes })
  }

  function resetFilters() {
    const resetFilters = {
      types: [],
      priority: 'all',
      status: 'all'
    }
    setFilters(resetFilters)
    onFiltersChange?.(resetFilters)
  }

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className={cn("text-base")}>Filters</CardTitle>
      </CardHeader>
      <CardContent className={cn("space-y-6")}>
        <div className={cn("space-y-3")}>
          <Label className={cn("text-sm font-medium")}>Status</Label>
          <RadioGroup
            value={filters.status}
            onValueChange={(value) => updateFilters({ status: value })}
          >
            <div className={cn("flex items-center space-x-2")}>
              <RadioGroupItem value="all" id="all" />
              <Label htmlFor="all" className={cn("text-sm font-normal")}>
                All notifications
              </Label>
            </div>
            <div className={cn("flex items-center space-x-2")}>
              <RadioGroupItem value="unread" id="unread" />
              <Label htmlFor="unread" className={cn("text-sm font-normal")}>
                Unread only
              </Label>
            </div>
            <div className={cn("flex items-center space-x-2")}>
              <RadioGroupItem value="read" id="read" />
              <Label htmlFor="read" className={cn("text-sm font-normal")}>
                Read only
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className={cn("space-y-3")}>
          <Label className={cn("text-sm font-medium")}>Type</Label>
          <div className={cn("space-y-2")}>
            {notificationTypes.map((type) => (
              <div key={type.value} className={cn("flex items-center space-x-2")}>
                <Checkbox
                  id={type.value}
                  checked={filters.types.includes(type.value)}
                  onCheckedChange={() => toggleType(type.value)}
                />
                <Label
                  htmlFor={type.value}
                  className={cn("text-sm font-normal cursor-pointer")}
                >
                  {type.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className={cn("space-y-3")}>
          <Label className={cn("text-sm font-medium")}>Priority</Label>
          <RadioGroup
            value={filters.priority}
            onValueChange={(value) => updateFilters({ priority: value })}
          >
            <div className={cn("flex items-center space-x-2")}>
              <RadioGroupItem value="all" id="priority-all" />
              <Label htmlFor="priority-all" className={cn("text-sm font-normal")}>
                All priorities
              </Label>
            </div>
            <div className={cn("flex items-center space-x-2")}>
              <RadioGroupItem value="high" id="priority-high" />
              <Label htmlFor="priority-high" className={cn("text-sm font-normal")}>
                High priority
              </Label>
            </div>
            <div className={cn("flex items-center space-x-2")}>
              <RadioGroupItem value="medium" id="priority-medium" />
              <Label htmlFor="priority-medium" className={cn("text-sm font-normal")}>
                Medium priority
              </Label>
            </div>
            <div className={cn("flex items-center space-x-2")}>
              <RadioGroupItem value="low" id="priority-low" />
              <Label htmlFor="priority-low" className={cn("text-sm font-normal")}>
                Low priority
              </Label>
            </div>
          </RadioGroup>
        </div>

        <Button
          variant="outline"
          className={cn("w-full")}
          onClick={resetFilters}
        >
          Reset filters
        </Button>
      </CardContent>
    </Card>
  )
}