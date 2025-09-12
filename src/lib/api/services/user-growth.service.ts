
import { GrowthData, TimeRange } from '@/types/features/user-growth-types'

export async function fetchGrowthData(timeRange: TimeRange): Promise<GrowthData> {
  try {
    const response = await fetch('/api/platform/user-growth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ timeRange }),
    })

    if (!response.ok) {
      throw new Error('Failed to fetch growth data')
    }

    const data = await response.json()
    return data
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching growth data:', error)
    }
    return {
      newUsers: 0,
      totalUsers: 0,
      growthRate: 0,
      churnRate: 0,
      usersByRole: [],
      monthlyGrowth: [],
      retentionCohorts: []
    }
  }
}

