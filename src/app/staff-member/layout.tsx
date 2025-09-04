import { protectRouteWithRole, getCurrentUser } from '@/lib/data-access/auth'
import { getStaffByUserId } from '@/lib/data-access/staff'
import { DashboardLayout } from '@/components/shared'
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
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login/staff')
  }
  
  // Get staff data
  const staff = await getStaffByUserId(user.id)
  if (!staff) {
    redirect('/register/staff')
  }
  
  return (
    <DashboardLayout
      sidebar={<StaffSidebar user={user} staff={staff} />}
    >
      {children}
    </DashboardLayout>
  )
}