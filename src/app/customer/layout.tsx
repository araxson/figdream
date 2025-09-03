import { protectRouteWithRole, getCurrentUser } from '@/lib/data-access/auth'
import { getCustomerByUserId } from '@/lib/data-access/customers'
import { SidebarProvider } from '@/components/ui'
import { CustomerSidebar } from '@/components/customer'
import { redirect } from 'next/navigation'

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Protect route with customer role requirement
  await protectRouteWithRole('customer')
  
  // Get current user and customer data
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login/customer')
  }
  
  const customer = await getCustomerByUserId(user.id)
  if (!customer) {
    redirect('/register/customer')
  }
  
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <CustomerSidebar user={user} customer={customer} />
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto py-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}