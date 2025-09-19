// Customer Module Types - Barrel Exports
// Re-exporting from database types as source of truth

import type { Database } from '@/types/database.types';

// Customer-specific type aliases from Views
export type Customer = Database['public']['Views']['profiles']['Row'];
export type CustomerInsert = Database['public']['Views']['profiles']['Insert'];
export type CustomerUpdate = Database['public']['Views']['profiles']['Update'];

export type CustomerAppointment = Database['public']['Views']['appointments']['Row'];
export type CustomerAppointmentInsert = Database['public']['Views']['appointments']['Insert'];
export type CustomerAppointmentUpdate = Database['public']['Views']['appointments']['Update'];

export type CustomerFavorite = Database['public']['Views']['favorites']['Row'];
export type CustomerFavoriteInsert = Database['public']['Views']['favorites']['Insert'];

export type CustomerReview = Database['public']['Views']['reviews']['Row'];
export type CustomerReviewInsert = Database['public']['Views']['reviews']['Insert'];

export type CustomerLoyaltyMembership = Database['public']['Views']['loyalty_memberships']['Row'];
export type CustomerGiftCard = Database['public']['Views']['gift_cards']['Row'];

// Status enums
export type AppointmentStatus = Database['public']['Enums']['appointment_status'];
export type PaymentStatus = Database['public']['Enums']['payment_status'];

// Salon search types
export interface SalonSearchResult {
  id: string;
  name: string;
  description: string;
  shortDescription?: string;
  coverImageUrl?: string;
  address: {
    city: string;
    state: string;
    country: string;
  };
  rating: number;
  reviewCount: number;
  priceRange: string;
  features?: string[];
  isBookingAvailable: boolean;
  distance?: number;
}

export interface SalonSearchFilters {
  location?: string;
  services?: string[];
  rating?: number;
  distance?: number;
  priceRange?: [number, number];
}