'use client'

import { ArrowUpDown, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { TableHead, TableHeader, TableRow } from '@/components/ui/table'

type SortField = 'date' | 'customer' | 'staff' | 'status' | 'amount'
type SortOrder = 'asc' | 'desc'

interface AppointmentTableHeaderProps {
  visibleColumns: Set<string>
  sortField: SortField
  sortOrder: SortOrder
  onSort: (field: SortField) => void
  allSelected: boolean
  onToggleAll: () => void
  showBulkActions: boolean
}

interface ColumnConfig {
  id: string
  label: string
  sortField?: SortField
  className?: string
}

const COLUMNS: ColumnConfig[] = [
  { id: 'checkbox', label: '', className: 'w-12' },
  { id: 'customer', label: 'Customer', sortField: 'customer' },
  { id: 'service', label: 'Service' },
  { id: 'datetime', label: 'Date & Time', sortField: 'date' },
  { id: 'staff', label: 'Staff', sortField: 'staff' },
  { id: 'status', label: 'Status', sortField: 'status' },
  { id: 'payment', label: 'Payment' },
  { id: 'amount', label: 'Amount', sortField: 'amount', className: 'text-right' },
  { id: 'actions', label: '', className: 'w-20' },
]

export function AppointmentTableHeader({
  visibleColumns,
  sortField,
  sortOrder,
  onSort,
  allSelected,
  onToggleAll,
  showBulkActions,
}: AppointmentTableHeaderProps) {
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-1 h-3 w-3" />
    }
    return sortOrder === 'asc'
      ? <ChevronUp className="ml-1 h-3 w-3" />
      : <ChevronDown className="ml-1 h-3 w-3" />
  }

  const renderSortableHeader = (column: ColumnConfig) => {
    if (!column.sortField) {
      return <span>{column.label}</span>
    }

    return (
      <Button
        variant="ghost"
        size="sm"
        className="h-auto p-0 font-semibold"
        onClick={() => onSort(column.sortField!)}
      >
        {column.label}
        {getSortIcon(column.sortField)}
      </Button>
    )
  }

  return (
    <TableHeader>
      <TableRow>
        {COLUMNS.filter(col => visibleColumns.has(col.id)).map((column) => (
          <TableHead key={column.id} className={column.className}>
            {column.id === 'checkbox' && showBulkActions ? (
              <Checkbox
                checked={allSelected}
                onCheckedChange={onToggleAll}
                aria-label="Select all appointments"
              />
            ) : (
              renderSortableHeader(column)
            )}
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  )
}