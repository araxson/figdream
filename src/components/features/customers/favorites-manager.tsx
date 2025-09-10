'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Heart } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/hooks/ui/use-toast'
import { CustomerFavorite, FavoriteTab } from './favorites-types'
import { fetchCustomerFavorites, removeFavorite as removeFavoriteService } from './favorites-service'
import { SalonFavorites } from './salon-favorites'
import { ServiceFavorites } from './service-favorites'
import { StaffFavorites } from './staff-favorites'

export function CustomerFavoritesManager() {
  const [favorites, setFavorites] = useState<CustomerFavorite[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<FavoriteTab>('salons')
  const toast = useToast()

  const loadFavorites = useCallback(async () => {
    try {
      const data = await fetchCustomerFavorites()
      setFavorites(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadFavorites()
  }, [loadFavorites])

  async function removeFavorite(favoriteId: string) {
    const success = await removeFavoriteService(favoriteId)
    if (success) {
      toast.success('Removed from favorites')
      setFavorites(favorites.filter(f => f.id !== favoriteId))
    } else {
      toast.error('Failed to remove favorite')
    }
  }

  const salonFavorites = favorites.filter(f => f.favorite_type === 'salon' && f.salons)
  const serviceFavorites = favorites.filter(f => f.favorite_type === 'service' && f.services)
  const staffFavorites = favorites.filter(f => f.favorite_type === 'staff' && f.staff_profiles)

  const getCurrentFavorites = () => {
    switch (activeTab) {
      case 'salons':
        return salonFavorites
      case 'services':
        return serviceFavorites
      case 'staff':
        return staffFavorites
      default:
        return []
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Favorites</CardTitle>
          <CardDescription>Your favorite salons, services, and staff</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            Loading favorites...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>My Favorites</CardTitle>
            <CardDescription>Quick access to your preferred choices</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Heart className="h-3 w-3" />
              {favorites.length} total
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Tab Navigation */}
          <div className="flex gap-2 border-b">
            <button
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'salons'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-primary'
              }`}
              onClick={() => setActiveTab('salons')}
            >
              Salons ({salonFavorites.length})
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'services'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-primary'
              }`}
              onClick={() => setActiveTab('services')}
            >
              Services ({serviceFavorites.length})
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'staff'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-primary'
              }`}
              onClick={() => setActiveTab('staff')}
            >
              Staff ({staffFavorites.length})
            </button>
          </div>

          {/* Content */}
          {getCurrentFavorites().length === 0 ? (
            <div className="text-center py-8">
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No favorite {activeTab} yet
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Add favorites by clicking the heart icon when browsing
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeTab === 'salons' && (
                <SalonFavorites favorites={salonFavorites} onRemove={removeFavorite} />
              )}
              {activeTab === 'services' && (
                <ServiceFavorites favorites={serviceFavorites} onRemove={removeFavorite} />
              )}
              {activeTab === 'staff' && (
                <StaffFavorites favorites={staffFavorites} onRemove={removeFavorite} />
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}