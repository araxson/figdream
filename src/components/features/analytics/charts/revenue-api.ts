import { createClient } from '@/lib/supabase/client'
import { format, subDays } from 'date-fns'
import { ChartDataItem } from './revenue-types'

export async function fetchRevenueData(timeRange: string): Promise<ChartDataItem[]> {
  const supabase = createClient()
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: salon } = await supabase
      .from('salons')
      .select('id')
      .eq('created_by', user.id)
      .single()
    
    if (!salon) return []

    const endDate = new Date()
    const startDate = subDays(endDate, parseInt(timeRange))

    const { data: revenues } = await supabase
      .from('revenue_summary')
      .select('appointment_date, total_amount, tip_amount')
      .eq('salon_id', salon.id)
      .gte('appointment_date', format(startDate, 'yyyy-MM-dd'))
      .lte('appointment_date', format(endDate, 'yyyy-MM-dd'))
      .order('appointment_date', { ascending: true })

    if (!revenues) return []

    const groupedData = revenues.reduce((acc: Record<string, ChartDataItem>, rev) => {
      const date = rev.appointment_date
      if (!date) return acc
      if (!acc[date]) {
        acc[date] = {
          date,
          revenue: 0,
          tips: 0,
          count: 0
        }
      }
      acc[date].revenue += rev.total_amount || 0
      acc[date].tips += rev.tip_amount || 0
      acc[date].count += 1
      return acc
    }, {})

    const days = parseInt(timeRange)
    const allDates: ChartDataItem[] = []
    
    for (let i = 0; i < days; i++) {
      const currentDate = format(subDays(endDate, days - 1 - i), 'yyyy-MM-dd')
      allDates.push(
        groupedData[currentDate] || {
          date: currentDate,
          revenue: 0,
          tips: 0,
          count: 0
        }
      )
    }

    return allDates.map(item => ({
      ...item,
      date: format(new Date(item.date), 'MMM dd')
    }))
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching revenue data:', error)
    }
    return []
  }
}