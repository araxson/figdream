'use client'

import { useState } from 'react'
import { DateRangePicker } from '@/components/shared/date-range-picker'
import { DateRange } from 'react-day-picker'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  Button, 
  Label, 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  ToggleGroup, 
  ToggleGroupItem,
  Drawer, 
  DrawerContent, 
  DrawerDescription, 
  DrawerHeader, 
  DrawerTitle, 
  DrawerTrigger,
  DrawerFooter,
  DrawerClose 
} from '@/components/ui'
import { Filter, Download, RefreshCw } from 'lucide-react'

export function AppointmentsFilter() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [status, setStatus] = useState<string>('all')
  const [staff, setStaff] = useState<string>('all')

  const handleFilter = () => {
    // In a real app, this would trigger a data fetch with the filters
    console.log('Filtering appointments:', { dateRange, status, staff })
  }

  const handleExport = () => {
    // In a real app, this would export the filtered data
    console.log('Exporting appointments')
  }

  const handleReset = () => {
    setDateRange(undefined)
    setStatus('all')
    setStaff('all')
  }

  const FilterContent = () => (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
        <div className="space-y-2">
          <Label>Date Range</Label>
          <DateRangePicker 
            onDateChange={setDateRange}
            placeholder="Select date range"
          />
        </div>
        
        <div className="space-y-3 col-span-2">
          <Label>Status Filter</Label>
          <ToggleGroup type="single" value={status} onValueChange={(value) => setStatus(value || 'all')} className="grid grid-cols-3 lg:grid-cols-6 gap-1">
            <ToggleGroupItem value="all" className="text-xs">All</ToggleGroupItem>
            <ToggleGroupItem value="pending" className="text-xs">Pending</ToggleGroupItem>
            <ToggleGroupItem value="confirmed" className="text-xs">Confirmed</ToggleGroupItem>
            <ToggleGroupItem value="in_progress" className="text-xs">In Progress</ToggleGroupItem>
            <ToggleGroupItem value="completed" className="text-xs">Completed</ToggleGroupItem>
            <ToggleGroupItem value="cancelled" className="text-xs">Cancelled</ToggleGroupItem>
            <ToggleGroupItem value="no_show" className="text-xs">No Show</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 items-end">
        <div className="space-y-2 flex-1">
          <Label>Staff Member</Label>
          <Select value={staff} onValueChange={setStaff}>
            <SelectTrigger>
              <SelectValue placeholder="All staff" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Staff</SelectItem>
              <SelectItem value="staff1">John Doe</SelectItem>
              <SelectItem value="staff2">Jane Smith</SelectItem>
              <SelectItem value="staff3">Mike Johnson</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={handleFilter}>
            <Filter className="mr-2 h-4 w-4" />
            Apply Filters
          </Button>
          <Button onClick={handleReset} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button onClick={handleExport} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Results
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Filter Card */}
      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle>Filter Appointments</CardTitle>
          <CardDescription>
            Use filters to narrow down your appointment list
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FilterContent />
        </CardContent>
      </Card>

      {/* Mobile Filter Drawer */}
      <div className="md:hidden flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Appointments</h3>
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter & Export
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Filter Appointments</DrawerTitle>
              <DrawerDescription>
                Apply filters to narrow down your appointment list
              </DrawerDescription>
            </DrawerHeader>
            <div className="p-4">
              <FilterContent />
            </div>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="outline" className="w-full">
                  Close
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    </>
  )
}