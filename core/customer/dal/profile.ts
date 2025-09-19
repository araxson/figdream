import { createServerClient } from '@/lib/supabase/server'
import type { CustomerProfile, CustomerPreferences, ProfileFormData, PreferencesFormData } from '../types'

export async function getCustomerProfile(userId: string): Promise<CustomerProfile | null> {
  const supabase = createServerClient()

  // Verify authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== userId) {
    throw new Error('Unauthorized')
  }

  const { data, error } = await supabase
    .from('profiles')
    .select(`
      id,
      user_id,
      first_name,
      last_name,
      email,
      phone,
      date_of_birth,
      profile_image_url,
      address,
      preferences,
      created_at,
      updated_at
    `)
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    return null
  }

  return {
    id: data.id,
    userId: data.user_id,
    firstName: data.first_name || '',
    lastName: data.last_name || '',
    email: data.email || '',
    phone: data.phone,
    dateOfBirth: data.date_of_birth ? new Date(data.date_of_birth) : undefined,
    profileImageUrl: data.profile_image_url,
    address: data.address,
    preferences: data.preferences || getDefaultPreferences(),
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  }
}

export async function updateCustomerProfile(
  userId: string,
  profileData: ProfileFormData
): Promise<CustomerProfile> {
  const supabase = createServerClient()

  // Verify authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== userId) {
    throw new Error('Unauthorized')
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({
      first_name: profileData.firstName,
      last_name: profileData.lastName,
      email: profileData.email,
      phone: profileData.phone,
      date_of_birth: profileData.dateOfBirth,
      address: profileData.address,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update profile: ${error.message}`)
  }

  return {
    id: data.id,
    userId: data.user_id,
    firstName: data.first_name || '',
    lastName: data.last_name || '',
    email: data.email || '',
    phone: data.phone,
    dateOfBirth: data.date_of_birth ? new Date(data.date_of_birth) : undefined,
    profileImageUrl: data.profile_image_url,
    address: data.address,
    preferences: data.preferences || getDefaultPreferences(),
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  }
}

export async function updateCustomerPreferences(
  userId: string,
  preferences: PreferencesFormData
): Promise<CustomerPreferences> {
  const supabase = createServerClient()

  // Verify authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== userId) {
    throw new Error('Unauthorized')
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({
      preferences,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .select('preferences')
    .single()

  if (error) {
    throw new Error(`Failed to update preferences: ${error.message}`)
  }

  return data.preferences
}

export async function uploadProfileImage(
  userId: string,
  file: File
): Promise<string> {
  const supabase = createServerClient()

  // Verify authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== userId) {
    throw new Error('Unauthorized')
  }

  // Upload image to storage
  const fileName = `${userId}-${Date.now()}.${file.name.split('.').pop()}`
  const filePath = `profiles/${fileName}`

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (uploadError) {
    throw new Error(`Failed to upload image: ${uploadError.message}`)
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath)

  // Update profile with new image URL
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      profile_image_url: publicUrl,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)

  if (updateError) {
    throw new Error(`Failed to update profile image: ${updateError.message}`)
  }

  return publicUrl
}

export async function deleteCustomerAccount(userId: string): Promise<void> {
  const supabase = createServerClient()

  // Verify authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== userId) {
    throw new Error('Unauthorized')
  }

  // Soft delete by setting deleted_at
  const { error } = await supabase
    .from('profiles')
    .update({
      deleted_at: new Date().toISOString()
    })
    .eq('user_id', userId)

  if (error) {
    throw new Error(`Failed to delete account: ${error.message}`)
  }
}

function getDefaultPreferences(): CustomerPreferences {
  return {
    language: 'en',
    timezone: 'America/New_York',
    communication: {
      email: true,
      sms: true,
      push: true
    },
    notifications: {
      bookingReminders: true,
      promotions: false,
      reviews: true,
      cancellations: true
    },
    booking: {
      preferredTimeSlots: [],
      preferredStaff: [],
      notes: ''
    }
  }
}