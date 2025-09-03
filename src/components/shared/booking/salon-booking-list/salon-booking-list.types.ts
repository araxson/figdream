import type { Database } from '@/types/database.types'

export type Salon = Database['public']['Tables']['salons']['Row']
export type Service = Database['public']['Tables']['services']['Row']

export interface SalonWithDetails extends Salon {
  services?: Service[]
  reviewStats?: {
    average_rating: number | null
    total_reviews: number
  }
  categories?: string[]
}

export interface SalonBookingListProps {
  salons: SalonWithDetails[]
  searchQuery?: string
  selectedCategory?: string
  selectedLocation?: string
}