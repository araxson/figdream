import { createClient } from '@/lib/supabase/server'

export async function getMyAppointments() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      customer:profiles!appointments_customer_id_fkey (first_name, last_name),
      staff:staff_profiles!appointments_staff_id_fkey (
        user:profiles!staff_profiles_user_id_fkey (first_name, last_name)
      ),
      appointment_services (
        services (name, price)
      )
    `)
    .eq('customer_id', user.id)
    .order('start_time', { ascending: false })
  
  if (error) {
    console.error('Error fetching appointments:', error)
    return []
  }
  
  return data || []
}

export async function getAppointments() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      customer:profiles!appointments_customer_id_fkey (first_name, last_name),
      staff:staff_profiles!appointments_staff_id_fkey (
        user:profiles!staff_profiles_user_id_fkey (first_name, last_name)
      ),
      appointment_services (
        services (name, price)
      )
    `)
    .order('start_time', { ascending: false })
  
  if (error) {
    console.error('Error fetching appointments:', error)
    return []
  }
  
  return data || []
}