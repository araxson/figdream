import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

/**
 * Gets the current salon context for the user
 * - For Super Admin: Returns the salon they're managing (from cookie)
 * - For Salon Owner: Returns their own salon
 * - For Manager/Staff: Returns their assigned salon
 */
export async function getCurrentSalonContext() {
  const supabase = await createClient()
  const cookieStore = cookies()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  
  // Get user profile with role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (!profile) return null
  
  // For Super Admin, check if they're managing a specific salon
  if (profile.role === 'super_admin') {
    const adminSalonContext = cookieStore.get('admin_salon_context')
    if (adminSalonContext?.value) {
      const { data: salon } = await supabase
        .from('salons')
        .select('id, name, logo, address')
        .eq('id', adminSalonContext.value)
        .single()
      
      return {
        salonId: salon?.id || null,
        salonName: salon?.name || null,
        isManagingAsAdmin: true
      }
    }
    // Super admin not managing any specific salon
    return null
  }
  
  // For Salon Owner, get their salon
  if (profile.role === 'salon_owner') {
    const { data: salon } = await supabase
      .from('salons')
      .select('id, name, logo, address')
      .eq('owner_id', user.id)
      .single()
    
    return {
      salonId: salon?.id || null,
      salonName: salon?.name || null,
      isManagingAsAdmin: false
    }
  }
  
  // For Manager/Staff, get their assigned salon
  if (profile.role === 'salon_manager' || profile.role === 'staff') {
    const { data: staffMember } = await supabase
      .from('staff_members')
      .select(`
        salon_id,
        salons(id, name, logo, address)
      `)
      .eq('user_id', user.id)
      .single()
    
    return {
      salonId: staffMember?.salon_id || null,
      salonName: staffMember?.salons?.name || null,
      isManagingAsAdmin: false
    }
  }
  
  return null
}

export function clearAdminSalonContext() {
  const cookieStore = cookies()
  cookieStore.delete('admin_salon_context')
}