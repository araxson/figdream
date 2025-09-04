'use client'
import { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
// DatePickerWithRange needs to be implemented with Calendar and Popover
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Filter, X } from 'lucide-react'
import type { DateRange } from 'react-day-picker'
interface AppointmentsFilterProps {
  onFilterChange: (filters: AppointmentFilters) => void
  onReset: () => void
}
export interface AppointmentFilters {
  status?: string
  dateRange?: DateRange
  staffId?: string
  customerId?: string
}
export function AppointmentsFilter({ onFilterChange, onReset }: AppointmentsFilterProps) {
  const [filters, setFilters] = useState<AppointmentFilters>({})
  const handleStatusChange = (status: string) => {
    const newFilters = { ...filters, status: status === 'all' ? undefined : status }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }
  const handleDateRangeChange = (dateRange?: DateRange) => {
    const newFilters = { ...filters, dateRange }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }
  const handleReset = () => {
    setFilters({})
    onReset()
  }
  return (
    <Card>
      <CardContent className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Label>Filters</Label>
        </div>
        <div className="flex-1 flex flex-wrap gap-4">
          <div className="min-w-[200px]">
            <Select value={filters.status || 'all'} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="no_show">No Show</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="min-w-[280px]">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateRange?.from ? (
                    filters.dateRange.to ? (
                      <>
                        {format(filters.dateRange.from, "LLL dd, y")} -{" "}
                        {format(filters.dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(filters.dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={filters.dateRange}
                  onSelect={handleDateRangeChange}
                  numberOfMonths={2}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        {Object.keys(filters).length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-8"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </CardContent>
    </Card>
  )
}