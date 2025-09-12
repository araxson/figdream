import { createClient } from '@/lib/supabase/client'
import { StaffEarning, EarningsStats, TimeRange } from '@/types/features/earnings-types'

export async function fetchStaffEarnings(timeRange: TimeRange): Promise<{
  earnings: StaffEarning[]
  stats: EarningsStats | null
}> {
  const supabase = createClient()
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { earnings: [], stats: null }

    // Get staff profile
    const { data: staffProfile } = await supabase
      .from('staff_profiles')
      .select('id')
      .eq('profile_id', user.id)
      .single()

    if (!staffProfile) return { earnings: [], stats: null }

    // Calculate date ranges
    const today = new Date()
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()))
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const startOfYear = new Date(today.getFullYear(), 0, 1)

    // Fetch earnings based on time range
    let startDate
    switch (timeRange) {
      case 'week':
        startDate = startOfWeek
        break
      case 'month':
        startDate = startOfMonth
        break
      case 'year':
        startDate = startOfYear
        break
    }

    const { data: earningsData } = await supabase
      .from('staff_earnings')
      .select('*')
      .eq('staff_id', staffProfile.id)
      .gte('service_date', startDate.toISOString().split('T')[0])
      .order('service_date', { ascending: false })

    if (!earningsData) return { earnings: [], stats: null }

    // Calculate statistics
    const stats = calculateEarningsStats(earningsData, startOfWeek, startOfMonth, startOfYear)

    return { earnings: earningsData, stats }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching earnings:', error)
    }
    return { earnings: [], stats: null }
  }
}

function calculateEarningsStats(
  earningsData: StaffEarning[],
  startOfWeek: Date,
  startOfMonth: Date,
  startOfYear: Date
): EarningsStats {
  const todayStr = new Date().toISOString().split('T')[0]
  
  const todayEarnings = earningsData
    .filter(e => e.service_date === todayStr)
    .reduce((sum, e) => sum + (e.total_earnings || 0), 0)

  const weekEarnings = earningsData
    .filter(e => new Date(e.service_date) >= startOfWeek)
    .reduce((sum, e) => sum + (e.total_earnings || 0), 0)

  const monthEarnings = earningsData
    .filter(e => new Date(e.service_date) >= startOfMonth)
    .reduce((sum, e) => sum + (e.total_earnings || 0), 0)

  const yearEarnings = earningsData
    .filter(e => new Date(e.service_date) >= startOfYear)
    .reduce((sum, e) => sum + (e.total_earnings || 0), 0)

  const todayTips = earningsData
    .filter(e => e.service_date === todayStr)
    .reduce((sum, e) => sum + (e.tip_amount || 0), 0)

  const monthTips = earningsData
    .filter(e => new Date(e.service_date) >= startOfMonth)
    .reduce((sum, e) => sum + (e.tip_amount || 0), 0)

  const appointmentCount = earningsData.length
  const averagePerAppointment = appointmentCount > 0 
    ? (monthEarnings / appointmentCount) 
    : 0

  // Monthly target (example: $5000)
  const monthlyTarget = 5000
  const targetProgress = (monthEarnings / monthlyTarget) * 100

  return {
    todayEarnings,
    weekEarnings,
    monthEarnings,
    yearEarnings,
    todayTips,
    monthTips,
    averagePerAppointment,
    topService: 'Hair Styling', // Would need to fetch from appointments
    commissionRate: 50, // Example commission rate
    targetProgress: Math.min(targetProgress, 100)
  }
}