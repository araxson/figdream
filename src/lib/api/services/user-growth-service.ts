import { createClient } from '@/lib/supabase/client'
import { GrowthData, TimeRange } from '@/types/features/user-growth-types'

export async function fetchGrowthData(timeRange: TimeRange): Promise<GrowthData> {
  const supabase = createClient()
  
  try {
    const now = new Date()
    const startDate = timeRange === 'month'
      ? new Date(now.getFullYear(), now.getMonth(), 1)
      : timeRange === 'quarter'
      ? new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
      : new Date(now.getFullYear(), 0, 1)

    // Fetch all profiles
    const { data: profiles, count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' })

    // Fetch new users in time range
    const { data: newProfiles } = await supabase
      .from('profiles')
      .select('*')
      .gte('created_at', startDate.toISOString())

    const newUsers = newProfiles?.length || 0

    // Calculate growth rate
    const previousStartDate = new Date(startDate)
    if (timeRange === 'month') {
      previousStartDate.setMonth(previousStartDate.getMonth() - 1)
    } else if (timeRange === 'quarter') {
      previousStartDate.setMonth(previousStartDate.getMonth() - 3)
    } else {
      previousStartDate.setFullYear(previousStartDate.getFullYear() - 1)
    }

    const { data: previousProfiles } = await supabase
      .from('profiles')
      .select('*')
      .gte('created_at', previousStartDate.toISOString())
      .lt('created_at', startDate.toISOString())

    const previousUsers = previousProfiles?.length || 0
    const growthRate = previousUsers > 0 
      ? ((newUsers - previousUsers) / previousUsers) * 100 
      : 0

    // Calculate churn (users who haven't logged in for 30+ days)
    const churnDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const { data: activeProfiles } = await supabase
      .from('profiles')
      .select('*')
      .gte('last_sign_in_at', churnDate.toISOString())

    const activeUsers = activeProfiles?.length || 0
    const churnRate = totalUsers && totalUsers > 0 
      ? ((totalUsers - activeUsers) / totalUsers) * 100 
      : 0

    // Calculate users by role
    const roleCount: Record<string, number> = {}
    profiles?.forEach((profile) => {
      const role = profile.role || 'customer'
      roleCount[role] = (roleCount[role] || 0) + 1
    })

    const usersByRole = Object.entries(roleCount)
      .map(([role, count]) => ({
        role,
        count,
        percentage: totalUsers && totalUsers > 0 ? (count / totalUsers) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count)

    // Calculate monthly growth
    const monthlyGrowth = await calculateMonthlyGrowth(supabase, now)

    // Calculate retention cohorts
    const retentionCohorts = await calculateRetentionCohorts(supabase, now, churnDate)

    return {
      newUsers,
      totalUsers: totalUsers || 0,
      growthRate,
      churnRate,
      usersByRole,
      monthlyGrowth,
      retentionCohorts
    }
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

async function calculateMonthlyGrowth(supabase: ReturnType<typeof createClient>, now: Date) {
  const monthlyGrowth: GrowthData['monthlyGrowth'] = []
  
  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
    
    const { data: monthNewUsers } = await supabase
      .from('profiles')
      .select('*')
      .gte('created_at', monthStart.toISOString())
      .lte('created_at', monthEnd.toISOString())

    const { data: monthChurnedUsers } = await supabase
      .from('profiles')
      .select('*')
      .gte('deleted_at', monthStart.toISOString())
      .lte('deleted_at', monthEnd.toISOString())

    const newCount = monthNewUsers?.length || 0
    const churnedCount = monthChurnedUsers?.length || 0
    
    monthlyGrowth.push({
      month: monthStart.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
      new_users: newCount,
      churned_users: churnedCount,
      net_growth: newCount - churnedCount
    })
  }
  
  return monthlyGrowth
}

async function calculateRetentionCohorts(
  supabase: ReturnType<typeof createClient>, 
  now: Date, 
  churnDate: Date
) {
  const retentionCohorts: GrowthData['retentionCohorts'] = []
  
  for (let i = 3; i >= 0; i--) {
    const cohortStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const cohortEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
    
    const { data: cohortUsers } = await supabase
      .from('profiles')
      .select('*')
      .gte('created_at', cohortStart.toISOString())
      .lte('created_at', cohortEnd.toISOString())

    const initialUsers = cohortUsers?.length || 0
    // Use last_active_at instead of last_sign_in_at (which doesn't exist)
    const retainedUsers = cohortUsers?.filter(u => 
      u.last_active_at && new Date(u.last_active_at) > churnDate
    ).length || 0

    retentionCohorts.push({
      cohort: cohortStart.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
      initial_users: initialUsers,
      retained_users: retainedUsers,
      retention_rate: initialUsers > 0 ? (retainedUsers / initialUsers) * 100 : 0
    })
  }
  
  return retentionCohorts
}