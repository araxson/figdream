import { protectRouteWithRole, getCurrentUser } from '@/lib/data-access/auth'
import { getStaffByUserId } from '@/lib/data-access/staff'
import { createClient } from '@/lib/database/supabase/server'
import { SidebarProvider } from '@/components/ui'
import { StaffSidebar } from '@/components/staff'
import { redirect } from 'next/navigation'

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Protect route with staff role requirement
  await protectRouteWithRole('staff')
  
  // Get current user
  const authUser = await getCurrentUser()
  if (!authUser) {
    redirect('/login/staff')
  }
  
  // Get profile data
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authUser.id)
    .single()
  
  if (!profile) {
    redirect('/profile')
  }
  
  // Get staff data
  const staff = await getStaffByUserId(authUser.id)
  if (!staff) {
    redirect('/register/staff')
  }
  
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <StaffSidebar user={profile} staff={staff} />
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto py-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}