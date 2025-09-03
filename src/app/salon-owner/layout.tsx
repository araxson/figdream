import { protectRouteWithRole } from '@/lib/data-access/auth'
import { SidebarProvider } from '@/components/ui'
import { AppSidebar } from '@/components/salon-owner/app-sidebar'

export default async function SalonLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Protect route with salon_owner role requirement
  await protectRouteWithRole('salon_owner')
  
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto py-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}