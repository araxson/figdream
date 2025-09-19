import { createClient } from '@/lib/supabase/server'
import type { CustomerFavorite } from '../types'

export async function getCustomerFavorites(userId: string): Promise<CustomerFavorite[]> {
  const supabase = createClient()

  // Verify authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== userId) {
    throw new Error('Unauthorized')
  }

  const { data, error } = await supabase
    .from('customer_favorites')
    .select(`
      id,
      customer_id,
      favorite_type,
      salon_id,
      staff_id,
      service_id,
      notes,
      created_at,
      salons(name, logo_url),
      staff_profiles(
        profiles(first_name, last_name),
        profile_image_url,
        salon_id,
        salons(name)
      ),
      services(name, salon_id, salons(name))
    `)
    .eq('customer_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch favorites: ${error.message}`)
  }

  return data?.map(favorite => {
    let itemName = ''
    let itemImageUrl: string | undefined
    let salonId: string | undefined
    let salonName: string | undefined
    let itemId = ''

    switch (favorite.favorite_type) {
      case 'salon':
        itemId = favorite.salon_id!
        itemName = favorite.salons?.name || ''
        itemImageUrl = favorite.salons?.logo_url
        salonId = favorite.salon_id!
        salonName = favorite.salons?.name
        break
      case 'staff':
        itemId = favorite.staff_id!
        itemName = `${favorite.staff_profiles?.profiles?.first_name || ''} ${favorite.staff_profiles?.profiles?.last_name || ''}`.trim()
        itemImageUrl = favorite.staff_profiles?.profile_image_url
        salonId = favorite.staff_profiles?.salon_id
        salonName = favorite.staff_profiles?.salons?.name
        break
      case 'service':
        itemId = favorite.service_id!
        itemName = favorite.services?.name || ''
        salonId = favorite.services?.salon_id
        salonName = favorite.services?.salons?.name
        break
    }

    return {
      id: favorite.id,
      customerId: favorite.customer_id,
      type: favorite.favorite_type,
      itemId,
      itemName,
      itemImageUrl,
      salonId,
      salonName,
      notes: favorite.notes,
      createdAt: new Date(favorite.created_at)
    }
  }) || []
}

export async function addToFavorites(
  userId: string,
  type: 'salon' | 'staff' | 'service',
  itemId: string,
  notes?: string
): Promise<CustomerFavorite> {
  const supabase = createClient()

  // Verify authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== userId) {
    throw new Error('Unauthorized')
  }

  // Check if already favorited
  const { data: existing } = await supabase
    .from('customer_favorites')
    .select('id')
    .eq('customer_id', userId)
    .eq('favorite_type', type)
    .eq(`${type}_id`, itemId)
    .single()

  if (existing) {
    throw new Error('Item is already in favorites')
  }

  // Add to favorites
  const insertData: any = {
    customer_id: userId,
    favorite_type: type,
    notes
  }

  insertData[`${type}_id`] = itemId

  const { data, error } = await supabase
    .from('customer_favorites')
    .insert(insertData)
    .select(`
      id,
      customer_id,
      favorite_type,
      salon_id,
      staff_id,
      service_id,
      notes,
      created_at
    `)
    .single()

  if (error) {
    throw new Error(`Failed to add to favorites: ${error.message}`)
  }

  // Get item details for response
  let itemName = ''
  let itemImageUrl: string | undefined
  let salonId: string | undefined
  let salonName: string | undefined

  if (type === 'salon') {
    const { data: salon } = await supabase
      .from('salons')
      .select('name, logo_url')
      .eq('id', itemId)
      .single()

    itemName = salon?.name || ''
    itemImageUrl = salon?.logo_url
    salonId = itemId
    salonName = salon?.name
  } else if (type === 'staff') {
    const { data: staff } = await supabase
      .from('staff_profiles')
      .select('profiles(first_name, last_name), profile_image_url, salon_id, salons(name)')
      .eq('id', itemId)
      .single()

    itemName = `${staff?.profiles?.first_name || ''} ${staff?.profiles?.last_name || ''}`.trim()
    itemImageUrl = staff?.profile_image_url
    salonId = staff?.salon_id
    salonName = staff?.salons?.name
  } else if (type === 'service') {
    const { data: service } = await supabase
      .from('services')
      .select('name, salon_id, salons(name)')
      .eq('id', itemId)
      .single()

    itemName = service?.name || ''
    salonId = service?.salon_id
    salonName = service?.salons?.name
  }

  return {
    id: data.id,
    customerId: data.customer_id,
    type: data.favorite_type,
    itemId,
    itemName,
    itemImageUrl,
    salonId,
    salonName,
    notes: data.notes,
    createdAt: new Date(data.created_at)
  }
}

export async function removeFromFavorites(
  userId: string,
  favoriteId: string
): Promise<void> {
  const supabase = createClient()

  // Verify authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== userId) {
    throw new Error('Unauthorized')
  }

  const { error } = await supabase
    .from('customer_favorites')
    .delete()
    .eq('id', favoriteId)
    .eq('customer_id', userId)

  if (error) {
    throw new Error(`Failed to remove from favorites: ${error.message}`)
  }
}

export async function updateFavoriteNotes(
  userId: string,
  favoriteId: string,
  notes: string
): Promise<void> {
  const supabase = createClient()

  // Verify authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== userId) {
    throw new Error('Unauthorized')
  }

  const { error } = await supabase
    .from('customer_favorites')
    .update({ notes })
    .eq('id', favoriteId)
    .eq('customer_id', userId)

  if (error) {
    throw new Error(`Failed to update notes: ${error.message}`)
  }
}

export async function isFavorite(
  userId: string,
  type: 'salon' | 'staff' | 'service',
  itemId: string
): Promise<boolean> {
  const supabase = createClient()

  // Verify authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== userId) {
    return false
  }

  const { data, error } = await supabase
    .from('customer_favorites')
    .select('id')
    .eq('customer_id', userId)
    .eq('favorite_type', type)
    .eq(`${type}_id`, itemId)
    .single()

  return !error && !!data
}

export async function getFavoritesByType(
  userId: string,
  type: 'salon' | 'staff' | 'service'
): Promise<CustomerFavorite[]> {
  const supabase = createClient()

  // Verify authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== userId) {
    throw new Error('Unauthorized')
  }

  const { data, error } = await supabase
    .from('customer_favorites')
    .select(`
      id,
      customer_id,
      favorite_type,
      salon_id,
      staff_id,
      service_id,
      notes,
      created_at,
      salons(name, logo_url, rating_average, rating_count),
      staff_profiles(
        profiles(first_name, last_name),
        profile_image_url,
        rating_average,
        rating_count,
        salon_id,
        salons(name)
      ),
      services(name, base_price, salon_id, salons(name))
    `)
    .eq('customer_id', userId)
    .eq('favorite_type', type)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch ${type} favorites: ${error.message}`)
  }

  return data?.map(favorite => {
    let itemName = ''
    let itemImageUrl: string | undefined
    let salonId: string | undefined
    let salonName: string | undefined
    let rating: number | undefined
    let itemId = ''

    switch (type) {
      case 'salon':
        itemId = favorite.salon_id!
        itemName = favorite.salons?.name || ''
        itemImageUrl = favorite.salons?.logo_url
        salonId = favorite.salon_id!
        salonName = favorite.salons?.name
        rating = favorite.salons?.rating_average
        break
      case 'staff':
        itemId = favorite.staff_id!
        itemName = `${favorite.staff_profiles?.profiles?.first_name || ''} ${favorite.staff_profiles?.profiles?.last_name || ''}`.trim()
        itemImageUrl = favorite.staff_profiles?.profile_image_url
        salonId = favorite.staff_profiles?.salon_id
        salonName = favorite.staff_profiles?.salons?.name
        rating = favorite.staff_profiles?.rating_average
        break
      case 'service':
        itemId = favorite.service_id!
        itemName = favorite.services?.name || ''
        salonId = favorite.services?.salon_id
        salonName = favorite.services?.salons?.name
        break
    }

    return {
      id: favorite.id,
      customerId: favorite.customer_id,
      type: favorite.favorite_type,
      itemId,
      itemName,
      itemImageUrl,
      salonId,
      salonName,
      rating,
      notes: favorite.notes,
      createdAt: new Date(favorite.created_at)
    }
  }) || []
}