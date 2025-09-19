// Ultra-thin dashboard page
import { Dashboard } from '@/core/dashboard/components'
import { fetchDashboardData } from '@/core/dashboard/actions'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Get user's salon
  const { data: userRole } = await supabase
    .from('user_roles')
    .select('salon_id')
    .eq('user_id', user.id)
    .single()

  if (!userRole?.salon_id) {
    // User doesn't have a salon assigned
    redirect('/onboarding')
  }

  // Fetch dashboard data
  const { metrics, revenue, appointments, staff } = await fetchDashboardData(userRole.salon_id)

  return (
    <Dashboard
      salonId={userRole.salon_id}
      initialMetrics={metrics}
      initialRevenue={revenue}
      initialAppointments={appointments}
      initialStaff={staff}
    />
  )
}