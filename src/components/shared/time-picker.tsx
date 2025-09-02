'use client'

import * as React from "react"
import { Clock } from "lucide-react"
import {
  Label,
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ScrollArea,
} from "@/components/ui"
import { cn } from "@/lib/utils"

interface TimePickerProps {
  value?: string
  onChange?: (time: string) => void
  label?: string
  placeholder?: string
  className?: string
  disabled?: boolean
  minTime?: string
  maxTime?: string
  interval?: number // interval in minutes
}

export function TimePicker({
  value,
  onChange,
  label,
  placeholder = "Select time",
  className,
  disabled = false,
  minTime = "00:00",
  maxTime = "23:59",
  interval = 30
}: TimePickerProps) {
  const [selectedTime, setSelectedTime] = React.useState(value || "")
  const [isOpen, setIsOpen] = React.useState(false)

  // Generate time slots based on interval
  const generateTimeSlots = () => {
    const slots = []
    const [minHour, minMinute] = minTime.split(':').map(Number)
    const [maxHour, maxMinute] = maxTime.split(':').map(Number)
    
    const startMinutes = minHour * 60 + minMinute
    const endMinutes = maxHour * 60 + maxMinute
    
    for (let minutes = startMinutes; minutes <= endMinutes; minutes += interval) {
      const hour = Math.floor(minutes / 60)
      const minute = minutes % 60
      const time24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      
      // Format for display (12-hour format)
      const period = hour >= 12 ? 'PM' : 'AM'
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
      const displayTime = `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`
      
      slots.push({ value: time24, display: displayTime })
    }
    
    return slots
  }

  const timeSlots = generateTimeSlots()

  const handleSelect = (time: string) => {
    setSelectedTime(time)
    onChange?.(time)
    setIsOpen(false)
  }

  const getDisplayTime = (time: string) => {
    if (!time) return ""
    const [hour, minute] = time.split(':').map(Number)
    const period = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label>{label}</Label>}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={isOpen}
            disabled={disabled}
            className={cn(
              "w-full justify-between",
              !selectedTime && "text-muted-foreground"
            )}
          >
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {selectedTime ? getDisplayTime(selectedTime) : placeholder}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <ScrollArea className="h-72">
            <div className="p-1">
              {timeSlots.map((slot) => (
                <Button
                  key={slot.value}
                  variant={selectedTime === slot.value ? "default" : "ghost"}
                  className="w-full justify-start font-normal"
                  onClick={() => handleSelect(slot.value)}
                >
                  {slot.display}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  )
}