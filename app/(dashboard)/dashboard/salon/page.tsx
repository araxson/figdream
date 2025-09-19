import { SalonDashboard } from '@/core/salon/dashboard/components'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function SalonDashboardPage() {
  const supabase = await createClient()

  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Get user's salon - for now we'll use a placeholder
  // In production, this would fetch the salon ID from user profile or context
  const salonId = 'placeholder-salon-id' // This should come from user context/profile

  return <SalonDashboard salonId={salonId} />
}