
import { ChartDataItem } from '@/types/features/revenue-types'

export async function fetchRevenueData(timeRange: string): Promise<ChartDataItem[]> {
  try {
    const response = await fetch(`/api/analytics/revenue?timeRange=${timeRange}`)
    if (!response.ok) {
      throw new Error('Failed to fetch revenue data')
    }
    const data = await response.json()
    return data
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching revenue data:', error)
    }
    return []
  }
}