'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { User, Clock, TrendingUp } from 'lucide-react'
import type { StaffAvailability } from '../types'

interface StaffAvailabilityDisplayProps {
  staffAvailability: StaffAvailability[]
  selectedDate: Date
  onStaffSelect?: (staffId: string) => void
  selectedStaffId?: string
}

export function StaffAvailabilityDisplay({
  staffAvailability,
  selectedDate,
  onStaffSelect,
  selectedStaffId
}: StaffAvailabilityDisplayProps) {
  if (staffAvailability.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <User className="h-12 w-12 mx-auto mb-2" />
        <p>No staff availability data</p>
      </div>
    )
  }

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 70) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getAvailabilityStatus = (staff: StaffAvailability) => {
    const totalSlots = staff.totalSlots
    const availableSlots = staff.availableSlots
    const utilization = ((totalSlots - availableSlots) / totalSlots) * 100

    if (availableSlots === 0) return { label: 'Fully Booked', variant: 'destructive' as const }
    if (utilization >= 70) return { label: 'Busy', variant: 'secondary' as const }
    return { label: 'Available', variant: 'default' as const }
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-4">
        {staffAvailability.map((staff) => {
          const status = getAvailabilityStatus(staff)
          const utilization = ((staff.totalSlots - staff.availableSlots) / staff.totalSlots) * 100
          const isSelected = selectedStaffId === staff.id

          return (
            <Card
              key={staff.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => onStaffSelect?.(staff.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={staff.avatar} alt={staff.name} />
                      <AvatarFallback>
                        {staff.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <CardTitle className="text-base">{staff.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{staff.role}</p>
                    </div>
                  </div>

                  <Badge variant={status.variant}>
                    {status.label}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {staff.availableSlots}
                    </div>
                    <div className="text-xs text-muted-foreground">Available</div>
                  </div>

                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {staff.totalSlots - staff.availableSlots}
                    </div>
                    <div className="text-xs text-muted-foreground">Booked</div>
                  </div>

                  <div>
                    <div className="text-2xl font-bold text-gray-600">
                      {staff.totalSlots}
                    </div>
                    <div className="text-xs text-muted-foreground">Total</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      Utilization
                    </span>
                    <span className="font-medium">{Math.round(utilization)}%</span>
                  </div>
                  <Progress
                    value={utilization}
                    className="h-2"
                  />
                </div>

                {staff.nextAvailableSlot && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>Next available: {staff.nextAvailableSlot}</span>
                  </div>
                )}

                {staff.specialties && staff.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {staff.specialties.map((specialty, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </ScrollArea>
  )
}