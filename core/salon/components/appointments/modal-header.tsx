'use client'

import {
  CheckCircle,
  AlertCircle,
  Edit,
  X,
  RefreshCw,
  Printer,
  Share2,
  ChevronRight,
  User,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { AppointmentWithRelations, AppointmentStatus } from '../types'

interface AppointmentModalHeaderProps {
  appointment: AppointmentWithRelations
  statusConfig: Record<AppointmentStatus, { label: string; icon: React.ReactNode; color: string }>
  onStatusChange: (action: 'confirm' | 'checkin' | 'complete' | 'noshow') => void
  onEdit?: () => void
  onReschedule?: () => void
  onPrint?: () => void
  onShare?: () => void
  onCancel: () => void
  isLoading: boolean
}

export function AppointmentModalHeader({
  appointment,
  statusConfig,
  onStatusChange,
  onEdit,
  onReschedule,
  onPrint,
  onShare,
  onCancel,
  isLoading,
}: AppointmentModalHeaderProps) {
  const status = statusConfig[appointment.status as AppointmentStatus]

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className={cn('w-3 h-3 rounded-full', status.color)} />
        <Badge variant="outline" className="gap-1">
          {status.icon}
          {status.label}
        </Badge>
        {appointment.confirmation_code && (
          <Badge variant="secondary">#{appointment.confirmation_code}</Badge>
        )}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isLoading}>
            Actions
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {appointment.status === 'pending' && (
            <DropdownMenuItem onClick={() => onStatusChange('confirm')}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Confirm Appointment
            </DropdownMenuItem>
          )}
          {appointment.status === 'confirmed' && (
            <DropdownMenuItem onClick={() => onStatusChange('checkin')}>
              <User className="mr-2 h-4 w-4" />
              Check In
            </DropdownMenuItem>
          )}
          {(appointment.status === 'confirmed' || appointment.status === 'checked_in') && (
            <DropdownMenuItem onClick={() => onStatusChange('complete')}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark Complete
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => onStatusChange('noshow')}>
            <AlertCircle className="mr-2 h-4 w-4" />
            Mark No-Show
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onReschedule}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reschedule
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onPrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onShare}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive"
            onClick={onCancel}
          >
            <X className="mr-2 h-4 w-4" />
            Cancel Appointment
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}