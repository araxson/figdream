import { createClient } from '@/lib/supabase/server'
import { StaffManagementClient } from './staff-management-client'

async function getStaffData() {
  const supabase = await createClient()
  
  // Get staff profiles with user info and salon details
  const { data: staffProfiles, error: staffError } = await supabase
    .from('staff_profiles')
    .select(`
      *,
      user:profiles!staff_profiles_user_id_fkey(
        id,
        email,
        full_name,
        first_name,
        last_name,
        phone,
        avatar_url,
        is_active
      ),
      salon:salons!staff_profiles_salon_id_fkey(
        id,
        name,
        address
      ),
      appointments:appointments!appointments_staff_id_fkey(
        id,
        start_time,
        status
      )
    `)
    .order('created_at', { ascending: false })
    .limit(50)
  
  if (staffError) {
    console.error('Error fetching staff:', staffError)
  }
  
  // Get staff statistics
  const { count: totalCount } = await supabase
    .from('staff_profiles')
    .select('*', { count: 'exact', head: true })
  
  const { count: activeCount } = await supabase
    .from('staff_profiles')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)
  
  // Get staff by availability
  const { count: availableCount } = await supabase
    .from('staff_profiles')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)
    .eq('availability_status', 'available')
  
  // Get salons for filter
  const { data: salons } = await supabase
    .from('salons')
    .select('id, name')
    .order('name')
  
  return {
    staff: staffProfiles || [],
    counts: {
      total: totalCount || 0,
      active: activeCount || 0,
      available: availableCount || 0,
      onLeave: (totalCount || 0) - (activeCount || 0)
    },
    salons: salons || []
  }
}

export async function StaffManagementServer() {
  const data = await getStaffData()
  
  return <StaffManagementClient {...data} />
}