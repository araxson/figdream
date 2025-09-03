'use client'
import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Button,
  DatePickerWithRange,
  Label,
  Card,
  CardContent
} from '@/components/ui'
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
            <DatePickerWithRange
              date={filters.dateRange}
              onDateChange={handleDateRangeChange}
            />
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