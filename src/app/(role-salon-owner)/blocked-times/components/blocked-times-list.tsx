'use client'

import { format } from 'date-fns'
import { Button, Badge, Card, CardContent } from '@/components/ui'
import { Clock, Calendar, Trash2, Edit } from 'lucide-react'
import type { Database } from '@/types/database.types'

type BlockedTime = Database['public']['Tables']['blocked_times']['Row'] & {
  staff_profiles?: { 
    profiles?: { full_name: string | null } | null 
  } | null
}

interface BlockedTimesListProps {
  blockedTimes: BlockedTime[]
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

export function BlockedTimesList({ blockedTimes, onEdit, onDelete }: BlockedTimesListProps) {
  if (blockedTimes.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32 text-muted-foreground">
          No blocked times scheduled
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {blockedTimes.map((blockedTime) => {
        const startDate = new Date(blockedTime.start_datetime)
        const endDate = new Date(blockedTime.end_datetime)
        
        return (
          <Card key={blockedTime.id}>
            <CardContent className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {format(startDate, 'MMM dd, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {format(startDate, 'h:mm a')} - {format(endDate, 'h:mm a')}
                    </span>
                  </div>
                </div>
                {blockedTime.reason && (
                  <Badge variant="secondary">{blockedTime.reason}</Badge>
                )}
                {blockedTime.staff_profiles?.profiles?.full_name && (
                  <Badge variant="outline">
                    {blockedTime.staff_profiles.profiles.full_name}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {onEdit && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEdit(blockedTime.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete(blockedTime.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}