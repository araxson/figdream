'use client'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem
} from '@/components/ui/dropdown-menu'
import { CalendarPlus, Download, Filter, MoreVertical, Plus, Clock } from 'lucide-react'
import { useState } from 'react'
import { DateRange } from 'react-day-picker'
import { addDays } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface AppointmentFilters {
  confirmed: boolean
  pending: boolean
  cancelled: boolean
}

interface AppointmentHeaderProps {
  userRole: 'super_admin' | 'salon_owner' | 'salon_manager' | 'staff' | 'customer'
  title?: string
  description?: string
  showFilters?: boolean
  showDateRange?: boolean
  showActions?: boolean
  onFiltersChange?: (filters: AppointmentFilters) => void
  onDateRangeChange?: (dateRange: DateRange | undefined) => void
}

export function AppointmentHeader({
  userRole,
  title,
  description,
  showFilters = false,
  showDateRange = false,
  showActions = true,
  onFiltersChange,
  onDateRangeChange
}: AppointmentHeaderProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 7)
  })
  const [filters, setFilters] = useState({
    confirmed: true,
    pending: true,
    cancelled: false
  })

  const handleDateRangeChange = (newDateRange: DateRange | undefined) => {
    setDateRange(newDateRange)
    onDateRangeChange?.(newDateRange)
  }

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
    onFiltersChange?.(newFilters)
  }

  // Role-based defaults
  const getDefaultTitle = () => {
    switch (userRole) {
      case 'customer':
        return 'My Appointments'
      case 'staff':
        return 'My Appointments'
      case 'salon_owner':
      case 'super_admin':
        return 'Appointments'
      default:
        return 'Appointments'
    }
  }

  const getDefaultDescription = () => {
    switch (userRole) {
      case 'customer':
        return 'View and manage your upcoming and past appointments'
      case 'staff':
        return 'Manage your client appointments and schedule'
      case 'salon_owner':
        return 'View and manage all salon appointments'
      case 'super_admin':
        return 'View and manage all appointments across the platform'
      default:
        return 'Manage appointments'
    }
  }

  const getActionButtons = () => {
    if (!showActions) return null

    switch (userRole) {
      case 'customer':
        return (
          <Button asChild>
            <Link href="/customer/booking">
              <Plus className="mr-2 h-4 w-4" />
              Book New
            </Link>
          </Button>
        )
      case 'staff':
        return (
          <div className="flex gap-2">
            <Button variant="outline">
              <Clock className="mr-2 h-4 w-4" />
              Break Time
            </Button>
            <Button>
              <CalendarPlus className="mr-2 h-4 w-4" />
              Book Appointment
            </Button>
          </div>
        )
      case 'salon_owner':
      case 'super_admin':
        return (
          <Button>
            <CalendarPlus className="mr-2 h-4 w-4" />
            New Appointment
          </Button>
        )
      default:
        return null
    }
  }

  const canUseAdvancedFilters = ['salon_owner', 'super_admin'].includes(userRole)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {title || getDefaultTitle()}
          </h1>
          <p className="text-muted-foreground">
            {description || getDefaultDescription()}
          </p>
        </div>
        
        <div className="flex gap-2">
          {/* Date Range Picker - for owners/admins */}
          {showDateRange && canUseAdvancedFilters && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  {dateRange?.from ? (
                    <>
                      {dateRange.from.toLocaleDateString()} - {dateRange.to?.toLocaleDateString()}
                    </>
                  ) : (
                    "Select dates"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={handleDateRangeChange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          )}
          
          {/* Status Filters - for owners/admins */}
          {showFilters && canUseAdvancedFilters && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={filters.confirmed}
                  onCheckedChange={(checked) => 
                    handleFiltersChange({ ...filters, confirmed: checked })
                  }
                >
                  Confirmed
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.pending}
                  onCheckedChange={(checked) => 
                    handleFiltersChange({ ...filters, pending: checked })
                  }
                >
                  Pending
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.cancelled}
                  onCheckedChange={(checked) => 
                    handleFiltersChange({ ...filters, cancelled: checked })
                  }
                >
                  Cancelled
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Export Options - for owners/admins */}
          {canUseAdvancedFilters && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Download className="mr-2 h-4 w-4" />
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="mr-2 h-4 w-4" />
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Print Schedule</DropdownMenuItem>
                <DropdownMenuItem>Email Report</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          {getActionButtons()}
        </div>
      </div>
      
      {/* Active Filters Display */}
      {showFilters && canUseAdvancedFilters && (
        <div className="flex items-center gap-2">
          {Object.entries(filters).filter(([, value]) => value).map(([key]) => (
            <Badge key={key} variant="secondary">
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </Badge>
          ))}
          {showDateRange && dateRange?.from && (
            <Badge variant="outline">
              {dateRange.from.toLocaleDateString()} - {dateRange.to?.toLocaleDateString()}
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}