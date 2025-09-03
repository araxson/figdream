'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/feedback/badge'
import { Button } from '@/components/ui/form/button'
import { ScrollArea } from '@/components/ui/layout/scroll-area'
import { Clock, User, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
interface TimeSlot {
  id: string
  time: string
  available: boolean
  staffId?: string
  staffName?: string
  duration?: number
  price?: number
}
interface TimeSlotGroup {
  label: string
  slots: TimeSlot[]
}
interface TimeSlotsProps {
  slots: TimeSlot[]
  selectedSlot?: string
  onSlotSelect?: (slot: TimeSlot) => void
  groupByPeriod?: boolean
  showStaff?: boolean
  showPrice?: boolean
  className?: string
}
export function TimeSlots({
  slots,
  selectedSlot,
  onSlotSelect,
  groupByPeriod = true,
  showStaff = false,
  showPrice = false,
  className,
}: TimeSlotsProps) {
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null)
  const groupSlotsByPeriod = (slots: TimeSlot[]): TimeSlotGroup[] => {
    if (!groupByPeriod) {
      return [{ label: 'Available Times', slots }]
    }
    const morning: TimeSlot[] = []
    const afternoon: TimeSlot[] = []
    const evening: TimeSlot[] = []
    slots.forEach(slot => {
      const hour = parseInt(slot.time.split(':')[0])
      if (hour < 12) {
        morning.push(slot)
      } else if (hour < 17) {
        afternoon.push(slot)
      } else {
        evening.push(slot)
      }
    })
    const groups: TimeSlotGroup[] = []
    if (morning.length > 0) groups.push({ label: 'Morning', slots: morning })
    if (afternoon.length > 0) groups.push({ label: 'Afternoon', slots: afternoon })
    if (evening.length > 0) groups.push({ label: 'Evening', slots: evening })
    return groups
  }
  const formatDuration = (minutes?: number) => {
    if (!minutes) return ''
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}min`
    } else if (hours > 0) {
      return `${hours}h`
    } else {
      return `${mins}min`
    }
  }
  const formatPrice = (price?: number) => {
    if (!price) return ''
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }
  const groupedSlots = groupSlotsByPeriod(slots)
  const availableCount = slots.filter(s => s.available).length
  if (slots.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-12", className)}>
        <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
        <p className="text-lg font-medium text-muted-foreground">No time slots available</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Please select a different date or service
        </p>
      </div>
    )
  }
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {availableCount} of {slots.length} slots available
        </p>
        {availableCount === 0 && (
          <Badge variant="destructive">Fully Booked</Badge>
        )}
      </div>
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-6">
          {groupedSlots.map((group) => (
            <div key={group.label}>
              <h4 className="mb-3 text-sm font-medium text-muted-foreground">
                {group.label}
              </h4>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {group.slots.map((slot) => (
                  <Button
                    key={slot.id}
                    variant={
                      selectedSlot === slot.id
                        ? 'default'
                        : slot.available
                        ? 'outline'
                        : 'ghost'
                    }
                    size="sm"
                    disabled={!slot.available}
                    onClick={() => slot.available && onSlotSelect?.(slot)}
                    onMouseEnter={() => setHoveredSlot(slot.id)}
                    onMouseLeave={() => setHoveredSlot(null)}
                    className={cn(
                      "relative justify-start transition-all",
                      !slot.available && "opacity-50 cursor-not-allowed",
                      hoveredSlot === slot.id && slot.available && "shadow-md"
                    )}
                  >
                    <div className="flex w-full items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        <span className="font-medium">{slot.time}</span>
                      </div>
                      {!slot.available && (
                        <Badge variant="secondary" className="ml-2 h-5 px-1 ">
                          Booked
                        </Badge>
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      {selectedSlot && (
        <div className="rounded-lg border bg-muted/50 p-3">
          {(() => {
            const selected = slots.find(s => s.id === selectedSlot)
            if (!selected) return null
            return (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{selected.time}</span>
                  </div>
                  {selected.duration && (
                    <span className="text-sm text-muted-foreground">
                      {formatDuration(selected.duration)}
                    </span>
                  )}
                </div>
                {showStaff && selected.staffName && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selected.staffName}</span>
                  </div>
                )}
                {showPrice && selected.price && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Price</span>
                    <span className="font-medium">{formatPrice(selected.price)}</span>
                  </div>
                )}
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}