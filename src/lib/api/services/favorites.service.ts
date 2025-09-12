import { CustomerFavorite } from '@/types/features/favorites-types'

export async function fetchCustomerFavorites(): Promise<CustomerFavorite[]> {
  try {
    const response = await fetch('/api/customers/favorites')
    if (!response.ok) {
      throw new Error('Failed to fetch favorites')
    }
    const data = await response.json()
    return data
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching favorites:', error)
    }
    return []
  }
}

export async function removeFavorite(favoriteId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/customers/favorites/${favoriteId}`, {
      method: 'DELETE'
    })
    
    if (!response.ok) {
      throw new Error('Failed to remove favorite')
    }
    
    return true
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error removing favorite:', error)
    }
    return false
  }
}