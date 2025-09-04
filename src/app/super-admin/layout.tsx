import { protectRouteWithRole, getCurrentUser } from '@/lib/data-access/auth'
import { createClient } from '@/lib/database/supabase/server'
import { DashboardLayout } from '@/components/shared'
import { SuperAdminSidebar } from '@/components/super-admin/app-sidebar'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Protect route with super_admin role requirement
  await protectRouteWithRole('super_admin')
  
  // Get current user
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login/super-admin')
  }
  
  // Get profile data
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  return (
    <DashboardLayout
      sidebar={<SuperAdminSidebar user={user} profile={profile} />}
    >
      {children}
    </DashboardLayout>
  )
}