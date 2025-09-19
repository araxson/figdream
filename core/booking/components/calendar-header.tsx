'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import type { Service, StaffProfile } from '../types'

interface CalendarHeaderProps {
  selectedDate: Date
  onDateChange: (date: Date) => void
  services: Service[]
  staff: StaffProfile[]
  selectedService?: Service
  selectedStaff?: StaffProfile
  onServiceSelect: (service: Service | undefined) => void
  onStaffSelect: (staff: StaffProfile | undefined) => void
  view: 'day' | 'week' | 'calendar' | 'staff'
  onViewChange: (view: 'day' | 'week' | 'calendar' | 'staff') => void
  isLoading?: boolean
  onRefresh: () => void
}

export function CalendarHeader({
  selectedDate,
  onDateChange,
  services,
  staff,
  selectedService,
  selectedStaff,
  onServiceSelect,
  onStaffSelect,
  view,
  onViewChange,
  isLoading = false,
  onRefresh
}: CalendarHeaderProps) {
  const navigatePrevious = () => {
    const newDate = new Date(selectedDate)
    if (view === 'week') {
      newDate.setDate(newDate.getDate() - 7)
    } else {
      newDate.setDate(newDate.getDate() - 1)
    }
    onDateChange(newDate)
  }

  const navigateNext = () => {
    const newDate = new Date(selectedDate)
    if (view === 'week') {
      newDate.setDate(newDate.getDate() + 7)
    } else {
      newDate.setDate(newDate.getDate() + 1)
    }
    onDateChange(newDate)
  }

  const navigateToday = () => {
    onDateChange(new Date())
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">
            {selectedDate.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </h2>
          {selectedService && (
            <Badge variant="secondary">
              {selectedService.name} - ${selectedService.price}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={navigatePrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button variant="outline" onClick={navigateToday}>
            Today
          </Button>

          <Button variant="outline" onClick={navigateNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Button variant="outline" onClick={onRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <Select
          value={selectedService?.id || ''}
          onValueChange={(value) => {
            const service = value ? services.find(s => s.id === value) : undefined
            onServiceSelect(service)
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select service..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All services</SelectItem>
            {services.map((service) => (
              <SelectItem key={service.id} value={service.id}>
                {service.name} - ${service.price}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={selectedStaff?.id || ''}
          onValueChange={(value) => {
            const staffMember = value ? staff.find(s => s.id === value) : undefined
            onStaffSelect(staffMember)
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select staff..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All staff</SelectItem>
            {staff.map((member) => (
              <SelectItem key={member.id} value={member.id}>
                {member.name} - {member.role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Tabs value={view} onValueChange={onViewChange as (value: string) => void}>
          <TabsList>
            <TabsTrigger value="day">Day</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="staff">Staff</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  )
}