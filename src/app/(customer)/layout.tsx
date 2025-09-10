import { requireAuth } from '@/lib/api/dal/auth'
import { USER_ROLES } from '@/lib/auth/constants'
import { redirect } from 'next/navigation'

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Any authenticated user can access customer area
  const session = await requireAuth()
  
  // Only allow customers - staff and admins should use their own dashboards
  if (session.user.role !== USER_ROLES.CUSTOMER) {
    redirect('/unauthorized')
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="flex-1 overflow-y-auto mt-16">
        <div className="container mx-auto px-4 py-6 md:px-6 md:py-8 animate-in fade-in duration-200">
          {children}
        </div>
      </main>
    </div>
  )
}