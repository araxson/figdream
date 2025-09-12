import { createClient } from '@/lib/supabase/server'
import { UsersClient } from './users-client'

async function getUsersData() {
  const supabase = await createClient()
  
  // Fetch comprehensive user data with relationships
  const { data: users, error: usersError } = await supabase
    .from('profiles')
    .select(`
      *,
      salons:salons!salons_owner_id_fkey(
        id,
        name
      ),
      staff_member:staff_members!staff_members_user_id_fkey(
        id,
        position,
        salon:salons(
          id,
          name
        )
      ),
      appointments_as_customer:appointments!appointments_customer_id_fkey(count),
      appointments_as_staff:appointments!appointments_staff_id_fkey(count)
    `)
    .order('created_at', { ascending: false })
  
  if (usersError) {
    console.error('Error fetching users:', usersError)
  }

  // Get role distribution
  const { data: roleStats } = await supabase
    .from('profiles')
    .select('role')
  
  const roleDistribution = roleStats?.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  // Get activity statistics
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
  
  const { count: activeUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)
  
  const { count: verifiedUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('email_verified', true)
  
  // Get recent registrations (last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  
  const { count: recentRegistrations } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', sevenDaysAgo.toISOString())

  // Get recent activity from audit logs
  const { data: recentActivity } = await supabase
    .from('audit_logs')
    .select(`
      id,
      action,
      entity_type,
      created_at,
      user:profiles!audit_logs_user_id_fkey(
        email,
        full_name
      )
    `)
    .in('entity_type', ['user', 'profile', 'role'])
    .order('created_at', { ascending: false })
    .limit(20)

  return {
    users: users || [],
    stats: {
      total: totalUsers || 0,
      active: activeUsers || 0,
      verified: verifiedUsers || 0,
      recentRegistrations: recentRegistrations || 0,
      roleDistribution
    },
    recentActivity: recentActivity || []
  }
}

export async function UsersServer() {
  const data = await getUsersData()
  return <UsersClient {...data} />
}