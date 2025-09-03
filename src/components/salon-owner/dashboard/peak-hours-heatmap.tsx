'use client'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui'
interface PeakHoursHeatmapProps {
  hourlyData: number[]
}
export default function PeakHoursHeatmap({ hourlyData }: PeakHoursHeatmapProps) {
  const maxBookings = Math.max(...hourlyData)
  const getIntensity = (value: number) => {
    if (maxBookings === 0) return 0
    return Math.round((value / maxBookings) * 100)
  }
  const getColorClass = (intensity: number) => {
    if (intensity === 0) return 'bg-muted'
    if (intensity < 20) return 'bg-blue-100'
    if (intensity < 40) return 'bg-blue-200'
    if (intensity < 60) return 'bg-blue-300'
    if (intensity < 80) return 'bg-blue-400'
    return 'bg-blue-500'
  }
  const hours = Array.from({ length: 24 }, (_, i) => {
    const hour = i === 0 ? 12 : i > 12 ? i - 12 : i
    const period = i < 12 ? 'AM' : 'PM'
    return `${hour}${period}`
  })
  return (
    <TooltipProvider>
      <div className="space-y-4">
      <div className="grid grid-cols-12 gap-1">
        {hourlyData.map((bookings, index) => {
          const intensity = getIntensity(bookings)
          return (
            <Tooltip key={index}>
              <TooltipTrigger>
                <div
                  className={`aspect-square rounded ${getColorClass(intensity)}`}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>{hours[index]}: {bookings} bookings</p>
              </TooltipContent>
            </Tooltip>
          )
        })}
      </div>
      {/* Hour labels */}
      <div className="grid grid-cols-12 gap-1 text-xs text-muted-foreground">
        {hours.filter((_, i) => i % 2 === 0).map((hour, index) => (
          <div key={index} className="col-span-2 text-center">
            {hour}
          </div>
        ))}
      </div>
      {/* Legend */}
      <div className="flex items-center gap-4 text-xs">
        <span className="text-muted-foreground">Less busy</span>
        <div className="flex gap-1">
          <div className="h-4 w-4 bg-blue-100 rounded" />
          <div className="h-4 w-4 bg-blue-200 rounded" />
          <div className="h-4 w-4 bg-blue-300 rounded" />
          <div className="h-4 w-4 bg-blue-400 rounded" />
          <div className="h-4 w-4 bg-blue-500 rounded" />
        </div>
        <span className="text-muted-foreground">More busy</span>
      </div>
      </div>
    </TooltipProvider>
  )
}