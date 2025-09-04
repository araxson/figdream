'use client'
import { AppSidebar as SharedAppSidebar, salonOwnerSidebarConfig, type SidebarUserInfo } from '@/components/shared'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']
type Salon = Database['public']['Tables']['salons']['Row'] | null

interface AppSidebarProps {
  user?: SupabaseUser
  profile?: Profile
  salon?: Salon
}

export function AppSidebar({ user, profile, salon }: AppSidebarProps = {}) {
  const userInfo: SidebarUserInfo = {
    name: profile?.full_name || profile?.salon_name || 'Salon Owner',
    email: user?.email || profile?.email || '',
    role: 'salon_owner'
  }
  
  // Customize the config with salon name if available
  const customConfig = {
    ...salonOwnerSidebarConfig,
    subtitle: salon?.name || profile?.salon_name || salonOwnerSidebarConfig.subtitle
  }
  
  return (
    <SharedAppSidebar 
      config={customConfig}
      user={userInfo}
    />
  )
}