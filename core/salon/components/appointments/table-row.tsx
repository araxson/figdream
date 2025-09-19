'use client'

import { format } from 'date-fns'
import {
  Eye,
  Edit,
  X,
  CheckCircle,
  AlertCircle,
  User,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  Clock,
  Calendar,
  Scissors,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { TableCell, TableRow } from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { AppointmentWithRelations, AppointmentStatus, PaymentStatus } from '../types'

interface AppointmentTableRowProps {
  appointment: AppointmentWithRelations
  isSelected: boolean
  isExpanded: boolean
  visibleColumns: Set<string>
  onToggleSelection: (id: string) => void
  onToggleExpansion: (id: string) => void
  onAppointmentClick?: (appointment: AppointmentWithRelations) => void
  onAppointmentEdit?: (appointment: AppointmentWithRelations) => void
  onAppointmentCancel?: (appointment: AppointmentWithRelations) => void
  onAppointmentCheckIn?: (appointment: AppointmentWithRelations) => void
  onAppointmentComplete?: (appointment: AppointmentWithRelations) => void
  showBulkActions: boolean
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

export function AppointmentTableRow({
  appointment,
  isSelected,
  isExpanded,
  visibleColumns,
  onToggleSelection,
  onToggleExpansion,
  onAppointmentClick,
  onAppointmentEdit,
  onAppointmentCancel,
  onAppointmentCheckIn,
  onAppointmentComplete,
  showBulkActions,
}: AppointmentTableRowProps) {
  const status = statusConfig[appointment.status as AppointmentStatus]
  const paymentStatus = paymentStatusConfig[appointment.payment_status as PaymentStatus]

  const renderCell = (columnId: string) => {
    switch (columnId) {
      case 'checkbox':
        return showBulkActions ? (
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggleSelection(appointment.id)}
            aria-label={`Select appointment ${appointment.confirmation_code}`}
          />
        ) : null

      case 'customer':
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={appointment.customer?.avatar_url} />
              <AvatarFallback>
                {appointment.customer?.first_name?.[0]}{appointment.customer?.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">
                {appointment.customer?.first_name} {appointment.customer?.last_name}
              </p>
              <p className="text-sm text-muted-foreground">
                #{appointment.confirmation_code}
              </p>
            </div>
          </div>
        )

      case 'service':
        return (
          <div className="space-y-1">
            {appointment.services?.map((service, index) => (
              <div key={index} className="flex items-center gap-2">
                <Scissors className="h-3 w-3 text-muted-foreground" />
                <span className="text-sm">{service.service_name}</span>
                {service.duration && (
                  <Badge variant="secondary" className="text-xs">
                    {service.duration}m
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )

      case 'datetime':
        return (
          <div>
            <p className="font-medium">
              {format(new Date(appointment.start_time), 'MMM d, yyyy')}
            </p>
            <p className="text-sm text-muted-foreground">
              {format(new Date(appointment.start_time), 'h:mm a')} -{' '}
              {format(new Date(appointment.end_time), 'h:mm a')}
            </p>
          </div>
        )

      case 'staff':
        return appointment.staff ? (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={appointment.staff.avatar_url} />
              <AvatarFallback className="text-xs">
                {appointment.staff.first_name?.[0]}{appointment.staff.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm">
              {appointment.staff.first_name} {appointment.staff.last_name}
            </span>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">Unassigned</span>
        )

      case 'status':
        return (
          <Badge variant={status?.variant} className={cn('flex items-center gap-1 w-fit', status?.color)}>
            {status?.icon}
            {status?.label}
          </Badge>
        )

      case 'payment':
        return (
          <Badge variant={paymentStatus?.variant} className="w-fit">
            {paymentStatus?.label}
          </Badge>
        )

      case 'amount':
        return (
          <div className="text-right">
            <p className="font-medium">
              ${appointment.total_amount?.toFixed(2) || '0.00'}
            </p>
            {appointment.deposit_amount && (
              <p className="text-xs text-muted-foreground">
                Deposit: ${appointment.deposit_amount.toFixed(2)}
              </p>
            )}
          </div>
        )

      case 'actions':
        return (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleExpansion(appointment.id)}
              className="h-8 w-8 p-0"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
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
          </div>
        )

      default:
        return null
    }
  }

  return (
    <TableRow
      className={cn(
        'cursor-pointer transition-colors',
        isSelected && 'bg-muted/50',
        isExpanded && 'bg-muted/30'
      )}
      onClick={() => onAppointmentClick?.(appointment)}
    >
      {Array.from(visibleColumns).map((columnId) => (
        <TableCell
          key={columnId}
          className={cn(
            columnId === 'amount' && 'text-right',
            (columnId === 'checkbox' || columnId === 'actions') && 'w-12'
          )}
          onClick={(e) => {
            if (columnId === 'actions' || columnId === 'checkbox') {
              e.stopPropagation()
            }
          }}
        >
          {renderCell(columnId)}
        </TableCell>
      ))}
    </TableRow>
  )
}