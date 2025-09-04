'use client'
import * as React from 'react'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { DollarSign } from 'lucide-react'
interface PriceRangeSliderProps {
  min?: number
  max?: number
  step?: number
  defaultValue?: [number, number]
  onValueChange?: (value: [number, number]) => void
  formatCurrency?: (value: number) => string
  className?: string
}
export function PriceRangeSlider({
  min = 0,
  max = 500,
  step = 10,
  defaultValue = [50, 200],
  onValueChange,
  formatCurrency = (value) => `$${value}`,
  className
}: PriceRangeSliderProps) {
  const [value, setValue] = React.useState(defaultValue)
  const handleValueChange = (newValue: number[]) => {
    const typedValue = newValue as [number, number]
    setValue(typedValue)
    onValueChange?.(typedValue)
  }
  return (
    <div className={className}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Price Range
          </Label>
          <span className="text-sm text-muted-foreground">
            {formatCurrency(value[0])} - {formatCurrency(value[1])}
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
          <span>{formatCurrency(min)}</span>
          <span>{formatCurrency(max)}</span>
        </div>
      </div>
    </div>
  )
}