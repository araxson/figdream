'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Button } from '@/components/ui/button'

export function NotificationFilters() {
  const [filters, setFilters] = useState({
    types: [] as string[],
    priority: 'all',
    status: 'all'
  })

  const notificationTypes = [
    { value: 'appointment', label: 'Appointments' },
    { value: 'review', label: 'Reviews' },
    { value: 'message', label: 'Messages' },
    { value: 'alert', label: 'Alerts' },
    { value: 'marketing', label: 'Marketing' }
  ]

  function toggleType(type: string) {
    setFilters(prev => ({
      ...prev,
      types: prev.types.includes(type)
        ? prev.types.filter(t => t !== type)
        : [...prev.types, type]
    }))
  }

  function resetFilters() {
    setFilters({
      types: [],
      priority: 'all',
      status: 'all'
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label className="text-sm font-medium">Status</Label>
          <RadioGroup
            value={filters.status}
            onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="all" />
              <Label htmlFor="all" className="text-sm font-normal">
                All notifications
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="unread" id="unread" />
              <Label htmlFor="unread" className="text-sm font-normal">
                Unread only
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="read" id="read" />
              <Label htmlFor="read" className="text-sm font-normal">
                Read only
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium">Type</Label>
          <div className="space-y-2">
            {notificationTypes.map((type) => (
              <div key={type.value} className="flex items-center space-x-2">
                <Checkbox
                  id={type.value}
                  checked={filters.types.includes(type.value)}
                  onCheckedChange={() => toggleType(type.value)}
                />
                <Label
                  htmlFor={type.value}
                  className="text-sm font-normal cursor-pointer"
                >
                  {type.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium">Priority</Label>
          <RadioGroup
            value={filters.priority}
            onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="priority-all" />
              <Label htmlFor="priority-all" className="text-sm font-normal">
                All priorities
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="high" id="priority-high" />
              <Label htmlFor="priority-high" className="text-sm font-normal">
                High priority
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="medium" id="priority-medium" />
              <Label htmlFor="priority-medium" className="text-sm font-normal">
                Medium priority
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="low" id="priority-low" />
              <Label htmlFor="priority-low" className="text-sm font-normal">
                Low priority
              </Label>
            </div>
          </RadioGroup>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={resetFilters}
        >
          Reset filters
        </Button>
      </CardContent>
    </Card>
  )
}