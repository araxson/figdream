"use client"
import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui"
import { DatePickerWithRange } from "@/components/ui"
import { Button } from "@/components/ui"
import { Label } from "@/components/ui"
import { DateRange } from "react-day-picker"
import { Filter, RotateCcw } from "lucide-react"
interface AppointmentFiltersProps {
  onFilterChange: (filters: {
    dateRange: DateRange | undefined
    status: string
    staffId: string
  }) => void
  staffMembers?: { id: string; name: string }[]
}
export function AppointmentFilters({ onFilterChange, staffMembers = [] }: AppointmentFiltersProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [status, setStatus] = useState<string>("all")
  const [staffId, setStaffId] = useState<string>("all")
  const handleApplyFilters = () => {
    onFilterChange({
      dateRange,
      status,
      staffId
    })
  }
  const handleReset = () => {
    setDateRange(undefined)
    setStatus("all")
    setStaffId("all")
    onFilterChange({
      dateRange: undefined,
      status: "all",
      staffId: "all"
    })
  }
  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4" />
        <h3 className="font-medium">Filter Appointments</h3>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <div className="space-y-2">
          <Label>Date Range</Label>
          <DatePickerWithRange
            date={dateRange}
            onDateChange={setDateRange}
          />
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="no_show">No Show</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Staff Member</Label>
          <Select value={staffId} onValueChange={setStaffId}>
            <SelectTrigger>
              <SelectValue placeholder="All staff" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Staff</SelectItem>
              {staffMembers.map((staff) => (
                <SelectItem key={staff.id} value={staff.id}>
                  {staff.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end gap-2">
          <Button onClick={handleApplyFilters} className="flex-1">
            Apply Filters
          </Button>
          <Button onClick={handleReset} variant="outline" size="icon">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}