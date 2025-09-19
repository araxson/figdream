'use client'

import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  DollarSign,
  Scissors,
  Filter,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  X,
  CheckCircle,
  AlertCircle,
  Download,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
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
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { AppointmentWithRelations, AppointmentStatus, PaymentStatus } from '../types'

interface AppointmentListEnhancedProps {
  appointments: AppointmentWithRelations[]
  loading?: boolean
  onAppointmentClick?: (appointment: AppointmentWithRelations) => void
  onAppointmentEdit?: (appointment: AppointmentWithRelations) => void
  onAppointmentCancel?: (appointment: AppointmentWithRelations) => void
  onAppointmentCheckIn?: (appointment: AppointmentWithRelations) => void
  onAppointmentComplete?: (appointment: AppointmentWithRelations) => void
  onBulkAction?: (action: string, appointmentIds: string[]) => void
  onExport?: () => void
  showFilters?: boolean
  showBulkActions?: boolean
  viewMode?: 'table' | 'cards'
}

const statusConfig: Record<AppointmentStatus, { label: string; icon: React.ReactNode; color: string; variant: any }> = {
  pending: { label: 'Pending', icon: <Clock className="h-3 w-3" />, color: 'text-yellow-600', variant: 'outline' },
  confirmed: { label: 'Confirmed', icon: <CheckCircle className="h-3 w-3" />, color: 'text-blue-600', variant: 'default' },
  completed: { label: 'Completed', icon: <CheckCircle className="h-3 w-3" />, color: 'text-green-600', variant: 'success' },
  cancelled: { label: 'Cancelled', icon: <X className="h-3 w-3" />, color: 'text-gray-600', variant: 'secondary' },
  no_show: { label: 'No Show', icon: <AlertCircle className="h-3 w-3" />, color: 'text-red-600', variant: 'destructive' },
  rescheduled: { label: 'Rescheduled', icon: <Calendar className="h-3 w-3" />, color: 'text-orange-600', variant: 'outline' },
}

const paymentStatusConfig: Record<PaymentStatus, { label: string; variant: any }> = {
  pending: { label: 'Pending', variant: 'outline' },
  processing: { label: 'Processing', variant: 'secondary' },
  completed: { label: 'Paid', variant: 'success' },
  failed: { label: 'Failed', variant: 'destructive' },
  refunded: { label: 'Refunded', variant: 'secondary' },
  partially_refunded: { label: 'Partial Refund', variant: 'secondary' },
  cancelled: { label: 'Cancelled', variant: 'secondary' },
}

type SortField = 'date' | 'customer' | 'staff' | 'status' | 'amount'
type SortOrder = 'asc' | 'desc'

export function AppointmentListEnhanced({
  appointments,
  loading = false,
  onAppointmentClick,
  onAppointmentEdit,
  onAppointmentCancel,
  onAppointmentCheckIn,
  onAppointmentComplete,
  onBulkAction,
  onExport,
  showFilters = true,
  showBulkActions = true,
  viewMode = 'table',
}: AppointmentListEnhancedProps) {
  const [selectedAppointments, setSelectedAppointments] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all')
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | 'all'>('all')
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(['checkbox', 'customer', 'service', 'datetime', 'staff', 'status', 'payment', 'amount', 'actions'])
  )

  // Filter and sort appointments
  const filteredAppointments = useMemo(() => {
    let filtered = [...appointments]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(apt =>
        apt.customer?.first_name?.toLowerCase().includes(query) ||
        apt.customer?.last_name?.toLowerCase().includes(query) ||
        apt.customer?.email?.toLowerCase().includes(query) ||
        apt.confirmation_code?.toLowerCase().includes(query) ||
        apt.services?.some(s => s.service_name.toLowerCase().includes(query))
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(apt => apt.status === statusFilter)
    }

    // Payment filter
    if (paymentFilter !== 'all') {
      filtered = filtered.filter(apt => apt.payment_status === paymentFilter)
    }

    // Sort
    filtered.sort((a, b) => {
      let compareValue = 0

      switch (sortField) {
        case 'date':
          compareValue = new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
          break
        case 'customer':
          compareValue = (a.customer?.last_name || '').localeCompare(b.customer?.last_name || '')
          break
        case 'staff':
          compareValue = (a.staff?.last_name || '').localeCompare(b.staff?.last_name || '')
          break
        case 'status':
          compareValue = (a.status || '').localeCompare(b.status || '')
          break
        case 'amount':
          compareValue = (a.total_amount || 0) - (b.total_amount || 0)
          break
      }

      return sortOrder === 'asc' ? compareValue : -compareValue
    })

    return filtered
  }, [appointments, searchQuery, statusFilter, paymentFilter, sortField, sortOrder])

  // Toggle appointment selection
  const toggleAppointmentSelection = (id: string) => {
    const newSelection = new Set(selectedAppointments)
    if (newSelection.has(id)) {
      newSelection.delete(id)
    } else {
      newSelection.add(id)
    }
    setSelectedAppointments(newSelection)
  }

  // Toggle all appointments selection
  const toggleAllAppointments = () => {
    if (selectedAppointments.size === filteredAppointments.length) {
      setSelectedAppointments(new Set())
    } else {
      setSelectedAppointments(new Set(filteredAppointments.map(apt => apt.id)))
    }
  }

  // Toggle row expansion
  const toggleRowExpansion = (id: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedRows(newExpanded)
  }

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  // Handle bulk actions
  const handleBulkAction = (action: string) => {
    if (selectedAppointments.size === 0) return
    onBulkAction?.(action, Array.from(selectedAppointments))
    setSelectedAppointments(new Set())
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Appointments</CardTitle>
            <CardDescription>
              {filteredAppointments.length} appointment{filteredAppointments.length !== 1 && 's'} found
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {onExport && (
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Visible Columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {['customer', 'service', 'datetime', 'staff', 'status', 'payment', 'amount'].map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column}
                    checked={visibleColumns.has(column)}
                    onCheckedChange={(checked) => {
                      const newColumns = new Set(visibleColumns)
                      if (checked) {
                        newColumns.add(column)
                      } else {
                        newColumns.delete(column)
                      }
                      setVisibleColumns(newColumns)
                    }}
                  >
                    {column.charAt(0).toUpperCase() + column.slice(1)}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {showFilters && (
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search appointments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {Object.entries(statusConfig).map(([value, config]) => (
                  <SelectItem key={value} value={value}>
                    <div className="flex items-center gap-2">
                      {config.icon}
                      {config.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={paymentFilter} onValueChange={(v) => setPaymentFilter(v as any)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Payments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                {Object.entries(paymentStatusConfig).map(([value, config]) => (
                  <SelectItem key={value} value={value}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {showBulkActions && selectedAppointments.size > 0 && (
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg mb-4">
            <span className="text-sm font-medium">
              {selectedAppointments.size} selected
            </span>
            <div className="flex gap-2 ml-auto">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction('confirm')}
              >
                Confirm All
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction('reschedule')}
              >
                Reschedule All
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleBulkAction('cancel')}
              >
                Cancel All
              </Button>
            </div>
          </div>
        )}

        <ScrollArea className="w-full">
          <Table>
            <TableHeader>
              <TableRow>
                {showBulkActions && visibleColumns.has('checkbox') && (
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedAppointments.size === filteredAppointments.length && filteredAppointments.length > 0}
                      indeterminate={selectedAppointments.size > 0 && selectedAppointments.size < filteredAppointments.length}
                      onCheckedChange={toggleAllAppointments}
                    />
                  </TableHead>
                )}
                {visibleColumns.has('customer') && (
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-3 h-8 data-[state=open]:bg-accent"
                      onClick={() => handleSort('customer')}
                    >
                      Customer
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                )}
                {visibleColumns.has('service') && (
                  <TableHead>Service</TableHead>
                )}
                {visibleColumns.has('datetime') && (
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-3 h-8 data-[state=open]:bg-accent"
                      onClick={() => handleSort('date')}
                    >
                      Date & Time
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                )}
                {visibleColumns.has('staff') && (
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-3 h-8 data-[state=open]:bg-accent"
                      onClick={() => handleSort('staff')}
                    >
                      Staff
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                )}
                {visibleColumns.has('status') && (
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-3 h-8 data-[state=open]:bg-accent"
                      onClick={() => handleSort('status')}
                    >
                      Status
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                )}
                {visibleColumns.has('payment') && (
                  <TableHead>Payment</TableHead>
                )}
                {visibleColumns.has('amount') && (
                  <TableHead className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-3 h-8 data-[state=open]:bg-accent"
                      onClick={() => handleSort('amount')}
                    >
                      Amount
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                )}
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAppointments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Calendar className="h-12 w-12" />
                      <p>No appointments found</p>
                      <p className="text-sm">Try adjusting your filters</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAppointments.map((appointment) => {
                  const isExpanded = expandedRows.has(appointment.id)
                  const isSelected = selectedAppointments.has(appointment.id)
                  const status = statusConfig[appointment.status as AppointmentStatus]
                  const paymentStatus = paymentStatusConfig[appointment.payment_status as PaymentStatus]
                  const startTime = new Date(appointment.start_time)
                  const endTime = new Date(appointment.end_time)

                  return (
                    <>
                      <TableRow
                        key={appointment.id}
                        className={cn(
                          "cursor-pointer",
                          isSelected && "bg-muted/50"
                        )}
                        onClick={() => onAppointmentClick?.(appointment)}
                      >
                        {showBulkActions && visibleColumns.has('checkbox') && (
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleAppointmentSelection(appointment.id)}
                            />
                          </TableCell>
                        )}
                        {visibleColumns.has('customer') && (
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={appointment.customer?.avatar_url || undefined} />
                                <AvatarFallback>
                                  {appointment.customer?.first_name?.[0]}
                                  {appointment.customer?.last_name?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">
                                  {appointment.customer?.first_name} {appointment.customer?.last_name}
                                </p>
                                {appointment.customer?.email && (
                                  <p className="text-xs text-muted-foreground">
                                    {appointment.customer?.email}
                                  </p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                        )}
                        {visibleColumns.has('service') && (
                          <TableCell>
                            {appointment.services && appointment.services.length > 0 ? (
                              <div>
                                <p className="font-medium text-sm">
                                  {appointment.services[0].service_name}
                                </p>
                                {appointment.services.length > 1 && (
                                  <p className="text-xs text-muted-foreground">
                                    +{appointment.services.length - 1} more
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                        )}
                        {visibleColumns.has('datetime') && (
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium text-sm">
                                  {format(startTime, 'MMM d, yyyy')}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                        )}
                        {visibleColumns.has('staff') && (
                          <TableCell>
                            {appointment.staff ? (
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={appointment.staff.avatar_url || undefined} />
                                  <AvatarFallback>
                                    {appointment.staff.first_name?.[0]}
                                    {appointment.staff.last_name?.[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm">
                                  {appointment.staff.first_name} {appointment.staff.last_name?.[0]}.
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                        )}
                        {visibleColumns.has('status') && (
                          <TableCell>
                            <Badge variant={status.variant} className="gap-1">
                              {status.icon}
                              {status.label}
                            </Badge>
                          </TableCell>
                        )}
                        {visibleColumns.has('payment') && (
                          <TableCell>
                            <Badge variant={paymentStatus.variant}>
                              {paymentStatus.label}
                            </Badge>
                          </TableCell>
                        )}
                        {visibleColumns.has('amount') && (
                          <TableCell className="text-right font-medium">
                            ${appointment.total_amount?.toFixed(2) || '0.00'}
                          </TableCell>
                        )}
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => onAppointmentClick?.(appointment)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onAppointmentEdit?.(appointment)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              {appointment.status === 'confirmed' && (
                                <DropdownMenuItem onClick={() => onAppointmentCheckIn?.(appointment)}>
                                  <User className="mr-2 h-4 w-4" />
                                  Check In
                                </DropdownMenuItem>
                              )}
                              {(appointment.status === 'confirmed' || appointment.status === 'checked_in') && (
                                <DropdownMenuItem onClick={() => onAppointmentComplete?.(appointment)}>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Mark Complete
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => onAppointmentCancel?.(appointment)}
                              >
                                <X className="mr-2 h-4 w-4" />
                                Cancel
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                      {isExpanded && (
                        <TableRow>
                          <TableCell colSpan={10} className="p-0">
                            <div className="p-4 bg-muted/50">
                              <div className="grid gap-4 md:grid-cols-3">
                                <div>
                                  <p className="text-sm font-medium mb-1">Contact Information</p>
                                  <div className="space-y-1">
                                    {appointment.customer?.phone && (
                                      <div className="flex items-center gap-2 text-sm">
                                        <Phone className="h-3 w-3" />
                                        {appointment.customer.phone}
                                      </div>
                                    )}
                                    {appointment.customer?.email && (
                                      <div className="flex items-center gap-2 text-sm">
                                        <Mail className="h-3 w-3" />
                                        {appointment.customer.email}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                {appointment.notes && (
                                  <div>
                                    <p className="text-sm font-medium mb-1">Notes</p>
                                    <p className="text-sm text-muted-foreground">
                                      {appointment.notes}
                                    </p>
                                  </div>
                                )}
                                {appointment.confirmation_code && (
                                  <div>
                                    <p className="text-sm font-medium mb-1">Confirmation Code</p>
                                    <Badge variant="secondary">
                                      #{appointment.confirmation_code}
                                    </Badge>
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  )
                })
              )}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  )
}