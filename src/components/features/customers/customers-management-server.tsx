import { createClient } from '@/lib/supabase/server'
import { CustomersManagementClient } from './customers-management-client'

async function getCustomersData() {
  const supabase = await createClient()
  
  // Get customers with their appointment history
  const { data: customers, error: customersError } = await supabase
    .from('profiles')
    .select(`
      *,
      appointments:appointments!appointments_customer_id_fkey(
        id,
        start_time,
        status,
        total_price
      ),
      reviews(
        id,
        rating,
        created_at
      ),
      favorites(
        id,
        salon_id
      )
    `)
    .eq('role', 'customer')
    .order('created_at', { ascending: false })
    .limit(50)
  
  if (customersError) {
    console.error('Error fetching customers:', customersError)
  }
  
  // Get customer statistics
  const { count: totalCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'customer')
  
  const { count: activeCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'customer')
    .eq('is_active', true)
  
  // Get new customers this month
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)
  
  const { count: newThisMonth } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'customer')
    .gte('created_at', startOfMonth.toISOString())
  
  // Get customers with appointments this month
  const { data: activeCustomerIds } = await supabase
    .from('appointments')
    .select('customer_id')
    .gte('start_time', startOfMonth.toISOString())
    .not('customer_id', 'is', null)
  
  const uniqueActiveCustomers = new Set(activeCustomerIds?.map(a => a.customer_id) || [])
  
  return {
    customers: customers || [],
    counts: {
      total: totalCount || 0,
      active: activeCount || 0,
      newThisMonth: newThisMonth || 0,
      withAppointments: uniqueActiveCustomers.size
    }
  }
}

export async function CustomersManagementServer() {
  const data = await getCustomersData()
  
  return <CustomersManagementClient {...data} />
}