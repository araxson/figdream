'use client'

import { format } from 'date-fns'
import {
  Calendar,
  Clock,
  UserCheck,
  CheckCircle,
  AlertCircle,
  X,
  FileEdit,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { AppointmentWithRelations, AppointmentStatus } from '../types'

interface AppointmentDetailsHeaderProps {
  appointment: AppointmentWithRelations
  onEdit?: () => void
  onReschedule?: () => void
  onPrint?: () => void
  onShare?: () => void
  onConfirm?: () => void
  onCheckIn?: () => void
  onComplete?: () => void
  onNoShow?: () => void
  onCancel?: () => void
  isLoading?: boolean
}

const statusConfig: Record<AppointmentStatus, { label: string; icon: React.ReactNode; color: string }> = {
  draft: { label: 'Draft', icon: <FileEdit className="h-4 w-4" />, color: 'bg-gray-400' },
  pending: { label: 'Pending', icon: <Clock className="h-4 w-4" />, color: 'bg-yellow-500' },
  confirmed: { label: 'Confirmed', icon: <CheckCircle className="h-4 w-4" />, color: 'bg-blue-500' },
  checked_in: { label: 'Checked In', icon: <UserCheck className="h-4 w-4" />, color: 'bg-indigo-500' },
  in_progress: { label: 'In Progress', icon: <RefreshCw className="h-4 w-4" />, color: 'bg-purple-500' },
  completed: { label: 'Completed', icon: <CheckCircle className="h-4 w-4" />, color: 'bg-green-500' },
  cancelled: { label: 'Cancelled', icon: <X className="h-4 w-4" />, color: 'bg-gray-500' },
  no_show: { label: 'No Show', icon: <AlertCircle className="h-4 w-4" />, color: 'bg-red-500' },
  rescheduled: { label: 'Rescheduled', icon: <RefreshCw className="h-4 w-4" />, color: 'bg-orange-500' },
}

export function AppointmentDetailsHeader({
  appointment,
  onEdit,
  onReschedule,
  onPrint,
  onShare,
  onConfirm,
  onCheckIn,
  onComplete,
  onNoShow,
  onCancel,
  isLoading = false,
}: AppointmentDetailsHeaderProps) {
  const status = statusConfig[appointment.status as AppointmentStatus]

  return (
    <div className="flex items-start justify-between pb-6">
      <div className="flex items-start space-x-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={appointment.customer?.avatar_url || undefined} />
          <AvatarFallback className="text-lg">
            {appointment.customer?.first_name?.[0]}
            {appointment.customer?.last_name?.[0]}
          </AvatarFallback>
        </Avatar>

        <div>
          <h3 className="text-xl font-semibold">
            {appointment.customer?.first_name} {appointment.customer?.last_name}
          </h3>
          <p className="text-muted-foreground mb-2">#{appointment.confirmation_code}</p>

          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <Calendar className="mr-1 h-4 w-4" />
              {appointment.start_time && format(new Date(appointment.start_time), 'MMM d, yyyy')}
            </div>
            <div className="flex items-center">
              <Clock className="mr-1 h-4 w-4" />
              {appointment.start_time && appointment.end_time &&
                `${format(new Date(appointment.start_time), 'h:mm a')} - ${format(new Date(appointment.end_time), 'h:mm a')}`
              }
            </div>
          </div>

          <div className="mt-2">
            <Badge
              variant="secondary"
              className="flex items-center w-fit"
              style={{ backgroundColor: status?.color }}
            >
              {status?.icon}
              <span className="ml-1 text-white">{status?.label}</span>
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {/* Quick Actions */}
        {appointment.status === 'pending' && (
          <Button
            size="sm"
            onClick={onConfirm}
            disabled={isLoading}
          >
            Confirm
          </Button>
        )}

        {appointment.status === 'confirmed' && (
          <Button
            size="sm"
            onClick={onCheckIn}
            disabled={isLoading}
          >
            Check In
          </Button>
        )}

        {(appointment.status === 'checked_in' || appointment.status === 'in_progress') && (
          <Button
            size="sm"
            onClick={onComplete}
            disabled={isLoading}
          >
            Complete
          </Button>
        )}

        {/* More Actions Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Appointment Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />

            {onEdit && (
              <DropdownMenuItem onClick={onEdit}>
                <FileEdit className="mr-2 h-4 w-4" />
                Edit Details
              </DropdownMenuItem>
            )}

            {onReschedule && (
              <DropdownMenuItem onClick={onReschedule}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Reschedule
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            {onPrint && (
              <DropdownMenuItem onClick={onPrint}>
                <FileEdit className="mr-2 h-4 w-4" />
                Print Receipt
              </DropdownMenuItem>
            )}

            {onShare && (
              <DropdownMenuItem onClick={onShare}>
                <FileEdit className="mr-2 h-4 w-4" />
                Share Details
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            {appointment.status === 'confirmed' && (
              <DropdownMenuItem onClick={onNoShow}>
                <AlertCircle className="mr-2 h-4 w-4" />
                Mark No Show
              </DropdownMenuItem>
            )}

            {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
              <DropdownMenuItem onClick={onCancel} className="text-destructive">
                <X className="mr-2 h-4 w-4" />
                Cancel Appointment
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}