'use client'

import { Search, Download, Mail, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type CustomerStatus = 'active' | 'inactive'
type CustomerSegment = 'all' | 'new' | 'regular' | 'vip' | 'at-risk' | 'inactive'
type SortBy = 'name' | 'created' | 'visits' | 'spent'
type SortOrder = 'asc' | 'desc'

interface CustomerFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  statusFilter: CustomerStatus | 'all'
  onStatusFilterChange: (value: CustomerStatus | 'all') => void
  segment: CustomerSegment
  onSegmentChange: (value: CustomerSegment) => void
  sortBy: SortBy
  onSortByChange: (value: SortBy) => void
  sortOrder: SortOrder
  onSortOrderChange: (value: SortOrder) => void
  selectedCount: number
  onBulkOperation: (operation: 'delete' | 'export' | 'email') => void
  onCreateCustomer: () => void
}

export function CustomerFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  segment,
  onSegmentChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  selectedCount,
  onBulkOperation,
  onCreateCustomer
}: CustomerFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Customer Management</CardTitle>
          <div className="flex gap-2">
            {selectedCount > 0 && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onBulkOperation('export')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export ({selectedCount})
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onBulkOperation('email')}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email ({selectedCount})
                </Button>
              </div>
            )}
            <Button onClick={onCreateCustomer}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={onSortByChange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="created">Date Added</SelectItem>
              <SelectItem value="visits">Visit Count</SelectItem>
              <SelectItem value="spent">Total Spent</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </Button>
        </div>

        {/* Segment Tabs */}
        <Tabs value={segment} onValueChange={onSegmentChange}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="new">New</TabsTrigger>
            <TabsTrigger value="regular">Regular</TabsTrigger>
            <TabsTrigger value="vip">VIP</TabsTrigger>
            <TabsTrigger value="at-risk">At Risk</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardContent>
    </Card>
  )
}