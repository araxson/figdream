'use client'

import { useRouter } from 'next/navigation'
import { SalonSearch } from './salon-search'
import type { SalonSearchResult, SalonSearchFilters } from '../../types'

export function SalonSearchWrapper() {
  const router = useRouter()

  const handleSalonSelect = (salon: SalonSearchResult) => {
    router.push(`/customer/book/${salon.id}`)
  }

  const searchSalons = async (filters: SalonSearchFilters): Promise<SalonSearchResult[]> => {
    // TODO: Implement actual salon search with Supabase
    // For now, return mock data to prevent TypeScript errors
    return [
      {
        id: '1',
        name: 'Bella Beauty Salon',
        description: 'A full-service salon specializing in hair, nails, and beauty treatments.',
        shortDescription: 'Full-service salon with expert stylists',
        coverImageUrl: null,
        address: {
          city: 'San Francisco',
          state: 'CA',
          country: 'US'
        },
        rating: 4.5,
        reviewCount: 128,
        priceRange: '$$',
        features: ['Hair Styling', 'Nail Care', 'Facials'],
        isBookingAvailable: true,
        distance: 2.3
      }
    ]
  }

  const addToFavorites = async (salonId: string) => {
    // TODO: Implement add to favorites functionality
    console.log('Adding salon to favorites:', salonId)
  }

  return (
    <SalonSearch
      onSalonSelect={handleSalonSelect}
      searchSalons={searchSalons}
      addToFavorites={addToFavorites}
      favoriteIds={[]}
    />
  )
}