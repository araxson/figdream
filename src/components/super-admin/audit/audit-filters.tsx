'use client'

import { useState } from 'react'
import {
  Button,
  Calendar,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui'
import { CalendarIcon, Filter, X } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { useRouter, useSearchParams } from 'next/navigation'
import { AUDIT_ACTIONS, ENTITY_TYPES } from '@/lib/data-access/audit-logs'

interface AuditFiltersProps {
  initialFilters: {
    action?: string
    entity?: string
    startDate?: string
    endDate?: string
  }
}

export function AuditFilters({ initialFilters }: AuditFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [filters, setFilters] = useState(initialFilters)
  const [startDate, setStartDate] = useState<Date | undefined>(
    initialFilters.startDate ? new Date(initialFilters.startDate) : undefined
  )
  const [endDate, setEndDate] = useState<Date | undefined>(
    initialFilters.endDate ? new Date(initialFilters.endDate) : undefined
  )

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams)
    
    // Clear existing filters
    params.delete('action')
    params.delete('entity')
    params.delete('startDate')
    params.delete('endDate')
    
    // Apply new filters
    if (filters.action) params.set('action', filters.action)
    if (filters.entity) params.set('entity', filters.entity)
    if (startDate) params.set('startDate', format(startDate, 'yyyy-MM-dd'))
    if (endDate) params.set('endDate', format(endDate, 'yyyy-MM-dd'))
    
    router.push(`/super-admin/audit?${params.toString()}`)
  }

  const clearFilters = () => {
    setFilters({})
    setStartDate(undefined)
    setEndDate(undefined)
    router.push('/super-admin/audit')
  }

  const hasFilters = filters.action || filters.entity || startDate || endDate

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        {/* Action Filter */}
        <div className="flex-1 min-w-[200px]">
          <Select
            value={filters.action || ''}
            onValueChange={(value) => setFilters({ ...filters, action: value || undefined })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Actions</SelectItem>
              {Object.entries(AUDIT_ACTIONS).map(([key, value]) => (
                <SelectItem key={value} value={value}>
                  {key.replace(/_/g, ' ').toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Entity Filter */}
        <div className="flex-1 min-w-[200px]">
          <Select
            value={filters.entity || ''}
            onValueChange={(value) => setFilters({ ...filters, entity: value || undefined })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by entity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Entities</SelectItem>
              {Object.entries(ENTITY_TYPES).map(([key, value]) => (
                <SelectItem key={value} value={value}>
                  {key.replace(/_/g, ' ').toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Start Date */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'justify-start text-left font-normal',
                !startDate && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? format(startDate, 'PP') : 'Start date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={setStartDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* End Date */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'justify-start text-left font-normal',
                !endDate && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDate ? format(endDate, 'PP') : 'End date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={setEndDate}
              disabled={(date) => startDate ? date < startDate : false}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Apply Button */}
        <Button onClick={applyFilters}>
          <Filter className="mr-2 h-4 w-4" />
          Apply Filters
        </Button>

        {/* Clear Button */}
        {hasFilters && (
          <Button variant="ghost" onClick={clearFilters}>
            <X className="mr-2 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.action && (
            <Badge variant="secondary">
              Action: {filters.action}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilters({ ...filters, action: undefined })}
                className="ml-2 h-auto p-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {filters.entity && (
            <Badge variant="secondary">
              Entity: {filters.entity}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilters({ ...filters, entity: undefined })}
                className="ml-2 h-auto p-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {startDate && (
            <Badge variant="secondary">
              From: {format(startDate, 'PP')}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStartDate(undefined)}
                className="ml-2 h-auto p-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {endDate && (
            <Badge variant="secondary">
              To: {format(endDate, 'PP')}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEndDate(undefined)}
                className="ml-2 h-auto p-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}