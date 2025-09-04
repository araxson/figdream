'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  ChevronUp, 
  ChevronDown,
  Download,
  RefreshCw
} from 'lucide-react'
import { EmptyState } from './empty-state'

export interface DataTableColumn<T> {
  key: string
  header: string
  accessor?: (row: T) => React.ReactNode
  sortable?: boolean
  className?: string
  align?: 'left' | 'center' | 'right'
}

export interface DataTableAction<T> {
  label: string
  onClick: (row: T) => void
  icon?: React.ComponentType<{ className?: string }>
  variant?: 'default' | 'destructive'
  separator?: boolean
}

export interface DataTableFilter {
  label: string
  value: string
}

interface DataTableProps<T> {
  data: T[]
  columns: DataTableColumn<T>[]
  actions?: DataTableAction<T>[]
  searchKey?: keyof T | ((row: T) => string)
  searchPlaceholder?: string
  filters?: DataTableFilter[]
  onFilterChange?: (filter: string) => void
  itemsPerPage?: number
  loading?: boolean
  emptyIcon?: React.ComponentType<{ className?: string }>
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: {
    label: string
    onClick?: () => void
    href?: string
  }
  showPagination?: boolean
  showSearch?: boolean
  showFilters?: boolean
  showExport?: boolean
  onExport?: () => void
  showRefresh?: boolean
  onRefresh?: () => void
  className?: string
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  actions,
  searchKey,
  searchPlaceholder = 'Search...',
  filters,
  onFilterChange,
  itemsPerPage = 10,
  loading = false,
  emptyIcon,
  emptyTitle = 'No data found',
  emptyDescription = 'No results match your search criteria',
  emptyAction,
  showPagination = true,
  showSearch = true,
  showFilters = false,
  showExport = false,
  onExport,
  showRefresh = false,
  onRefresh,
  className = ''
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [selectedFilter, setSelectedFilter] = useState('all')

  // Filter data based on search term
  const filteredData = data.filter((row) => {
    if (!searchTerm || !searchKey) return true
    
    const searchValue = typeof searchKey === 'function' 
      ? searchKey(row)
      : String(row[searchKey] || '')
    
    return searchValue.toLowerCase().includes(searchTerm.toLowerCase())
  })

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0
    
    const column = columns.find(col => col.key === sortColumn)
    if (!column) return 0
    
    const aValue = column.accessor ? column.accessor(a) : (a as any)[sortColumn]
    const bValue = column.accessor ? column.accessor(b) : (b as any)[sortColumn]
    
    if (aValue === null || aValue === undefined) return 1
    if (bValue === null || bValue === undefined) return -1
    
    const comparison = String(aValue).localeCompare(String(bValue))
    return sortDirection === 'asc' ? comparison : -comparison
  })

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedData = sortedData.slice(startIndex, endIndex)

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(columnKey)
      setSortDirection('asc')
    }
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const generatePageNumbers = () => {
    const pages: (number | 'ellipsis')[] = []
    const maxVisiblePages = 5
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i)
        pages.push('ellipsis')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('ellipsis')
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i)
      } else {
        pages.push(1)
        pages.push('ellipsis')
        pages.push(currentPage - 1)
        pages.push(currentPage)
        pages.push(currentPage + 1)
        pages.push('ellipsis')
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  if (loading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full max-w-sm" />
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header Controls */}
      {(showSearch || showFilters || showExport || showRefresh) && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-2">
            {showSearch && searchKey && (
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="pl-8"
                />
              </div>
            )}
            
            {showFilters && filters && (
              <Select value={selectedFilter} onValueChange={(value) => {
                setSelectedFilter(value)
                onFilterChange?.(value)
                setCurrentPage(1)
              }}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {filters.map((filter) => (
                    <SelectItem key={filter.value} value={filter.value}>
                      {filter.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {filteredData.length > 0 && (
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of {filteredData.length}
              </div>
            )}
            
            {showExport && onExport && (
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            )}
            
            {showRefresh && onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      {paginatedData.length === 0 ? (
        <EmptyState
          icon={emptyIcon || Search}
          title={emptyTitle}
          description={emptyDescription}
          action={emptyAction}
          variant="card"
        />
      ) : (
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead
                    key={column.key}
                    className={`${column.className || ''} ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : ''}`}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className={`flex items-center gap-1 ${column.sortable ? 'cursor-pointer select-none' : ''} ${column.align === 'center' ? 'justify-center' : column.align === 'right' ? 'justify-end' : ''}`}>
                      {column.header}
                      {column.sortable && sortColumn === column.key && (
                        sortDirection === 'asc' 
                          ? <ChevronUp className="h-4 w-4" />
                          : <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                ))}
                {actions && actions.length > 0 && (
                  <TableHead className="text-right w-[70px]">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((row) => (
                <TableRow key={row.id}>
                  {columns.map((column) => (
                    <TableCell
                      key={column.key}
                      className={`${column.className || ''} ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : ''}`}
                    >
                      {column.accessor 
                        ? column.accessor(row)
                        : (row as any)[column.key]
                      }
                    </TableCell>
                  ))}
                  {actions && actions.length > 0 && (
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {actions.map((action, index) => (
                            <div key={index}>
                              {action.separator && index > 0 && <DropdownMenuSeparator />}
                              <DropdownMenuItem
                                onClick={() => action.onClick(row)}
                                className={action.variant === 'destructive' ? 'text-destructive' : ''}
                              >
                                {action.icon && <action.icon className="mr-2 h-4 w-4" />}
                                {action.label}
                              </DropdownMenuItem>
                            </div>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => handlePageChange(currentPage - 1)}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
            
            {generatePageNumbers().map((page, index) => (
              <PaginationItem key={index}>
                {page === 'ellipsis' ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    onClick={() => handlePageChange(page)}
                    isActive={currentPage === page}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}
            
            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageChange(currentPage + 1)}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}