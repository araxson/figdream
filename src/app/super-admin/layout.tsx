import { protectRouteWithRole } from '@/lib/data-access/auth'
import { getUserWithRole } from '@/lib/data-access/auth/verify'
import { SidebarProvider } from '@/components/ui'
import { SuperAdminSidebar as AppSidebar } from '@/components/super-admin/app-sidebar'
import type { Database } from '@/types/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Protect route with super_admin role requirement
  await protectRouteWithRole('super_admin')
  
  // Get the user profile
  const { user } = await getUserWithRole()
  
  if (!user) {
    // This shouldn't happen as protectRouteWithRole should redirect
    // but TypeScript doesn't know that
    return null
  }
  
  // Remove the role property that was added by getUserWithRole
  const { role: _role, ...profile } = user
  
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar user={profile as Profile} />
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto py-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}