import { createClient } from '@/lib/supabase/client'
import { CustomerFavorite } from '@/types/features/favorites-types'

export async function fetchCustomerFavorites(): Promise<CustomerFavorite[]> {
  const supabase = createClient()
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    // Get customer record
    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('email', user.email!)
      .single()

    if (!customer) return []

    // Fetch favorites with related data
    const { data } = await supabase
      .from('customer_favorites')
      .select(`
        *,
        salons(*),
        services(*),
        staff_profiles(
          profiles(*)
        )
      `)
      .eq('customer_id', customer.id)
      .order('created_at', { ascending: false })

    return data || []
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching favorites:', error)
    }
    return []
  }
}

export async function removeFavorite(favoriteId: string): Promise<boolean> {
  const supabase = createClient()
  
  try {
    const { error } = await supabase
      .from('customer_favorites')
      .delete()
      .eq('id', favoriteId)

    if (error) throw error
    return true
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error removing favorite:', error)
    }
    return false
  }
}