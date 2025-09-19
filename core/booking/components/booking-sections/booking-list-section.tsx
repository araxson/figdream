'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  CalendarIcon,
  Clock,
  User,
  MoreHorizontal,
  Edit,
  XCircle,
  CheckCircle,
  UserCheck,
  UserX,
  MessageSquare,
  Mail,
  FileText,
  Printer,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import type { BookingListSectionProps } from '../booking-utils/booking-manager-types'
import type { BookingListItem } from '../../types'
import { getStatusVariant, formatDateTime } from '../booking-utils/booking-manager-helpers'

export function BookingListSection({
  bookings,
  loading,
  viewMode,
  searchTerm,
  filters,
  onBookingSelect,
  onNewBooking,
  handlers,
  currentPage,
  totalPages,
  onPageChange
}: BookingListSectionProps & { currentPage: number, totalPages: number, onPageChange: (page: number) => void }) {
  const renderBookingRow = (booking: BookingListItem) => {
    const { date, time, day } = formatDateTime(booking.start_time!)
    const isPast = new Date(booking.start_time!) < new Date()

    return (
      <TableRow key={booking.id} className="cursor-pointer" onClick={() => onBookingSelect?.(booking.id!)}>
        <TableCell>
          <div className="flex items-center gap-2">
            <div>
              <p className="font-medium">{booking.customerName}</p>
              <p className="text-xs text-muted-foreground">{booking.confirmation_code}</p>
            </div>
          </div>
        </TableCell>
        <TableCell>
          <div>
            <p className="text-sm">{date}</p>
            <p className="text-xs text-muted-foreground">{day}, {time}</p>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs">
                {booking.staffName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm">{booking.staffName}</span>
          </div>
        </TableCell>
        <TableCell>
          <div>
            {booking.services.slice(0, 2).map((service, i) => (
              <p key={i} className="text-sm">{service}</p>
            ))}
            {booking.services.length > 2 && (
              <p className="text-xs text-muted-foreground">
                +{booking.services.length - 2} more
              </p>
            )}
          </div>
        </TableCell>
        <TableCell>
          <Badge variant={getStatusVariant(booking.status!)}>
            {booking.status}
          </Badge>
        </TableCell>
        <TableCell>
          <div>
            <p className="font-medium">${booking.total_amount?.toFixed(2)}</p>
            <Badge variant={booking.payment_status === 'paid' ? 'outline' : 'secondary'} className="text-xs">
              {booking.payment_status}
            </Badge>
          </div>
        </TableCell>
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {booking.status === 'confirmed' && !isPast && (
                <>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handlers.handleCheckIn(booking.id!) }}>
                    <UserCheck className="mr-2 h-4 w-4" />
                    Check In
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handlers.handleReschedule(booking.id!) }}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    Reschedule
                  </DropdownMenuItem>
                </>
              )}
              {booking.status === 'checked_in' && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handlers.handleComplete(booking.id!) }}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Complete
                </DropdownMenuItem>
              )}
              {booking.canCancel && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handlers.handleCancel(booking.id!) }} className="text-destructive">
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancel
                </DropdownMenuItem>
              )}
              {booking.status === 'confirmed' && isPast && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handlers.handleMarkNoShow(booking.id!) }} className="text-destructive">
                  <UserX className="mr-2 h-4 w-4" />
                  Mark No-Show
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handlers.handleAddNotes(booking.id!) }}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Add Notes
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Mail className="mr-2 h-4 w-4" />
                Send Reminder
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileText className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Printer className="mr-2 h-4 w-4" />
                Print
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    )
  }

  const renderBookingCard = (booking: BookingListItem) => {
    const { date, time, day } = formatDateTime(booking.start_time!)
    const isPast = new Date(booking.start_time!) < new Date()

    return (
      <Card key={booking.id} className="cursor-pointer" onClick={() => onBookingSelect?.(booking.id!)}>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-base">{booking.customerName}</CardTitle>
              <p className="text-xs text-muted-foreground">{booking.confirmation_code}</p>
            </div>
            <Badge variant={getStatusVariant(booking.status!)}>
              {booking.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <span>{day}, {date}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{time} ({booking.duration_minutes} min)</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>{booking.staffName}</span>
          </div>
          <Separator />
          <div>
            <p className="text-xs text-muted-foreground mb-1">Services:</p>
            {booking.services.map((service, i) => (
              <Badge key={i} variant="secondary" className="mr-1 mb-1 text-xs">
                {service}
              </Badge>
            ))}
          </div>
          <div className="flex justify-between items-center pt-2">
            <div>
              <p className="text-sm font-semibold">${booking.total_amount?.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">{booking.payment_status}</p>
            </div>
            <div className="flex gap-1">
              {booking.canReschedule && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(e) => { e.stopPropagation(); handlers.handleReschedule(booking.id!) }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {booking.canCancel && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(e) => { e.stopPropagation(); handlers.handleCancel(booking.id!) }}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    )
  }

  if (bookings.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-64">
          <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-semibold text-lg mb-2">No bookings found</h3>
          <p className="text-muted-foreground text-center mb-4">
            {searchTerm || Object.keys(filters).length > 0
              ? 'Try adjusting your filters or search term'
              : 'Create your first booking to get started'}
          </p>
          {(!searchTerm && Object.keys(filters).length === 0) && (
            <Button onClick={onNewBooking}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              Create Booking
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  if (viewMode === 'calendar') {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Calendar view is coming soon. Please use list or grid view for now.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (viewMode === 'grid') {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bookings.map(renderBookingCard)}
      </div>
    )
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Date & Time</TableHead>
            <TableHead>Staff</TableHead>
            <TableHead>Services</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map(renderBookingRow)}
        </TableBody>
      </Table>
    </Card>
  )
}