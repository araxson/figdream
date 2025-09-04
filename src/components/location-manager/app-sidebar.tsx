'use client'
import { AppSidebar, locationManagerSidebarConfig, type SidebarUserInfo } from '@/components/shared'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']
type LocationData = Database['public']['Tables']['locations']['Row'] | null

interface LocationManagerSidebarProps {
  user: SupabaseUser
  profile: Profile
  location?: LocationData
}

export function LocationManagerSidebar({ user, profile, location }: LocationManagerSidebarProps) {
  const userInfo: SidebarUserInfo = {
    name: profile.full_name || 'Location Manager',
    email: user.email || '',
    role: 'location_manager'
  }
  
  // Customize the config with location name if available
  const customConfig = {
    ...locationManagerSidebarConfig,
    subtitle: location?.name || locationManagerSidebarConfig.subtitle
  }
  
  return (
    <AppSidebar 
      config={customConfig}
      user={userInfo}
    />
  )
}