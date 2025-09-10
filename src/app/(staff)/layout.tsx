import { requireRole } from '@/lib/api/dal/auth'
import { STAFF_ROLES } from '@/lib/auth/constants'
import { AppSidebarStaff } from '@/components/shared/layouts/app-sidebar-staff'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Use DAL function for consistent auth checking - staff and higher roles can access
  const session = await requireRole(STAFF_ROLES)
  
  const userData = {
    name: session.user.email?.split('@')[0] || 'Staff',
    email: session.user.email || '',
    avatar: undefined // Avatar can be added if stored in profiles
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background w-full">
        <AppSidebarStaff user={userData} />
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <span className="font-semibold">Staff Portal</span>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto bg-background">
            <div className="container mx-auto p-4 md:p-6 lg:p-8 animate-in fade-in duration-200">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}