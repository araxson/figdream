import { createClient } from '@/lib/supabase/server'
import { SalonsClient } from './salons-client'

async function getSalonsData() {
  const supabase = await createClient()
  
  // Get salons with owner info and counts
  const { data: salons, error: salonsError } = await supabase
    .from('salons')
    .select(`
      *,
      owner:profiles!salons_owner_id_fkey(
        id,
        email,
        full_name,
        avatar_url
      ),
      _count:staff_members(count),
      _appointments:appointments(count),
      _customers:customers(count)
    `)
    .order('created_at', { ascending: false })
  
  if (salonsError) {
    console.error('Error fetching salons:', salonsError)
  }

  // Get statistics
  const { count: totalSalons } = await supabase
    .from('salons')
    .select('*', { count: 'exact', head: true })
  
  const { count: activeSalons } = await supabase
    .from('salons')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)
  
  const { count: totalStaff } = await supabase
    .from('staff_members')
    .select('*', { count: 'exact', head: true })
  
  const { count: totalCustomers } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true })

  // Get recent activity
  const { data: recentActivity } = await supabase
    .from('audit_logs')
    .select('*')
    .in('entity_type', ['salon', 'salon_settings'])
    .order('created_at', { ascending: false })
    .limit(10)

  return {
    salons: salons || [],
    stats: {
      total: totalSalons || 0,
      active: activeSalons || 0,
      inactive: (totalSalons || 0) - (activeSalons || 0),
      totalStaff: totalStaff || 0,
      totalCustomers: totalCustomers || 0
    },
    recentActivity: recentActivity || []
  }
}

export async function SalonsServer() {
  const data = await getSalonsData()
  return <SalonsClient {...data} />
}