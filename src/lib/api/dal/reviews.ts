import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/database.types';
import { verifySession } from './auth';

type ReviewInsert = Database['public']['Tables']['reviews']['Insert'];
type ReviewUpdate = Database['public']['Tables']['reviews']['Update'];


export type ReviewDTO = {
  id: string;
  appointment_id: string;
  customer_id: string;
  salon_id: string;
  staff_id: string | null;
  rating: number;
  comment: string | null;
  is_verified: boolean;
  response: string | null;
  responded_at: string | null;
  created_at: string;
  updated_at: string;
};

/**
 * Get salon reviews
 */
export const getSalonReviews = cache(async (salonId: string): Promise<ReviewDTO[]> => {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('salon_id', salonId)
    .eq('is_verified', true)
    .order('created_at', { ascending: false });
  
  if (error || !data) return [];
  
  return data.map(review => ({
    id: review.id,
    appointment_id: review.appointment_id,
    customer_id: review.customer_id,
    salon_id: review.salon_id,
    staff_id: review.staff_id,
    rating: review.rating,
    comment: review.comment,
    is_verified: review.is_verified ?? false,
    response: review.response,
    responded_at: review.responded_at,
    created_at: review.created_at,
    updated_at: review.updated_at,
  }));
});

/**
 * Get customer reviews
 */
export const getCustomerReviews = cache(async (): Promise<ReviewDTO[]> => {
  const session = await verifySession();
  if (!session) return [];
  
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('customer_id', session.user.id)
    .order('created_at', { ascending: false });
  
  if (error || !data) return [];
  
  return data.map(review => ({
    id: review.id,
    appointment_id: review.appointment_id,
    customer_id: review.customer_id,
    salon_id: review.salon_id,
    staff_id: review.staff_id,
    rating: review.rating,
    comment: review.comment,
    is_verified: review.is_verified ?? false,
    response: review.response,
    responded_at: review.responded_at,
    created_at: review.created_at,
    updated_at: review.updated_at,
  }));
});

/**
 * Create review
 */
export const createReview = async (review: Omit<ReviewInsert, 'customer_id'>): Promise<ReviewDTO | null> => {
  const session = await verifySession();
  if (!session) return null;
  
  const supabase = await createClient();
  
  // Verify customer had this appointment
  const { data: appointment } = await supabase
    .from('appointments')
    .select('customer_id, salon_id, staff_id')
    .eq('id', review.appointment_id)
    .single();
  
  if (!appointment || appointment.customer_id !== session.user.id) {
    return null;
  }
  
  const { data, error } = await supabase
    .from('reviews')
    .insert({
      ...review,
      customer_id: session.user.id,
      salon_id: appointment.salon_id,
      staff_id: appointment.staff_id,
    })
    .select()
    .single();
  
  if (error || !data) return null;
  
  return {
    id: data.id,
    appointment_id: data.appointment_id,
    customer_id: data.customer_id,
    salon_id: data.salon_id,
    staff_id: data.staff_id,
    rating: data.rating,
    comment: data.comment,
    is_verified: data.is_verified ?? false,
    response: data.response,
    responded_at: data.responded_at,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
};

/**
 * Update review
 */
export const updateReview = async (reviewId: string, updates: Partial<ReviewUpdate>): Promise<ReviewDTO | null> => {
  const session = await verifySession();
  if (!session) return null;
  
  const supabase = await createClient();
  
  // Check ownership
  const { data: existingReview } = await supabase
    .from('reviews')
    .select('customer_id')
    .eq('id', reviewId)
    .single();
  
  if (!existingReview || existingReview.customer_id !== session.user.id) {
    return null;
  }
  
  const { data, error } = await supabase
    .from('reviews')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', reviewId)
    .select()
    .single();
  
  if (error || !data) return null;
  
  return {
    id: data.id,
    appointment_id: data.appointment_id,
    customer_id: data.customer_id,
    salon_id: data.salon_id,
    staff_id: data.staff_id,
    rating: data.rating,
    comment: data.comment,
    is_verified: data.is_verified ?? false,
    response: data.response,
    responded_at: data.responded_at,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
};

/**
 * Delete review (soft delete)
 */
export const deleteReview = async (reviewId: string): Promise<boolean> => {
  const result = await updateReview(reviewId, { is_verified: false });
  return result !== null;
};