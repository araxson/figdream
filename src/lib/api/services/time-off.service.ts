import { TimeOffRequest, TimeOffFormData } from '@/types/features/time-off-types'

export async function fetchTimeOffRequests(): Promise<TimeOffRequest[]> {
  try {
    const response = await fetch('/api/staff/time-off')
    if (!response.ok) {
      throw new Error('Failed to fetch time off requests')
    }
    const data = await response.json()
    return data
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching time off requests:', error)
    }
    return []
  }
}

export async function submitTimeOffRequest(formData: TimeOffFormData) {
  const response = await fetch('/api/staff/time-off', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to submit time off request')
  }

  return response.json()
}

export async function cancelTimeOffRequest(requestId: string) {
  const response = await fetch(`/api/staff/time-off/${requestId}`, {
    method: 'DELETE'
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to cancel time off request')
  }

  return response.json()
}

export function calculateDays(startDate: string, endDate: string): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
}