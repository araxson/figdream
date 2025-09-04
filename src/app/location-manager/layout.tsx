import { protectRouteWithRole, getCurrentUser } from '@/lib/data-access/auth'
import { createClient } from '@/lib/database/supabase/server'
import { DashboardLayout } from '@/components/shared'
import { LocationManagerSidebar } from '@/components/location-manager'
import { redirect } from 'next/navigation'

export default async function LocationManagerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Protect route with location_manager role requirement
  await protectRouteWithRole('location_manager')
  
  // Get current user and profile data
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }
  
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  if (!profile) {
    redirect('/location-manager/profile')
  }
  
  // Optionally get location data
  const { data: location } = await supabase
    .from('locations')
    .select('*')
    .eq('manager_id', user.id)
    .single()
  
  return (
    <DashboardLayout
      sidebar={<LocationManagerSidebar user={user} profile={profile} location={location} />}
    >
      {children}
    </DashboardLayout>
  )
}