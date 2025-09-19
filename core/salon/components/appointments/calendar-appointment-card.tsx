'use client'

import { MoreHorizontal, Eye, Edit, X, Clock, Check, CheckCircle, User, DollarSign, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { AppointmentWithRelations, AppointmentStatus } from '../../types'

interface CalendarAppointmentCardProps {
  appointment: AppointmentWithRelations
  onAppointmentClick?: (appointment: AppointmentWithRelations) => void
  onAppointmentEdit?: (appointment: AppointmentWithRelations) => void
  onAppointmentCancel?: (appointment: AppointmentWithRelations) => void
  enableDragDrop?: boolean
}

const statusColors: Record<AppointmentStatus, string> = {
  pending: 'bg-yellow-500',
  confirmed: 'bg-blue-500',
  completed: 'bg-green-500',
  cancelled: 'bg-gray-500',
  no_show: 'bg-red-500',
  rescheduled: 'bg-orange-500',
}

const statusIcons: Record<AppointmentStatus, React.ReactNode> = {
  pending: <Clock className="h-3 w-3" />,
  confirmed: <Check className="h-3 w-3" />,
  completed: <CheckCircle className="h-3 w-3" />,
  cancelled: <X className="h-3 w-3" />,
  no_show: <AlertCircle className="h-3 w-3" />,
  rescheduled: <Clock className="h-3 w-3" />,
}

export function CalendarAppointmentCard({
  appointment,
  onAppointmentClick,
  onAppointmentEdit,
  onAppointmentCancel,
  enableDragDrop = false,
}: CalendarAppointmentCardProps) {
  return (
    <div
      className={cn(
        "group relative p-2 rounded-lg border bg-card transition-all",
        "hover:shadow-md hover:border-primary",
        statusColors[appointment.status as AppointmentStatus],
        "bg-opacity-10",
        enableDragDrop && "cursor-move"
      )}
      draggable={enableDragDrop}
      onClick={(e) => {
        e.stopPropagation()
        onAppointmentClick?.(appointment)
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs">
              {statusIcons[appointment.status as AppointmentStatus]}
              {appointment.status}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {appointment.start_time} - {appointment.end_time}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs">
                {appointment.customer?.first_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <p className="text-sm font-medium truncate">
              {appointment.customer?.first_name} {appointment.customer?.last_name}
            </p>
          </div>

          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <User className="h-3 w-3" />
            <span className="truncate">{appointment.staff?.first_name}</span>
            <DollarSign className="h-3 w-3" />
            <span>${appointment.total_amount}</span>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
              <MoreHorizontal className="h-3 w-3" />
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
    </div>
  )
}