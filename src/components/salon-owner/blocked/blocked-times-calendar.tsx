'use client'

import { useState } from 'react'
import {
  Calendar,
  Badge,
  ScrollArea,
  Button,
} from '@/components/ui'
import { format } from 'date-fns'
import { Database } from '@/types/database.types'
import { deleteBlockedTime } from '@/lib/data-access/blocked'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Trash2, Clock, User, Building } from 'lucide-react'

type BlockedTime = Database['public']['Tables']['blocked_times']['Row'] & {
  staff_profiles?: {
    id: string
    full_name: string | null
    email: string | null
  } | null
  salons?: {
    id: string
    name: string | null
  } | null
}

type StaffProfile = Database['public']['Tables']['staff_profiles']['Row']

interface BlockedTimesCalendarProps {
  blockedTimes: BlockedTime[]
  staff: StaffProfile[]
}

export function BlockedTimesCalendar({ blockedTimes, staff }: BlockedTimesCalendarProps) {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Get blocked times for selected date
  const getBlockedTimesForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return blockedTimes.filter(blocked => {
      const blockDate = format(new Date(blocked.start_time), 'yyyy-MM-dd')
      return blockDate === dateStr
    })
  }

  // Get dates with blocked times for calendar highlighting
  const datesWithBlockedTimes = blockedTimes.reduce((dates, blocked) => {
    const dateStr = format(new Date(blocked.start_time), 'yyyy-MM-dd')
    dates.add(dateStr)
    return dates
  }, new Set<string>())

  const selectedDateBlocks = selectedDate ? getBlockedTimesForDate(selectedDate) : []

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      await deleteBlockedTime(id)
      toast.success('Blocked time deleted successfully')
      router.refresh()
    } catch (error) {
      toast.error('Failed to delete blocked time')
      console.error(error)
    } finally {
      setDeletingId(null)
    }
  }

  const getBlockTypeBadge = (type: string) => {
    const variants: Record<string, any> = {
      'maintenance': { variant: 'destructive', label: 'Maintenance' },
      'break': { variant: 'secondary', label: 'Break' },
      'meeting': { variant: 'default', label: 'Meeting' },
      'holiday': { variant: 'outline', label: 'Holiday' },
      'other': { variant: 'secondary', label: 'Other' }
    }
    const config = variants[type] || variants.other
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_350px]">
      <div>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          modifiers={{
            blocked: (date) => datesWithBlockedTimes.has(format(date, 'yyyy-MM-dd'))
          }}
          modifiersStyles={{
            blocked: {
              backgroundColor: 'hsl(var(--destructive) / 0.1)',
              fontWeight: 'bold'
            }
          }}
        />
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="font-semibold">
            {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {selectedDateBlocks.length} blocked time{selectedDateBlocks.length !== 1 ? 's' : ''}
          </p>
        </div>

        <ScrollArea className="h-[450px]">
          {selectedDateBlocks.length > 0 ? (
            <div className="space-y-3">
              {selectedDateBlocks.map((blocked) => (
                <div key={blocked.id} className="space-y-2 rounded-lg border p-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {format(new Date(blocked.start_time), 'h:mm a')} - 
                          {format(new Date(blocked.end_time), 'h:mm a')}
                        </span>
                      </div>
                      
                      {blocked.staff_profiles && (
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span>{blocked.staff_profiles.full_name}</span>
                        </div>
                      )}
                      
                      {blocked.salons && !blocked.staff_profiles && (
                        <div className="flex items-center gap-2 text-sm">
                          <Building className="h-3 w-3 text-muted-foreground" />
                          <span>All Staff</span>
                        </div>
                      )}
                      
                      {blocked.reason && (
                        <p className="text-sm text-muted-foreground">{blocked.reason}</p>
                      )}
                    </div>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(blocked.id)}
                      disabled={deletingId === blocked.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getBlockTypeBadge(blocked.block_type)}
                    {blocked.is_recurring && (
                      <Badge variant="outline">Recurring</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-sm text-muted-foreground">
              No blocked times for this date
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  )
}