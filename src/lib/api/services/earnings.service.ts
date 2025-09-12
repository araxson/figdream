import { StaffEarning, EarningsStats, TimeRange } from '@/types/features/earnings-types'

export async function fetchStaffEarnings(timeRange: TimeRange): Promise<{
  earnings: StaffEarning[]
  stats: EarningsStats | null
}> {
  try {
    const response = await fetch(`/api/staff/earnings?timeRange=${timeRange}`)
    if (!response.ok) {
      throw new Error('Failed to fetch earnings')
    }
    const data = await response.json()
    return data
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching earnings:', error)
    }
    return { earnings: [], stats: null }
  }
}