import { getAppointments } from '../dal/appointments-queries'
import { createClient } from '@/lib/supabase/server'
import { AppointmentsPageClient } from './appointments-page-client'

export async function AppointmentsPageServer() {
  const supabase = await createClient()

  // Get current user and salon context
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  // Get salon from user's profile or team member association
  const { data: profile } = await supabase
    .from('profiles')
    .select('salon_id')
    .eq('id', user.id)
    .single()

  const salonId = profile?.salon_id

  // Get staff members for the salon
  const { data: staffList } = await supabase
    .from('profiles')
    .select('*')
    .eq('salon_id', salonId)
    .eq('role', 'staff')

  // Get services for the salon
  const { data: serviceList } = await supabase
    .from('services')
    .select('*')
    .eq('salon_id', salonId)
    .eq('is_active', true)

  // Get customers
  const { data: customerList } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'customer')
    .limit(100)

  // Get appointments with filters
  const appointments = await getAppointments({
    salon_id: salonId,
    start_date: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
  })

  return (
    <AppointmentsPageClient
      initialAppointments={appointments}
      salonId={salonId || ''}
      staffList={staffList || []}
      serviceList={serviceList || []}
      customerList={customerList || []}
    />
  )
}