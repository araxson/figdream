// Dashboard layout
import { Sidebar } from '@/core/layouts/components/sidebar'
import { Header } from '@/core/layouts/components'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { salonOwnerNavigation } from '@/core/layouts/config/navigation/salon-owner'
import { salonManagerNavigation } from '@/core/layouts/config/navigation/salon-manager'
import type { RoleType } from '@/core/shared/types/enums.types'

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Check user role
  const { data: userRole } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  // Only allow salon owners and managers
  const role = userRole?.role
  if (!role || !['salon_owner', 'salon_manager'].includes(role)) {
    redirect('/unauthorized')
  }

  // Get navigation items based on role
  const navigationItems = role === 'salon_owner' ? salonOwnerNavigation : salonManagerNavigation

  return (
    <div className="h-full relative">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-50">
        <Sidebar
          items={navigationItems}
          isCollapsed={false}
          onToggleCollapse={() => {}}
          userRole={role}
        />
      </div>
      <main className="md:pl-72 h-full">
        <Header
          userRole={role}
          userName={user.user_metadata?.full_name || user.email || 'User'}
          userEmail={user.email || ''}
        />
        {children}
      </main>
    </div>
  )
}