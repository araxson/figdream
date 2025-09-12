import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { format, subDays } from 'date-fns'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '30'
    
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: salon } = await supabase
      .from('salons')
      .select('id')
      .eq('created_by', user.id)
      .single()
    
    if (!salon) {
      return NextResponse.json([])
    }

    const endDate = new Date()
    const startDate = subDays(endDate, parseInt(timeRange))

    const { data: revenues } = await supabase
      .from('revenue_summary')
      .select('appointment_date, total_amount, tip_amount')
      .eq('salon_id', salon.id)
      .gte('appointment_date', format(startDate, 'yyyy-MM-dd'))
      .lte('appointment_date', format(endDate, 'yyyy-MM-dd'))
      .order('appointment_date', { ascending: true })

    if (!revenues) {
      return NextResponse.json([])
    }

    interface ChartDataItem {
      date: string
      revenue: number
      tips: number
      count: number
    }

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

    const result = allDates.map(item => ({
      ...item,
      date: format(new Date(item.date), 'MMM dd')
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching revenue data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}