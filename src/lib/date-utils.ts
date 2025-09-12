import { format, formatDistance, formatRelative, isToday, isYesterday, parseISO } from 'date-fns'

export const dateFormats = {
  short: 'MMM d',
  medium: 'MMM d, yyyy',
  long: 'MMMM d, yyyy',
  full: 'EEEE, MMMM d, yyyy',
  time: 'h:mm a',
  datetime: 'MMM d, yyyy h:mm a',
  iso: "yyyy-MM-dd'T'HH:mm:ss",
  date: 'yyyy-MM-dd'
} as const

export type DateFormat = keyof typeof dateFormats

export function formatDate(date: Date | string | null | undefined, formatType: DateFormat = 'medium'): string {
  if (!date) return ''
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, dateFormats[formatType])
}

export function formatRelativeDate(date: Date | string | null | undefined): string {
  if (!date) return ''
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  
  if (isToday(dateObj)) {
    return `Today at ${format(dateObj, 'h:mm a')}`
  }
  
  if (isYesterday(dateObj)) {
    return `Yesterday at ${format(dateObj, 'h:mm a')}`
  }
  
  return formatRelative(dateObj, new Date())
}

export function formatTimeAgo(date: Date | string | null | undefined): string {
  if (!date) return ''
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return formatDistance(dateObj, new Date(), { addSuffix: true })
}

export function formatTimeRange(start: Date | string, end: Date | string): string {
  const startDate = typeof start === 'string' ? parseISO(start) : start
  const endDate = typeof end === 'string' ? parseISO(end) : end
  
  const startStr = format(startDate, 'h:mm a')
  const endStr = format(endDate, 'h:mm a')
  
  return `${startStr} - ${endStr}`
}

export function formatDateRange(start: Date | string, end: Date | string): string {
  const startDate = typeof start === 'string' ? parseISO(start) : start
  const endDate = typeof end === 'string' ? parseISO(end) : end
  
  const startStr = format(startDate, 'MMM d')
  const endStr = format(endDate, 'MMM d, yyyy')
  
  return `${startStr} - ${endStr}`
}

export function getTimezoneOffset(): string {
  const offset = new Date().getTimezoneOffset()
  const hours = Math.floor(Math.abs(offset) / 60)
  const minutes = Math.abs(offset) % 60
  const sign = offset <= 0 ? '+' : '-'
  
  return `UTC${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

export function toLocalTime(date: Date | string): Date {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return new Date(dateObj.getTime() - dateObj.getTimezoneOffset() * 60000)
}

export function toUTCTime(date: Date | string): Date {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return new Date(dateObj.getTime() + dateObj.getTimezoneOffset() * 60000)
}