export const getStatusVariant = (status: string) => {
  switch (status) {
    case 'confirmed': return 'default'
    case 'pending': return 'secondary'
    case 'completed': return 'outline'
    case 'cancelled': return 'destructive'
    case 'no_show': return 'destructive'
    case 'checked_in': return 'default'
    case 'in_progress': return 'default'
    default: return 'secondary'
  }
}

export const formatDateTime = (dateString: string) => {
  const date = new Date(dateString)
  return {
    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    day: date.toLocaleDateString('en-US', { weekday: 'short' })
  }
}

export const ITEMS_PER_PAGE = 10

export const getDateRangeFilter = (value: string) => {
  const now = new Date()
  const start = new Date()
  const end = new Date()

  switch (value) {
    case 'today':
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      break
    case 'tomorrow':
      start.setDate(start.getDate() + 1)
      start.setHours(0, 0, 0, 0)
      end.setDate(end.getDate() + 1)
      end.setHours(23, 59, 59, 999)
      break
    case 'week':
      end.setDate(end.getDate() + 7)
      break
    case 'month':
      end.setMonth(end.getMonth() + 1)
      break
    default:
      return undefined
  }

  return { start, end }
}