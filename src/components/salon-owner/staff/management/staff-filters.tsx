'use client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, X } from 'lucide-react'
interface StaffFiltersProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  statusFilter: string
  onStatusFilterChange: (status: string) => void
  roleFilter: string
  onRoleFilterChange: (role: string) => void
  onClearFilters: () => void
  hasActiveFilters: boolean
  totalStaff: number
  filteredCount: number
}
export function StaffFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  roleFilter,
  onRoleFilterChange,
  onClearFilters,
  hasActiveFilters,
  totalStaff,
  filteredCount
}: StaffFiltersProps) {
  return (
    <div className="flex flex-col space-y-4">
      {/* Search and Filters Row */}
      <div className="flex flex-wrap gap-4">
        {/* Search */}
        <div className="flex-1 min-w-64">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search staff members..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-40">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        {/* Role Filter */}
        <Select value={roleFilter} onValueChange={onRoleFilterChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="stylist">Stylist</SelectItem>
            <SelectItem value="colorist">Colorist</SelectItem>
            <SelectItem value="barber">Barber</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
          </SelectContent>
        </Select>
        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="outline" onClick={onClearFilters}>
            <X className="mr-2 h-4 w-4" />
            Clear Filters
          </Button>
        )}
      </div>
      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Showing {filteredCount} of {totalStaff} staff members
          </span>
          {hasActiveFilters && (
            <Badge variant="secondary">
              Filtered
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}