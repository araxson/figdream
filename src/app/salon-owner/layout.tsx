import { protectRouteWithRole, getCurrentUser } from '@/lib/data-access/auth'
import { createClient } from '@/lib/database/supabase/server'
import { DashboardLayout } from '@/components/shared'
import { AppSidebar } from '@/components/salon-owner/navigation/app-sidebar'
import { redirect } from 'next/navigation'

export default async function SalonLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Protect route with salon_owner role requirement
  await protectRouteWithRole('salon_owner')
  
  // Get current user and profile data
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login/salon-owner')
  }
  
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  // Get salon data
  const { data: salon } = await supabase
    .from('salons')
    .select('*')
    .eq('owner_id', user.id)
    .single()
  
  return (
    <DashboardLayout
      sidebar={<AppSidebar user={user} profile={profile} salon={salon} />}
    >
      {children}
    </DashboardLayout>
  )
}