import { ScheduleData, ScheduleFormData, BreakFormData } from '@/types/features/schedule-types'

export async function fetchScheduleData(selectedDate: Date): Promise<ScheduleData | null> {
  try {
    const response = await fetch(`/api/staff/schedule?date=${selectedDate.toISOString()}`)
    if (!response.ok) {
      throw new Error('Failed to fetch schedule data')
    }
    const data = await response.json()
    return data
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching schedule data:', error)
    }
    return null
  }
}

export async function saveSchedule(scheduleForm: ScheduleFormData, scheduleData: ScheduleData) {
  const response = await fetch('/api/staff/schedule', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      scheduleForm,
      scheduleData
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to save schedule')
  }

  return response.json()
}

export async function saveBreak(breakForm: BreakFormData) {
  const response = await fetch('/api/staff/breaks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(breakForm)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to save break')
  }

  return response.json()
}