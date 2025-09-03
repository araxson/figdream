import { protectRouteWithRole, getCurrentUser } from '@/lib/data-access/auth'
import { createClient } from '@/lib/database/supabase/server'
import { SidebarProvider } from '@/components/ui'
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
    redirect('/profile')
  }
  
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <LocationManagerSidebar user={user} profile={profile} />
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto py-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}