'use client'
import { AppSidebar, staffSidebarConfig, type SidebarUserInfo } from '@/components/shared'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

type StaffProfile = Database['public']['Tables']['staff_profiles']['Row'] & {
  salons?: {
    name: string
  } | null
  profiles?: {
    full_name: string | null
    email: string | null
  } | null
}
interface StaffSidebarProps {
  user: SupabaseUser
  staff: StaffProfile
}

export function StaffSidebar({ user, staff }: StaffSidebarProps) {
  const userInfo: SidebarUserInfo = {
    name: staff.profiles?.full_name || 'Staff Member',
    email: staff.profiles?.email || user.email || '',
    role: 'staff_member'
  }
  
  // Override the subtitle with salon name if available
  const customConfig = {
    ...staffSidebarConfig,
    subtitle: staff.salons?.name || staffSidebarConfig.subtitle
  }
  
  return (
    <AppSidebar 
      config={customConfig}
      user={userInfo}
    />
  )
}