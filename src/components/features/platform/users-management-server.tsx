import { createClient } from '@/lib/supabase/server'
import { UsersManagementClient } from './users-management-client'

async function getUsersData() {
  const supabase = await createClient()
  
  // Fetch all users with their roles and metadata
  const { data: users, error } = await supabase
    .from('profiles')
    .select(`
      *,
      user_roles!user_roles_user_id_fkey (
        role,
        created_at
      )
    `)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching users:', error)
    return { users: [], counts: {} }
  }
  
  // Get user counts by role
  const { data: roleCounts } = await supabase
    .from('profiles')
    .select('role')
  
  const counts = {
    total: roleCounts?.length || 0,
    super_admin: roleCounts?.filter(u => u.role === 'super_admin').length || 0,
    salon_owner: roleCounts?.filter(u => u.role === 'salon_owner').length || 0,
    salon_manager: roleCounts?.filter(u => u.role === 'salon_manager').length || 0,
    staff: roleCounts?.filter(u => u.role === 'staff').length || 0,
    customer: roleCounts?.filter(u => u.role === 'customer').length || 0
  }
  
  return { users: users || [], counts }
}

export async function UsersManagementServer() {
  const { users, counts } = await getUsersData()
  
  return <UsersManagementClient initialUsers={users} counts={counts} />
}