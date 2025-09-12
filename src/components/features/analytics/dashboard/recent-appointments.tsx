'use client'

import { AppointmentList } from '@/components/features/appointments/appointment-list'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { UserRole } from '@/lib/auth/constants'

export function RecentAppointments() {
  const [userRole, setUserRole] = useState<UserRole>('customer')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getUserRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        
        if (profile?.role) {
          setUserRole(profile.role as UserRole)
        }
      } finally {
        setLoading(false)
      }
    }
    
    getUserRole()
  }, [supabase])

  if (loading) {
    return null
  }

  return (
    <AppointmentList 
      userRole={userRole}
      view="past"
      displayMode="card"
      limit={5}
    />
  )
}