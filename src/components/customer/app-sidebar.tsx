'use client'

import { AppSidebar, customerSidebarConfig, type SidebarUserInfo } from '@/components/shared'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

type Customer = Database['public']['Tables']['customers']['Row']

interface CustomerSidebarProps {
  user: SupabaseUser
  customer: Customer
}

export function CustomerSidebar({ user, customer }: CustomerSidebarProps) {
  const userInfo: SidebarUserInfo = {
    name: customer.profiles?.full_name || 'Customer',
    email: customer.profiles?.email || user.email || '',
    role: 'customer'
  }

  return (
    <AppSidebar 
      config={customerSidebarConfig}
      user={userInfo}
    />
  )
}