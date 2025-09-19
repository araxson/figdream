// Example integrated root layout using the comprehensive integration layer
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AppShell } from '@/core/integration'
import { validateSession } from '@/core/integration'
import '@/app/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FigDream - Salon Booking Platform',
  description: 'Enterprise multi-tenant salon booking and management platform',
}

export default async function IntegratedRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Validate session and get user role
  const session = await validateSession()

  let userRole = 'guest'

  if (session.isValid && session.userId) {
    // Get user profile to determine role
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()

    const { data: userRoleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.userId)
      .single()

    if (userRoleData && userRoleData.role) {
      userRole = userRoleData.role
    }
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AppShell role={userRole}>
          {children}
        </AppShell>
      </body>
    </html>
  )
}