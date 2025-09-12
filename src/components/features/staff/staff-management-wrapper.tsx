import { createClient } from '@/lib/supabase/server'
import { StaffManagementClient } from './staff-management-client'

interface StaffManagementWrapperProps {
  salonId?: string  // Optional - if not provided, will get from user's context
  isAdminView?: boolean
}

export async function StaffManagementWrapper({ 
  salonId, 
  isAdminView = false 
}: StaffManagementWrapperProps) {
  const supabase = await createClient()
  
  let actualSalonId = salonId
  
  // If no salonId provided (management view), get it from user's context
  if (!actualSalonId) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    
    // Get user's salon based on their role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (profile?.role === 'salon_owner') {
      const { data: salon } = await supabase
        .from('salons')
        .select('id')
        .eq('owner_id', user.id)
        .single()
      
      actualSalonId = salon?.id
    } else if (profile?.role === 'salon_manager' || profile?.role === 'staff') {
      const { data: staffMember } = await supabase
        .from('staff_members')
        .select('salon_id')
        .eq('user_id', user.id)
        .single()
      
      actualSalonId = staffMember?.salon_id
    }
  }
  
  if (!actualSalonId) {
    return <div>No salon found</div>
  }
  
  // Fetch staff data for this salon
  const { data: staffMembers, error } = await supabase
    .from('staff_members')
    .select(`
      *,
      user:profiles(
        id,
        email,
        full_name,
        avatar_url
      )
    `)
    .eq('salon_id', actualSalonId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching staff:', error)
  }
  
  // Get staff statistics
  const { count: totalStaff } = await supabase
    .from('staff_members')
    .select('*', { count: 'exact', head: true })
    .eq('salon_id', actualSalonId)
  
  const { count: activeStaff } = await supabase
    .from('staff_members')
    .select('*', { count: 'exact', head: true })
    .eq('salon_id', actualSalonId)
    .eq('is_active', true)
  
  return (
    <StaffManagementClient
      staffMembers={staffMembers || []}
      salonId={actualSalonId}
      isAdminView={isAdminView}
      stats={{
        total: totalStaff || 0,
        active: activeStaff || 0
      }}
    />
  )
}