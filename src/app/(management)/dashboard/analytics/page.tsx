import { requireRole } from '@/lib/api/dal/auth'
import { USER_ROLES } from '@/lib/auth/constants'
import { createClient } from '@/lib/supabase/server'
import { format, subDays } from 'date-fns'
import { ChartDataItem } from '@/types/features/revenue-types'
import { AnalyticsPageContent } from '@/components/features/analytics/analytics-page-content'

async function getRevenueData(): Promise<ChartDataItem[]> {
  const session = await requireRole([USER_ROLES.SALON_OWNER, USER_ROLES.SALON_MANAGER, USER_ROLES.SUPER_ADMIN])
  const supabase = await createClient()
  
  try {
    const { data: salon } = await supabase
      .from('salons')
      .select('id')
      .eq('created_by', session.user.id)
      .single()
    
    if (!salon) return []

    const endDate = new Date()
    const startDate = subDays(endDate, 30)

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
        acc[date] = { date, revenue: 0, tips: 0, appointments: 0 }
      }
      acc[date].revenue += rev.total_amount || 0
      acc[date].tips += rev.tip_amount || 0
      acc[date].appointments += 1
      return acc
    }, {})

    return Object.values(groupedData)
  } catch (error) {
    console.error('Error fetching revenue data:', error)
    return []
  }
}

export default async function AnalyticsPage() {
  const revenueData = await getRevenueData()
  return <AnalyticsPageContent revenueData={revenueData} />
}