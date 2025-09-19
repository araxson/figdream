'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import {
  getCustomerProfile,
  updateCustomerProfile,
  updateCustomerPreferences,
  uploadProfileImage,
  searchSalons,
  getSalonBookingData,
  getAvailableTimeSlots,
  createBooking,
  cancelBooking,
  rescheduleBooking,
  getCustomerAppointments,
  getCustomerFavorites,
  addToFavorites,
  removeFromFavorites,
  getCustomerLoyaltyPrograms,
  joinLoyaltyProgram,
  redeemReward,
  submitReview,
  updateReview,
  deleteReview,
  getCustomerNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  updateNotificationPreferences
} from '../dal'
import type {
  ProfileFormData,
  PreferencesFormData,
  SalonSearchFilters,
  BookingFormData,
  ReviewSubmission
} from '../types'

// Profile Actions
export async function updateProfileAction(formData: FormData) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const profileData: ProfileFormData = {
    firstName: formData.get('firstName') as string,
    lastName: formData.get('lastName') as string,
    email: formData.get('email') as string,
    phone: formData.get('phone') as string || undefined,
    dateOfBirth: formData.get('dateOfBirth') as string || undefined,
    address: {
      street: formData.get('street') as string,
      city: formData.get('city') as string,
      state: formData.get('state') as string,
      postalCode: formData.get('postalCode') as string,
      country: 'US'
    }
  }

  await updateCustomerProfile(user.id, profileData)
  revalidatePath('/customer/profile')
  return { success: true }
}

export async function updatePreferencesAction(formData: FormData) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const preferencesData: PreferencesFormData = {
    language: formData.get('language') as string,
    timezone: formData.get('timezone') as string,
    communication: {
      email: formData.get('emailComm') === 'true',
      sms: formData.get('smsComm') === 'true',
      push: formData.get('pushComm') === 'true'
    },
    notifications: {
      bookingReminders: formData.get('bookingReminders') === 'true',
      promotions: formData.get('promotions') === 'true',
      reviews: formData.get('reviews') === 'true',
      cancellations: formData.get('cancellations') === 'true'
    },
    booking: {
      preferredTimeSlots: (formData.get('timeSlots') as string)?.split(',') || [],
      preferredStaff: (formData.get('preferredStaff') as string)?.split(',') || [],
      notes: formData.get('bookingNotes') as string || undefined
    }
  }

  await updateCustomerPreferences(user.id, preferencesData)
  revalidatePath('/customer/profile')
  return { success: true }
}

export async function uploadProfileImageAction(formData: FormData) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const file = formData.get('image') as File
  if (!file) {
    throw new Error('No file provided')
  }

  const imageUrl = await uploadProfileImage(user.id, file)
  revalidatePath('/customer/profile')
  return { success: true, imageUrl }
}

// Booking Actions
export async function createBookingAction(formData: FormData) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const bookingData: BookingFormData = {
    salonId: formData.get('salonId') as string,
    services: JSON.parse(formData.get('services') as string),
    staffId: formData.get('staffId') as string || undefined,
    date: formData.get('date') as string,
    time: formData.get('time') as string,
    notes: formData.get('notes') as string || undefined,
    paymentMethodId: formData.get('paymentMethodId') as string || undefined
  }

  const appointmentId = await createBooking(user.id, bookingData)
  revalidatePath('/customer/appointments')
  redirect(`/customer/appointments/${appointmentId}`)
}

export async function cancelBookingAction(appointmentId: string, reason?: string) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  await cancelBooking(user.id, appointmentId, reason)
  revalidatePath('/customer/appointments')
  return { success: true }
}

export async function rescheduleBookingAction(
  appointmentId: string,
  newDate: string,
  newTime: string
) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  await rescheduleBooking(user.id, appointmentId, newDate, newTime)
  revalidatePath('/customer/appointments')
  return { success: true }
}

// Favorites Actions
export async function addToFavoritesAction(
  type: 'salon' | 'staff' | 'service',
  itemId: string,
  notes?: string
) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  await addToFavorites(user.id, type, itemId, notes)
  revalidatePath('/customer/favorites')
  return { success: true }
}

export async function removeFromFavoritesAction(favoriteId: string) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  await removeFromFavorites(user.id, favoriteId)
  revalidatePath('/customer/favorites')
  return { success: true }
}

// Loyalty Actions
export async function joinLoyaltyProgramAction(programId: string) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  await joinLoyaltyProgram(user.id, programId)
  revalidatePath('/customer/loyalty')
  return { success: true }
}

export async function redeemRewardAction(programId: string, rewardId: string) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  await redeemReward(user.id, programId, rewardId)
  revalidatePath('/customer/loyalty')
  return { success: true }
}

// Review Actions
export async function submitReviewAction(formData: FormData) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const reviewData: ReviewSubmission = {
    appointmentId: formData.get('appointmentId') as string,
    salonId: formData.get('salonId') as string,
    staffId: formData.get('staffId') as string || undefined,
    serviceIds: JSON.parse(formData.get('serviceIds') as string),
    overallRating: parseInt(formData.get('overallRating') as string),
    ratings: {
      service: parseInt(formData.get('serviceRating') as string),
      staff: parseInt(formData.get('staffRating') as string),
      atmosphere: parseInt(formData.get('atmosphereRating') as string),
      cleanliness: parseInt(formData.get('cleanlinessRating') as string),
      value: parseInt(formData.get('valueRating') as string)
    },
    title: formData.get('title') as string || undefined,
    comment: formData.get('comment') as string,
    isRecommended: formData.get('isRecommended') === 'true',
    tags: (formData.get('tags') as string)?.split(',') || undefined
  }

  await submitReview(user.id, reviewData)
  revalidatePath('/customer/reviews')
  return { success: true }
}

export async function updateReviewAction(reviewId: string, formData: FormData) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const updates: Partial<ReviewSubmission> = {
    overallRating: parseInt(formData.get('overallRating') as string),
    ratings: {
      service: parseInt(formData.get('serviceRating') as string),
      staff: parseInt(formData.get('staffRating') as string),
      atmosphere: parseInt(formData.get('atmosphereRating') as string),
      cleanliness: parseInt(formData.get('cleanlinessRating') as string),
      value: parseInt(formData.get('valueRating') as string)
    },
    title: formData.get('title') as string || undefined,
    comment: formData.get('comment') as string,
    isRecommended: formData.get('isRecommended') === 'true'
  }

  await updateReview(user.id, reviewId, updates)
  revalidatePath('/customer/reviews')
  return { success: true }
}

export async function deleteReviewAction(reviewId: string) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  await deleteReview(user.id, reviewId)
  revalidatePath('/customer/reviews')
  return { success: true }
}

// Notification Actions
export async function markNotificationReadAction(notificationId: string) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  await markNotificationAsRead(user.id, notificationId)
  revalidatePath('/customer')
  return { success: true }
}

export async function markAllNotificationsReadAction() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  await markAllNotificationsAsRead(user.id)
  revalidatePath('/customer')
  return { success: true }
}