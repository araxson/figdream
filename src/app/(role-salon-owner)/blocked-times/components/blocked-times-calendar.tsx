'use client'

import { Calendar } from '@/components/ui'
import type { Database } from '@/types/database.types'

type BlockedTime = Database['public']['Tables']['blocked_times']['Row']

interface BlockedTimesCalendarProps {
  blockedTimes: BlockedTime[]
  onDateSelect?: (date: Date) => void
}

export function BlockedTimesCalendar({ blockedTimes, onDateSelect }: BlockedTimesCalendarProps) {
  const blockedDates = blockedTimes.map(bt => new Date(bt.start_datetime))
  
  return (
    <Calendar
      mode="single"
      selected={undefined}
      onSelect={(date) => date && onDateSelect?.(date)}
      disabled={(date) => {
        return blockedDates.some(
          blocked => 
            blocked.getFullYear() === date.getFullYear() &&
            blocked.getMonth() === date.getMonth() &&
            blocked.getDate() === date.getDate()
        )
      }}
      className="rounded-md border"
    />
  )
}