'use client'

import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { AlertCircle, Clock, Calendar, User } from 'lucide-react'
import type { BookingConflict } from '../types'

interface CalendarConflictsProps {
  conflicts: BookingConflict[]
  onResolveConflict?: (conflictIndex: number, resolution: any) => void
  onAlternativeSelect?: (date: Date, time: string, staffId?: string) => void
}

export function CalendarConflicts({
  conflicts,
  onResolveConflict,
  onAlternativeSelect
}: CalendarConflictsProps) {
  if (conflicts.length === 0) {
    return null
  }

  const getConflictSeverity = (conflict: BookingConflict) => {
    switch (conflict.severity) {
      case 'high':
        return { variant: 'destructive' as const, icon: AlertCircle }
      case 'medium':
        return { variant: 'default' as const, icon: Clock }
      case 'low':
        return { variant: 'secondary' as const, icon: Calendar }
      default:
        return { variant: 'default' as const, icon: AlertCircle }
    }
  }

  const getConflictTypeLabel = (type: string) => {
    switch (type) {
      case 'double_booking':
        return 'Double Booking'
      case 'staff_unavailable':
        return 'Staff Unavailable'
      case 'service_conflict':
        return 'Service Conflict'
      case 'capacity_exceeded':
        return 'Capacity Exceeded'
      case 'time_conflict':
        return 'Time Conflict'
      default:
        return 'Booking Conflict'
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-5 w-5 text-destructive" />
        <h3 className="font-medium text-destructive">
          {conflicts.length} Booking {conflicts.length === 1 ? 'Conflict' : 'Conflicts'} Detected
        </h3>
      </div>

      {conflicts.map((conflict, index) => {
        const severityInfo = getConflictSeverity(conflict)
        const SeverityIcon = severityInfo.icon

        return (
          <Alert key={index} variant={severityInfo.variant}>
            <SeverityIcon className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {getConflictTypeLabel(conflict.type)}
                      </Badge>
                      <Badge variant={severityInfo.variant}>
                        {conflict.severity?.toUpperCase() || 'MEDIUM'}
                      </Badge>
                    </div>
                    <p className="font-medium">{conflict.description}</p>
                    {conflict.details && (
                      <p className="text-sm text-muted-foreground">
                        {conflict.details}
                      </p>
                    )}
                  </div>

                  {onResolveConflict && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onResolveConflict(index, conflict)}
                    >
                      Resolve
                    </Button>
                  )}
                </div>

                {conflict.affectedBooking && (
                  <div className="bg-muted/50 p-3 rounded-md space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">
                      AFFECTED BOOKING
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {conflict.affectedBooking.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {conflict.affectedBooking.time}
                      </div>
                      {conflict.affectedBooking.staffName && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {conflict.affectedBooking.staffName}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {conflict.suggestedAlternatives && conflict.suggestedAlternatives.length > 0 && (
                  <div className="space-y-2">
                    <Separator />
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-muted-foreground">
                        SUGGESTED ALTERNATIVES
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {conflict.suggestedAlternatives.map((alternative, altIndex) => (
                          <Button
                            key={altIndex}
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => {
                              if (onAlternativeSelect) {
                                const date = new Date(alternative.date || new Date())
                                onAlternativeSelect(date, alternative.time, alternative.staffId)
                              }
                            }}
                          >
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {alternative.time}
                              {alternative.date && (
                                <>
                                  <Separator orientation="vertical" className="h-3" />
                                  <Calendar className="h-3 w-3" />
                                  {alternative.date}
                                </>
                              )}
                              {alternative.staffName && (
                                <>
                                  <Separator orientation="vertical" className="h-3" />
                                  <User className="h-3 w-3" />
                                  {alternative.staffName}
                                </>
                              )}
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )
      })}
    </div>
  )
}