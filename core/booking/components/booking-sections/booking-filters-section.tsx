'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Filter, RefreshCw } from 'lucide-react'
import type { BookingFiltersSectionProps } from '../booking-utils/booking-manager-types'
import type { BookingStatus } from '../../types'
import { getDateRangeFilter } from '../booking-utils/booking-manager-helpers'

export function BookingFiltersSection({
  filters,
  searchTerm,
  showFilters,
  viewMode,
  loading,
  onFiltersChange,
  onSearchChange,
  onShowFiltersToggle,
  onViewModeChange,
  onRefresh
}: BookingFiltersSectionProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by name, confirmation code, or service..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onShowFiltersToggle}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
              {Object.keys(filters).length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {Object.keys(filters).length}
                </Badge>
              )}
            </Button>
            <Select value={viewMode} onValueChange={(v: any) => onViewModeChange(v)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="list">List View</SelectItem>
                <SelectItem value="grid">Grid View</SelectItem>
                <SelectItem value="calendar">Calendar</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={onRefresh}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {showFilters && (
          <>
            <Separator className="my-4" />
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <Label>Status</Label>
                <Select
                  value={filters.status?.[0] || 'all'}
                  onValueChange={(value) => onFiltersChange({
                    ...filters,
                    status: value === 'all' ? undefined : [value as BookingStatus]
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="checked_in">Checked In</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="no_show">No Show</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Date Range</Label>
                <Select
                  onValueChange={(value) => {
                    const dateRange = getDateRangeFilter(value)
                    onFiltersChange({
                      ...filters,
                      dateRange: value === 'all' ? undefined : dateRange
                    })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Dates</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="tomorrow">Tomorrow</SelectItem>
                    <SelectItem value="week">Next 7 Days</SelectItem>
                    <SelectItem value="month">Next 30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Staff Member</Label>
                <Select
                  value={filters.staffId || 'all'}
                  onValueChange={(value) => onFiltersChange({
                    ...filters,
                    staffId: value === 'all' ? undefined : value
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Staff</SelectItem>
                    <SelectItem value="staff1">Sarah Johnson</SelectItem>
                    <SelectItem value="staff2">Mike Chen</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    onFiltersChange({})
                    onSearchChange('')
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}