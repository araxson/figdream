'use client'

import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search } from 'lucide-react'

interface AuditLogFiltersProps {
  searchTerm: string
  actionFilter: string
  resourceFilter: string
  dateFilter: string
  onSearchChange: (value: string) => void
  onActionFilterChange: (value: string) => void
  onResourceFilterChange: (value: string) => void
  onDateFilterChange: (value: string) => void
}

export function AuditLogFilters({
  searchTerm,
  actionFilter,
  resourceFilter,
  dateFilter,
  onSearchChange,
  onActionFilterChange,
  onResourceFilterChange,
  onDateFilterChange,
}: AuditLogFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search logs..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <Select value={actionFilter} onValueChange={onActionFilterChange}>
        <SelectTrigger className="w-full sm:w-[150px]">
          <SelectValue placeholder="All Actions" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Actions</SelectItem>
          <SelectItem value="create">Create</SelectItem>
          <SelectItem value="update">Update</SelectItem>
          <SelectItem value="delete">Delete</SelectItem>
          <SelectItem value="login">Login</SelectItem>
          <SelectItem value="logout">Logout</SelectItem>
        </SelectContent>
      </Select>
      <Select value={resourceFilter} onValueChange={onResourceFilterChange}>
        <SelectTrigger className="w-full sm:w-[150px]">
          <SelectValue placeholder="All Resources" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Resources</SelectItem>
          <SelectItem value="users">Users</SelectItem>
          <SelectItem value="salons">Salons</SelectItem>
          <SelectItem value="appointments">Appointments</SelectItem>
          <SelectItem value="services">Services</SelectItem>
          <SelectItem value="payments">Payments</SelectItem>
        </SelectContent>
      </Select>
      <Select value={dateFilter} onValueChange={onDateFilterChange}>
        <SelectTrigger className="w-full sm:w-[150px]">
          <SelectValue placeholder="Date Range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="week">Last 7 Days</SelectItem>
          <SelectItem value="month">Last Month</SelectItem>
          <SelectItem value="all">All Time</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}