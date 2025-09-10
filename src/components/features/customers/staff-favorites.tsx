import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Heart, Star, Calendar } from 'lucide-react'
import { CustomerFavorite } from './favorites-types'

interface StaffFavoritesProps {
  favorites: CustomerFavorite[]
  onRemove: (favoriteId: string) => void
}

export function StaffFavorites({ favorites, onRemove }: StaffFavoritesProps) {
  return (
    <>
      {favorites.map((favorite) => (
        <Card key={favorite.id} className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex gap-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback>
                  {favorite.staff_profiles?.profiles?.full_name
                    ?.split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h4 className="font-semibold">
                  {favorite.staff_profiles?.profiles?.full_name}
                </h4>
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">4.8 rating</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm">
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