'use client'

import * as React from 'react'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Clock } from 'lucide-react'

interface DurationSliderProps {
  min?: number
  max?: number
  step?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  formatDuration?: (value: number) => string
  className?: string
}

export function DurationSlider({
  min = 15,
  max = 240,
  step = 15,
  defaultValue = 60,
  onValueChange,
  formatDuration = (value) => {
    const hours = Math.floor(value / 60)
    const minutes = value % 60
    if (hours > 0) {
      return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`
    }
    return `${minutes}min`
  },
  className
}: DurationSliderProps) {
  const [value, setValue] = React.useState([defaultValue])

  const handleValueChange = (newValue: number[]) => {
    setValue(newValue)
    onValueChange?.(newValue[0])
  }

  return (
    <div className={className}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Service Duration
          </Label>
          <span className="text-sm font-medium">
            {formatDuration(value[0])}
          </span>
        </div>
        
        <Slider
          min={min}
          max={max}
          step={step}
          value={value}
          onValueChange={handleValueChange}
          className="w-full"
        />
        
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatDuration(min)}</span>
          <span>{formatDuration(max)}</span>
        </div>
      </div>
    </div>
  )
}