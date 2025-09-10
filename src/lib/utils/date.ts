import { format, parseISO, isToday, isTomorrow, isYesterday, addDays, startOfDay, endOfDay } from 'date-fns'

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  
  if (isToday(d)) return 'Today'
  if (isTomorrow(d)) return 'Tomorrow'
  if (isYesterday(d)) return 'Yesterday'
  
  return format(d, 'MMM d, yyyy')
}

export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'h:mm a')
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'MMM d, yyyy h:mm a')
}

export function getTimeSlots(date: Date, duration: number = 30): string[] {
  const slots: string[] = []
  const start = new Date(date)
  start.setHours(9, 0, 0, 0) // Start at 9 AM
  const end = new Date(date)
  end.setHours(18, 0, 0, 0) // End at 6 PM
  
  while (start < end) {
    slots.push(format(start, 'h:mm a'))
    start.setMinutes(start.getMinutes() + duration)
  }
  
  return slots
}

export function getNextAvailableDate(): Date {
  const tomorrow = addDays(new Date(), 1)
  // Skip Sunday (0)
  if (tomorrow.getDay() === 0) {
    return addDays(tomorrow, 1)
  }
  return tomorrow
}

export function getDayRange(date: Date): { start: Date; end: Date } {
  return {
    start: startOfDay(date),
    end: endOfDay(date)
  }
}