'use client'

import { useState, useCallback, useTransition } from 'react'
import { Calendar, Clock, User, DollarSign, MoreVertical, Check, X, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useOptimisticCrud, useOptimisticToggle } from '@/core/shared/hooks/optimistic'
import { useRealtimeSync } from '@/core/shared/hooks/use-realtime-sync'
import { SkeletonLoader, ProgressiveList } from '@/core/shared/components/optimized-loading'
import { ErrorRecovery, SyncStatus } from '@/core/shared/components/error-recovery'
import { format } from 'date-fns'
import { toast } from 'sonner'
import type { Database } from '@/types/database.types'

import type { AppointmentWithRelations } from '../types'

interface AppointmentWithDetails extends AppointmentWithRelations {
  id: string
  appointment_datetime: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled'
  notes?: string | null
  customer: {
    name: string
    email: string
    phone: string
  }
  staff: {
    name: string
    avatar?: string
  }
  service: {
    name: string
    duration: number
    price: number
  }
}

export function AppointmentListOptimistic({
  initialAppointments = [],
  salonId
}: {
  initialAppointments?: AppointmentWithDetails[]
  salonId: string
}) {
  // Optimistic CRUD operations
  const {
    items: appointments,
    isUpdating,
    error,
    actions
  } = useOptimisticCrud<AppointmentWithDetails>(initialAppointments, {
    onSuccess: (_appointment) => {
      // Appointment operation successful
    },
    onError: (error) => {
      console.error('Appointment operation failed:', error)
    },
    retryAttempts: 3,
    retryDelay: 1000
  })

  // Real-time sync
  const {
    lastSync,
    pendingChanges,
    conflicts,
    actions: syncActions
  } = useRealtimeSync({
    channel: `appointments-${salonId}`,
    table: 'appointments',
    filter: `salon_id=eq.${salonId}`,
    onInsert: (_payload) => {
      // Handle real-time insert
      toast.info('New appointment added')
      // Merge with optimistic state if needed
    },
    onUpdate: (_payload) => {
      // Handle real-time update
    },
    onDelete: (_payload) => {
      // Handle real-time delete
      toast.info('Appointment cancelled')
    },
    fallbackToPolling: true,
    pollingInterval: 5000
  })

  // Status toggle with optimistic updates (removed as unused)

  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  // Optimistic appointment confirmation
  const confirmAppointment = useCallback(async (id: string) => {
    await actions.update(
      id,
      { status: 'confirmed' },
      async (id, updates) => {
        // Server action simulation
        const response = await fetch(`/api/appointments/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        })

        if (!response.ok) throw new Error('Failed to confirm appointment')
        return response.json()
      }
    )
  }, [actions])

  // Optimistic appointment cancellation
  const cancelAppointment = useCallback(async (id: string) => {
    await actions.update(
      id,
      { status: 'cancelled' },
      async (id, updates) => {
        // Server action simulation
        const response = await fetch(`/api/appointments/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        })

        if (!response.ok) throw new Error('Failed to cancel appointment')
        return response.json()
      }
    )
  }, [actions])

  // Optimistic appointment reschedule (removed as unused)
  // const rescheduleAppointment = useCallback(async (
  //   id: string,
  //   newDateTime: string
  // ) => {
  //   await actions.update(
  //     id,
  //     {
  //       appointment_datetime: newDateTime,
  //       status: 'rescheduled'
  //     },
  //     async (id, updates) => {
  //       // Server action simulation
  //       const response = await fetch(`/api/appointments/${id}/reschedule`, {
  //         method: 'POST',
  //         headers: { 'Content-Type': 'application/json' },
  //         body: JSON.stringify(updates)
  //       })
  //
  //       if (!response.ok) throw new Error('Failed to reschedule appointment')
  //       return response.json()
  //     }
  //   )
  // }, [actions])

  // Optimistic delete
  const deleteAppointment = useCallback(async (id: string) => {
    await actions.remove(
      id,
      async (id) => {
        // Server action simulation
        const response = await fetch(`/api/appointments/${id}`, {
          method: 'DELETE'
        })

        if (!response.ok) throw new Error('Failed to delete appointment')
      }
    )
  }, [actions])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'rescheduled': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const renderAppointment = (appointment: AppointmentWithDetails, _index: number) => {
    const isOptimistic = appointment.id.startsWith('temp-')
    const appointmentDate = new Date(appointment.appointment_datetime)

    return (
      <Card
        key={appointment.id}
        className={`transition-all duration-200 ${
          isOptimistic ? 'opacity-70 ring-2 ring-primary' : ''
        } ${isUpdating && selectedAppointment === appointment.id ? 'animate-pulse' : ''}`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg">
                {appointment.service.name}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={getStatusColor(appointment.status)}>
                  {appointment.status}
                </Badge>
                {isOptimistic && (
                  <Badge variant="outline" className="text-xs">
                    Syncing...
                  </Badge>
                )}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" disabled={isOptimistic}>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {appointment.status === 'pending' && (
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedAppointment(appointment.id)
                      confirmAppointment(appointment.id)
                    }}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Confirm
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedAppointment(appointment.id)
                    // Open reschedule modal
                  }}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Reschedule
                </DropdownMenuItem>
                {appointment.status !== 'cancelled' && (
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedAppointment(appointment.id)
                      cancelAppointment(appointment.id)
                    }}
                    className="text-red-600"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedAppointment(appointment.id)
                    deleteAppointment(appointment.id)
                  }}
                  className="text-red-600"
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-gray-500" />
            <span className="font-medium">{appointment.customer.name}</span>
            <span className="text-gray-500">• {appointment.customer.phone}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-gray-500" />
            <span>with {appointment.staff.name}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>{format(appointmentDate, 'EEE, MMM d, yyyy')}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-gray-500" />
            <span>{format(appointmentDate, 'h:mm a')}</span>
            <span className="text-gray-500">
              • {appointment.service.duration} min
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-gray-500" />
            <span className="font-medium">
              ${appointment.service.price.toFixed(2)}
            </span>
          </div>

          {appointment.notes && (
            <div className="pt-2 border-t">
              <p className="text-sm text-gray-600">{appointment.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Sync Status */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Appointments</h2>
        <SyncStatus
          isSyncing={isUpdating}
          lastSyncTime={lastSync}
          pendingChanges={pendingChanges.length}
          onSync={() => syncActions.forceSync()}
        />
      </div>

      {/* Error Recovery */}
      <ErrorRecovery
        error={error}
        onRetry={() => actions.refresh(async () => {
          // Fetch fresh data
          const response = await fetch(`/api/appointments?salon_id=${salonId}`)
          return response.json()
        })}
        onDismiss={() => {}}
      />

      {/* Conflict Resolution */}
      {conflicts.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Sync Conflicts Detected</AlertTitle>
          <AlertDescription>
            {conflicts.length} conflict(s) need resolution
            <Button
              size="sm"
              variant="outline"
              className="ml-2"
              onClick={() => {
                // Open conflict resolution dialog
                toast.info('Opening conflict resolution...')
              }}
            >
              Resolve
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Appointment List with Progressive Loading */}
      <ProgressiveList
        items={appointments}
        renderItem={renderAppointment}
        batchSize={5}
        delay={50}
        skeleton={<SkeletonLoader variant="card" count={3} />}
        onLoadComplete={() => {
          // All appointments loaded
        }}
      />

      {appointments.length === 0 && !isUpdating && (
        <Card className="p-12 text-center">
          <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">No appointments</h3>
          <p className="text-sm text-gray-500">
            Appointments will appear here when scheduled
          </p>
        </Card>
      )}
    </div>
  )
}