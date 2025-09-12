import { createClient } from '@/lib/supabase/server'
import { StaffSchedulesClient } from './schedules-client'

async function getStaffSchedulesData() {
  const supabase = await createClient()
  
  // Get staff schedules with staff and salon info
  const { data: schedules, error: schedulesError } = await supabase
    .from('staff_schedules')
    .select(`
      *,
      staff:staff_members(
        id,
        first_name,
        last_name,
        email,
        phone,
        position,
        salon:salons(
          id,
          name
        )
      )
    `)
    .order('created_at', { ascending: false })
    .limit(100)
  
  if (schedulesError) {
    console.error('Error fetching staff schedules:', schedulesError)
  }
  
  // Get all staff members for dropdown
  const { data: staffMembers } = await supabase
    .from('staff_members')
    .select(`
      id,
      first_name,
      last_name,
      email,
      position,
      salon:salons(
        id,
        name
      )
    `)
    .order('first_name', { ascending: true })
  
  // Get schedule statistics
  const { count: totalCount } = await supabase
    .from('staff_schedules')
    .select('*', { count: 'exact', head: true })
  
  // Get current week schedules
  const startOfWeek = new Date()
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
  startOfWeek.setHours(0, 0, 0, 0)
  
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(endOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)
  
  const { count: weekCount } = await supabase
    .from('staff_schedules')
    .select('*', { count: 'exact', head: true })
    .gte('date', startOfWeek.toISOString())
    .lte('date', endOfWeek.toISOString())
  
  // Get unique staff with schedules
  const { data: uniqueStaff } = await supabase
    .from('staff_schedules')
    .select('staff_id')
  
  const uniqueStaffCount = new Set(uniqueStaff?.map(s => s.staff_id)).size
  
  // Get today's schedules
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  const { count: todayCount } = await supabase
    .from('staff_schedules')
    .select('*', { count: 'exact', head: true })
    .gte('date', today.toISOString())
    .lt('date', tomorrow.toISOString())
  
  return {
    schedules: schedules || [],
    staffMembers: staffMembers || [],
    counts: {
      total: totalCount || 0,
      thisWeek: weekCount || 0,
      today: todayCount || 0,
      activeStaff: uniqueStaffCount
    }
  }
}

export async function StaffSchedulesServer() {
  const data = await getStaffSchedulesData()
  
  return <StaffSchedulesClient {...data} />
}