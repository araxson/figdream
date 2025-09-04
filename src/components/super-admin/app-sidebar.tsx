'use client'
import { AppSidebar, superAdminSidebarConfig, type SidebarUserInfo } from '@/components/shared'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

interface SuperAdminSidebarProps {
  user: SupabaseUser
  profile?: Profile
}

export function SuperAdminSidebar({ user, profile }: SuperAdminSidebarProps) {
  const userInfo: SidebarUserInfo = {
    name: profile?.full_name || 'Super Administrator',
    email: user.email || '',
    role: 'super_admin'
  }
  
  return (
    <AppSidebar 
      config={superAdminSidebarConfig}
      user={userInfo}
    />
  )
}