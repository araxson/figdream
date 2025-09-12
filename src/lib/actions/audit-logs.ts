'use server'

import { createClient } from '@/lib/auth/server'

export async function getRecentAuditLogs(limit: number = 4) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) {
    console.error('Error fetching audit logs:', error)
    return []
  }
  
  return data || []
}

export async function getRecentActivity(limit: number = 4) {
  const supabase = await createClient()
  
  // Fetch recent salon registrations
  const { data: salons } = await supabase
    .from('salons')
    .select('id, name, created_at')
    .order('created_at', { ascending: false })
    .limit(1)
  
  // Fetch recent user activities
  const { data: users } = await supabase
    .from('profiles')
    .select('id, email, role, created_at, updated_at')
    .order('updated_at', { ascending: false })
    .limit(2)
  
  // Combine and format activities
  const activities = []
  
  if (salons && salons.length > 0) {
    activities.push({
      type: 'user',
      message: `New salon registered: ${salons[0].name}`,
      created_at: salons[0].created_at,
      icon: 'Store'
    })
  }
  
  if (users && users.length > 0) {
    users.forEach(user => {
      if (user.role === 'admin' || user.role === 'super_admin') {
        activities.push({
          type: 'user',
          message: `Admin role assigned to ${user.email}`,
          created_at: user.updated_at,
          icon: 'Users'
        })
      }
    })
  }
  
  // Sort by created_at and limit
  return activities
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit)
}