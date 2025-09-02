import { createClient } from '@/lib/database/supabase/server'
import { redirect } from 'next/navigation'
import LocationForm from '@/components/salon-owner/locations/location-form'

export default async function NewLocationPage() {
  const supabase = await createClient()
  
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Get user's salon
  const { data: userRole } = await supabase
    .from('user_roles')
    .select('salon_id')
    .eq('user_id', user.id)
    .single()

  if (!userRole?.salon_id) {
    redirect('/401')
  }

  // Get salon details
  const { data: salon } = await supabase
    .from('salons')
    .select('id, name')
    .eq('id', userRole.salon_id)
    .single()

  if (!salon) {
    redirect('/401')
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Add New Location</h1>
        <p className="text-muted-foreground mt-1">
          Add a new location for {salon.name}
        </p>
      </div>

      <LocationForm salonId={salon.id} />
    </div>
  )
}