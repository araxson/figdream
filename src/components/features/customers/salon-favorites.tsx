'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Heart, MapPin, Phone, Calendar } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { CustomerFavorite } from '@/types/features/favorites-types'

interface SalonFavoritesProps {
  favorites: CustomerFavorite[]
  onRemove: (favoriteId: string) => void
}

export function SalonFavorites({ favorites, onRemove }: SalonFavoritesProps) {
  const router = useRouter()

  return (
    <>
      {favorites.map((favorite) => (
        <Card key={favorite.id} className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex gap-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback>
                  {favorite.salons?.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h4 className="font-semibold">{favorite.salons?.name}</h4>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {favorite.salons?.address}
                  </div>
                  {favorite.salons?.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {favorite.salons?.phone}
                    </div>
                  )}
                </div>
                {favorite.salons?.description && (
                  <p className="text-sm text-muted-foreground">
                    {favorite.salons.description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => router.push(`/customer/book/${favorite.salons?.id}`)}
              >
                <Calendar className="h-4 w-4 mr-1" />
                Book
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onRemove(favorite.id)}
              >
                <Heart className="h-4 w-4 fill-current" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </>
  )
}